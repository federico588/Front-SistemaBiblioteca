import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Multa, MultaCreate, MultaService, MultaUpdate } from '../../../core/services/multa.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PrestamoService } from '../../../core/services/prestamo.service';
import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-multa-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './multa-list.component.html',
  styleUrl: './multa-list.component.scss'
})
export class MultaListComponent implements OnInit {
  multas: Multa[] = [];
  prestamos: any[] = [];
  usuarios: any[] = [];
  loading = false;
  showModal = false;
  editingMulta: Multa | null = null;
  multaForm!: FormGroup;
  searchTerm = '';

  constructor(
    private multaService: MultaService,
    private prestamoService: PrestamoService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  initForm(): void {
    this.multaForm = this.fb.group({
      id_prestamo: ['', Validators.required],
      id_usuario: ['', Validators.required],
      monto: ['', [Validators.required, Validators.min(0.01)]],
      motivo: ['']
    });
  }

  ngOnInit(): void {
    this.loadMultas();
    this.loadPrestamos();
    this.loadUsuarios();
  }

  loadMultas(): void {
    this.loading = true;
    this.multaService.getMultas().subscribe({
      next: (response) => {
        this.multas = Array.isArray(response) ? response : [];
        this.loading = false;
      },
      error: () => {
        this.notificationService.showError('Error al cargar multas');
        this.loading = false;
      }
    });
  }

  loadPrestamos(): void {
    this.prestamoService.getPrestamos().subscribe({
      next: (response) => {
        this.prestamos = Array.isArray(response) ? response : [];
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
    this.editingMulta = null;
    this.multaForm.reset();
    this.showModal = true;
  }

  editMulta(multa: Multa): void {
    this.editingMulta = multa;
    this.multaForm.patchValue({
      id_prestamo: multa.id_prestamo,
      id_usuario: multa.id_usuario,
      monto: multa.monto,
      motivo: multa.motivo || ''
    });
    this.showModal = true;
  }

  saveMulta(): void {
    if (this.multaForm.invalid) return;

    const formValue = this.multaForm.value;
    const idUsuario = this.authService.getValidUUIDForCreation();

    if (this.editingMulta) {
      const updateData: MultaUpdate = {
        monto: parseFloat(formValue.monto),
        motivo: formValue.motivo || null,
        id_usuario_edicion: this.authService.getValidUUIDForEdition() || idUsuario
      };
      this.multaService.updateMulta(this.editingMulta.id, updateData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Multa actualizada exitosamente');
          this.closeModal();
          this.loadMultas();
        },
        error: () => this.notificationService.showError('Error al actualizar multa')
      });
    } else {
      const createData: MultaCreate = {
        id_prestamo: formValue.id_prestamo,
        id_usuario: formValue.id_usuario,
        monto: parseFloat(formValue.monto),
        motivo: formValue.motivo || null,
        id_usuario_creacion: idUsuario
      };
      this.multaService.createMulta(createData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Multa creada exitosamente');
          this.closeModal();
          this.loadMultas();
        },
        error: () => this.notificationService.showError('Error al crear multa')
      });
    }
  }

  pagarMulta(multa: Multa): void {
    if (confirm(`¿Marcar multa como pagada?`)) {
      const idUsuario = this.authService.getValidUUIDForEdition() || this.authService.getValidUUIDForCreation();
      this.multaService.pagarMulta(multa.id, idUsuario).subscribe({
        next: () => {
          this.notificationService.showSuccess('Multa marcada como pagada');
          this.loadMultas();
        },
        error: () => this.notificationService.showError('Error al pagar multa')
      });
    }
  }

  deleteMulta(multa: Multa): void {
    if (confirm(`¿Eliminar multa?`)) {
      this.multaService.deleteMulta(multa.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Multa eliminada exitosamente');
          this.loadMultas();
        },
        error: () => this.notificationService.showError('Error al eliminar multa')
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.editingMulta = null;
    this.multaForm.reset();
  }

  get filteredMultas(): Multa[] {
    if (!this.searchTerm) return this.multas;
    const term = this.searchTerm.toLowerCase();
    return this.multas.filter(m => m.id_prestamo.toLowerCase().includes(term) || m.id_usuario.toLowerCase().includes(term));
  }
}




