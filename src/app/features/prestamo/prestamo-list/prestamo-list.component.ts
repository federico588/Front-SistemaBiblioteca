import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ItemService } from '../../../core/services/item.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Prestamo, PrestamoCreate, PrestamoService, PrestamoUpdate } from '../../../core/services/prestamo.service';
import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-prestamo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './prestamo-list.component.html',
  styleUrl: './prestamo-list.component.scss'
})
export class PrestamoListComponent implements OnInit {
  prestamos: Prestamo[] = [];
  items: any[] = [];
  usuarios: any[] = [];
  loading = false;
  showModal = false;
  editingPrestamo: Prestamo | null = null;
  prestamoForm!: FormGroup;
  searchTerm = '';

  constructor(
    private prestamoService: PrestamoService,
    private itemService: ItemService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  initForm(): void {
    this.prestamoForm = this.fb.group({
      id_item: ['', Validators.required],
      id_usuario: ['', Validators.required],
      fecha_devolucion_estimada: ['']
    });
  }

  ngOnInit(): void {
    this.loadPrestamos();
    this.loadItems();
    this.loadUsuarios();
  }

  loadPrestamos(): void {
    this.loading = true;
    this.prestamoService.getPrestamos().subscribe({
      next: (response) => {
        this.prestamos = Array.isArray(response) ? response : [];
        this.loading = false;
      },
      error: () => {
        this.notificationService.showError('Error al cargar préstamos');
        this.loading = false;
      }
    });
  }

  loadItems(): void {
    this.itemService.getItems(0, 1000, true).subscribe({
      next: (response) => {
        this.items = Array.isArray(response) ? response : [];
      }
    });
  }

  loadUsuarios(): void {
    this.usuarioService.getUsuarios(0, 1000, false).subscribe({
      next: (response) => {
        this.usuarios = Array.isArray(response) ? response : [];
      }
    });
  }

  openCreateModal(): void {
    this.editingPrestamo = null;
    this.prestamoForm.reset();
    // Habilitar campos para creación
    this.prestamoForm.get('id_item')?.enable();
    this.prestamoForm.get('id_usuario')?.enable();
    this.showModal = true;
  }

  editPrestamo(prestamo: Prestamo): void {
    this.editingPrestamo = prestamo;
    this.prestamoForm.patchValue({
      id_item: prestamo.id_item,
      id_usuario: prestamo.id_usuario,
      fecha_devolucion_estimada: prestamo.fecha_devolucion_estimada.split('T')[0]
    });
    // Deshabilitar campos para edición
    this.prestamoForm.get('id_item')?.disable();
    this.prestamoForm.get('id_usuario')?.disable();
    this.showModal = true;
  }

  savePrestamo(): void {
    if (this.prestamoForm.invalid) return;

    const formValue = this.prestamoForm.value;
    const idUsuario = this.authService.getValidUUIDForCreation();

    if (this.editingPrestamo) {
      const updateData: PrestamoUpdate = {
        fecha_devolucion_estimada: formValue.fecha_devolucion_estimada ? new Date(formValue.fecha_devolucion_estimada).toISOString() : undefined,
        id_usuario_edicion: this.authService.getValidUUIDForEdition() || idUsuario
      };
      this.prestamoService.updatePrestamo(this.editingPrestamo.id, updateData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Préstamo actualizado exitosamente');
          this.closeModal();
          this.loadPrestamos();
        },
        error: () => this.notificationService.showError('Error al actualizar préstamo')
      });
    } else {
      // Obtener valores incluso si están deshabilitados
      const idItem = this.prestamoForm.get('id_item')?.value || formValue.id_item;
      const idUsuarioPrestamo = this.prestamoForm.get('id_usuario')?.value || formValue.id_usuario;
      
      if (!idItem || !idUsuarioPrestamo) {
        this.notificationService.showError('Item y Usuario son obligatorios');
        return;
      }

      // Obtener id_usuario_creacion (el que crea el préstamo, no el que recibe)
      const idUsuarioCreacion = this.authService.getValidUUIDForCreation();
      const validIdCreacion = (idUsuarioCreacion && idUsuarioCreacion !== '00000000-0000-0000-0000-000000000000') 
        ? idUsuarioCreacion 
        : '00000000-0000-0000-0000-000000000000';

      const createData: PrestamoCreate = {
        id_item: idItem,
        id_usuario: idUsuarioPrestamo,
        fecha_devolucion_estimada: formValue.fecha_devolucion_estimada ? new Date(formValue.fecha_devolucion_estimada).toISOString() : undefined,
        id_usuario_creacion: validIdCreacion
      };

      this.prestamoService.createPrestamo(createData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Préstamo creado exitosamente');
          this.closeModal();
          this.loadPrestamos();
        },
        error: (error) => {
          console.error('Error completo al crear préstamo:', error);
          let errorMessage = 'Error al crear préstamo';
          
          if (error?.error) {
            if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error.error.detail) {
              if (typeof error.error.detail === 'string') {
                errorMessage = error.error.detail;
              } else if (error.error.detail.message) {
                errorMessage = error.error.detail.message;
              } else {
                errorMessage = JSON.stringify(error.error.detail);
              }
            } else if (error.error.message) {
              errorMessage = error.error.message;
            } else if (Array.isArray(error.error)) {
              errorMessage = error.error.map((e: any) => {
                if (typeof e === 'string') return e;
                const field = e.loc ? e.loc.join('.') : e.field || 'campo';
                const msg = e.msg || e.message || 'Error de validación';
                return `${field}: ${msg}`;
              }).join(', ');
            }
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          this.notificationService.showError(errorMessage);
        }
      });
    }
  }

  devolverPrestamo(prestamo: Prestamo): void {
    if (confirm(`¿Marcar préstamo como devuelto?`)) {
      const idUsuario = this.authService.getValidUUIDForEdition() || this.authService.getValidUUIDForCreation();
      
      if (!idUsuario || idUsuario === '00000000-0000-0000-0000-000000000000') {
        this.notificationService.showError('Error: Debe estar autenticado para devolver un préstamo');
        return;
      }
      
      this.prestamoService.devolverPrestamo(prestamo.id, idUsuario).subscribe({
        next: () => {
          this.notificationService.showSuccess('Préstamo marcado como devuelto');
          this.loadPrestamos();
        },
        error: (error) => {
          console.error('Error al devolver préstamo:', error);
          let errorMessage = 'Error al devolver préstamo';
          if (error?.error) {
            if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error.error.detail) {
              if (typeof error.error.detail === 'string') {
                errorMessage = error.error.detail;
              } else if (error.error.detail.message) {
                errorMessage = error.error.detail.message;
              }
            }
          }
          this.notificationService.showError(errorMessage);
        }
      });
    }
  }

  deletePrestamo(prestamo: Prestamo): void {
    if (confirm(`¿Eliminar préstamo?`)) {
      this.prestamoService.deletePrestamo(prestamo.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Préstamo eliminado exitosamente');
          this.loadPrestamos();
        },
        error: () => this.notificationService.showError('Error al eliminar préstamo')
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.editingPrestamo = null;
    this.prestamoForm.reset();
  }

  get filteredPrestamos(): Prestamo[] {
    if (!this.searchTerm) return this.prestamos;
    const term = this.searchTerm.toLowerCase();
    return this.prestamos.filter(p => p.id_item.toLowerCase().includes(term) || p.id_usuario.toLowerCase().includes(term));
  }
}




