import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Item, ItemCreate, ItemService, ItemUpdate } from '../../../core/services/item.service';
import { LibroService } from '../../../core/services/libro.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PeriodicoService } from '../../../core/services/periodico.service';
import { RevistaService } from '../../../core/services/revista.service';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.scss'
})
export class ItemListComponent implements OnInit {
  items: Item[] = [];
  libros: any[] = [];
  revistas: any[] = [];
  periodicos: any[] = [];
  loading = false;
  showModal = false;
  editingItem: Item | null = null;
  itemForm!: FormGroup;
  searchTerm = '';

  constructor(
    private itemService: ItemService,
    private libroService: LibroService,
    private revistaService: RevistaService,
    private periodicoService: PeriodicoService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  initForm(): void {
    this.itemForm = this.fb.group({
      tipo_material: ['', Validators.required],
      id_material: ['', Validators.required],
      codigo_barras: [''],
      ubicacion: [''],
      estado_fisico: ['bueno'],
      disponible: [true],
      observaciones: ['']
    });

    // Cargar materiales cuando cambie el tipo
    this.itemForm.get('tipo_material')?.valueChanges.subscribe(() => {
      this.itemForm.patchValue({ id_material: '' });
      this.loadMateriales();
    });
  }

  ngOnInit(): void {
    this.loadItems();
    this.loadMateriales();
  }

  loadItems(): void {
    this.loading = true;
    this.itemService.getItems().subscribe({
      next: (response) => {
        this.items = Array.isArray(response) ? response : [];
        this.loading = false;
      },
      error: () => {
        this.notificationService.showError('Error al cargar items');
        this.loading = false;
      }
    });
  }

  loadMateriales(): void {
    const tipo = this.itemForm.get('tipo_material')?.value;
    if (tipo === 'libro') {
      this.libroService.getLibros().subscribe({
        next: (response) => {
          this.libros = Array.isArray(response) ? response : [];
        }
      });
    } else if (tipo === 'revista') {
      this.revistaService.getRevistas().subscribe({
        next: (response) => {
          this.revistas = Array.isArray(response) ? response : [];
        }
      });
    } else if (tipo === 'periodico') {
      this.periodicoService.getPeriodicos().subscribe({
        next: (response) => {
          this.periodicos = Array.isArray(response) ? response : [];
        }
      });
    }
  }

  get materialesDisponibles(): any[] {
    const tipo = this.itemForm.get('tipo_material')?.value;
    if (tipo === 'libro') return this.libros;
    if (tipo === 'revista') return this.revistas;
    if (tipo === 'periodico') return this.periodicos;
    return [];
  }

  openCreateModal(): void {
    this.editingItem = null;
    this.itemForm.reset({
      tipo_material: '',
      id_material: '',
      estado_fisico: 'bueno',
      disponible: true
    });
    this.showModal = true;
  }

  editItem(item: Item): void {
    this.editingItem = item;
    const tipo = item.tipo_item;
    this.itemForm.patchValue({
      tipo_material: tipo,
      id_material: item.id_libro || item.id_revista || item.id_periodico,
      codigo_barras: item.codigo_barras,
      ubicacion: item.ubicacion,
      estado_fisico: item.estado_fisico,
      disponible: item.disponible,
      observaciones: item.observaciones
    });
    this.loadMateriales();
    this.showModal = true;
  }

  saveItem(): void {
    if (this.itemForm.invalid) return;

    const formValue = this.itemForm.value;
    const idUsuario = this.authService.getValidUUIDForCreation();
    const tipo = formValue.tipo_material;

    if (this.editingItem) {
      // Para edición: NO incluir campos de material (id_libro, id_revista, id_periodico)
      // porque no se puede cambiar el tipo de material de un item existente
      const updateData: ItemUpdate = {
        codigo_barras: formValue.codigo_barras && formValue.codigo_barras.trim() !== '' 
          ? formValue.codigo_barras.trim() 
          : null,
        ubicacion: formValue.ubicacion && formValue.ubicacion.trim() !== '' 
          ? formValue.ubicacion.trim() 
          : null,
        estado_fisico: formValue.estado_fisico,
        disponible: formValue.disponible,
        observaciones: formValue.observaciones && formValue.observaciones.trim() !== '' 
          ? formValue.observaciones.trim() 
          : null,
        id_usuario_edicion: this.authService.getValidUUIDForEdition() || idUsuario
      };
      this.itemService.updateItem(this.editingItem.id, updateData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Item actualizado exitosamente');
          this.closeModal();
          this.loadItems();
        },
        error: () => this.notificationService.showError('Error al actualizar item')
      });
    } else {
      // Para creación: incluir el ID del material según el tipo
      const baseData: any = {
        codigo_barras: formValue.codigo_barras && formValue.codigo_barras.trim() !== '' 
          ? formValue.codigo_barras.trim() 
          : null,
        ubicacion: formValue.ubicacion && formValue.ubicacion.trim() !== '' 
          ? formValue.ubicacion.trim() 
          : null,
        estado_fisico: formValue.estado_fisico,
        disponible: formValue.disponible,
        observaciones: formValue.observaciones && formValue.observaciones.trim() !== '' 
          ? formValue.observaciones.trim() 
          : null,
      };

      // Agregar el ID del material según el tipo
      if (tipo === 'libro') {
        baseData.id_libro = formValue.id_material;
      } else if (tipo === 'revista') {
        baseData.id_revista = formValue.id_material;
      } else if (tipo === 'periodico') {
        baseData.id_periodico = formValue.id_material;
      }

      const createData: ItemCreate = {
        ...baseData,
        id_usuario_creacion: idUsuario
      };
      this.itemService.createItem(createData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Item creado exitosamente');
          this.closeModal();
          this.loadItems();
        },
        error: () => this.notificationService.showError('Error al crear item')
      });
    }
  }

  deleteItem(item: Item): void {
    const materialTitulo = item.material?.titulo || 'item';
    if (confirm(`¿Eliminar item de "${materialTitulo}"?`)) {
      this.itemService.deleteItem(item.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Item eliminado exitosamente');
          this.loadItems();
        },
        error: () => this.notificationService.showError('Error al eliminar item')
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.editingItem = null;
    this.itemForm.reset();
  }

  get filteredItems(): Item[] {
    if (!this.searchTerm) return this.items;
    const term = this.searchTerm.toLowerCase();
    return this.items.filter(i => 
      (i.material?.titulo || '').toLowerCase().includes(term) ||
      (i.codigo_barras || '').toLowerCase().includes(term) ||
      (i.ubicacion || '').toLowerCase().includes(term)
    );
  }

  getMaterialTitulo(item: Item): string {
    return item.material?.titulo || 'Sin material';
  }
}
