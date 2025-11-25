import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Categoria, CategoriaCreate, CategoriaService, CategoriaUpdate } from '../../../core/services/categoria.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './categoria-list.component.html',
  styleUrl: './categoria-list.component.scss'
})
export class CategoriaListComponent implements OnInit {
  categorias: Categoria[] = [];
  loading = false;
  showModal = false;
  editingCategoria: Categoria | null = null;
  categoriaForm!: FormGroup;
  searchTerm = '';

  constructor(
    private categoriaService: CategoriaService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  initForm(): void {
    this.categoriaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias(): void {
    this.loading = true;
    this.categoriaService.getCategorias().subscribe({
      next: (response) => {
        this.categorias = Array.isArray(response) ? response : [];
        this.loading = false;
      },
      error: () => {
        this.notificationService.showError('Error al cargar categorías');
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.editingCategoria = null;
    this.categoriaForm.reset();
    this.showModal = true;
  }

  editCategoria(categoria: Categoria): void {
    this.editingCategoria = categoria;
    this.categoriaForm.patchValue(categoria);
    this.showModal = true;
  }

  saveCategoria(): void {
    if (this.categoriaForm.invalid) return;

    const formValue = this.categoriaForm.value;
    const idUsuario = this.authService.getValidUUIDForCreation();

    if (this.editingCategoria) {
      const updateData: CategoriaUpdate = {
        ...formValue,
        id_usuario_edicion: this.authService.getValidUUIDForEdition() || idUsuario
      };
      this.categoriaService.updateCategoria(this.editingCategoria.id, updateData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Categoría actualizada exitosamente');
          this.closeModal();
          this.loadCategorias();
        },
        error: () => this.notificationService.showError('Error al actualizar categoría')
      });
    } else {
      const createData: CategoriaCreate = {
        ...formValue,
        id_usuario_creacion: idUsuario
      };
      this.categoriaService.createCategoria(createData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Categoría creada exitosamente');
          this.closeModal();
          this.loadCategorias();
        },
        error: () => this.notificationService.showError('Error al crear categoría')
      });
    }
  }

  deleteCategoria(categoria: Categoria): void {
    if (confirm(`¿Eliminar categoría ${categoria.nombre}?`)) {
      this.categoriaService.deleteCategoria(categoria.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Categoría eliminada exitosamente');
          this.loadCategorias();
        },
        error: () => this.notificationService.showError('Error al eliminar categoría')
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.editingCategoria = null;
    this.categoriaForm.reset();
  }

  get filteredCategorias(): Categoria[] {
    if (!this.searchTerm) return this.categorias;
    const term = this.searchTerm.toLowerCase();
    return this.categorias.filter(c => c.nombre.toLowerCase().includes(term));
  }
}




