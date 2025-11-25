import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { AutorService } from '../../../core/services/autor.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { EditorialService } from '../../../core/services/editorial.service';
import { Libro, LibroCreate, LibroService, LibroUpdate } from '../../../core/services/libro.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-libro-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './libro-list.component.html',
  styleUrl: './libro-list.component.scss'
})
export class LibroListComponent implements OnInit {
  libros: Libro[] = [];
  editoriales: any[] = [];
  autores: any[] = [];
  categorias: any[] = [];
  loading = false;
  showModal = false;
  editingLibro: Libro | null = null;
  libroForm!: FormGroup;
  searchTerm = '';

  constructor(
    private libroService: LibroService,
    private editorialService: EditorialService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private autorService: AutorService,
    private categoriaService: CategoriaService
  ) {
    this.initForm();
  }

  initForm(): void {
    this.libroForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(255)]],
      isbn: [''],
      numero_paginas: [''],
      id_editorial: ['', Validators.required],
      id_autor: ['', Validators.required],
      id_categoria: ['']
    });
  }

  ngOnInit(): void {
    this.loadLibros();
    this.loadEditoriales();
    this.loadAutores();
    this.loadCategorias();
  }

  loadLibros(): void {
    this.loading = true;
    this.libroService.getLibros().subscribe({
      next: (response) => {
        this.libros = Array.isArray(response) ? response : [];
        this.loading = false;
      },
      error: () => {
        this.notificationService.showError('Error al cargar libros');
        this.loading = false;
      }
    });
  }

  loadEditoriales(): void {
    this.editorialService.getEditoriales().subscribe({
      next: (response) => {
        this.editoriales = Array.isArray(response) ? response : [];
      }
    });
  }

  loadAutores(): void {
    this.autorService.getAutores().subscribe({
      next: (response) => {
        this.autores = Array.isArray(response) ? response : [];
      }
    });
  }

  loadCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (response) => {
        this.categorias = Array.isArray(response) ? response : [];
      }
    });
  }

  openCreateModal(): void {
    this.editingLibro = null;
    this.libroForm.reset();
    this.showModal = true;
  }

  editLibro(libro: Libro): void {
    this.editingLibro = libro;
    this.libroForm.patchValue(libro);
    this.showModal = true;
  }

  saveLibro(): void {
    if (this.libroForm.invalid) return;

    const formValue = this.libroForm.value;
    const idUsuario = this.authService.getValidUUIDForCreation();

    // Convertir cadenas vacías a null para campos opcionales
    const cleanFormValue = {
      ...formValue,
      id_categoria: formValue.id_categoria && formValue.id_categoria.trim() !== '' 
        ? formValue.id_categoria 
        : null,
      isbn: formValue.isbn && formValue.isbn.trim() !== '' 
        ? formValue.isbn.trim() 
        : null,
      numero_paginas: formValue.numero_paginas && formValue.numero_paginas.toString().trim() !== '' 
        ? formValue.numero_paginas.toString().trim() 
        : null
    };

    if (this.editingLibro) {
      const updateData: LibroUpdate = {
        ...cleanFormValue,
        id_usuario_edicion: this.authService.getValidUUIDForEdition() || idUsuario
      };
      this.libroService.updateLibro(this.editingLibro.id, updateData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Libro actualizado exitosamente');
          this.closeModal();
          this.loadLibros();
        },
        error: () => this.notificationService.showError('Error al actualizar libro')
      });
    } else {
      const createData: LibroCreate = {
        ...cleanFormValue,
        id_usuario_creacion: idUsuario
      };
      this.libroService.createLibro(createData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Libro creado exitosamente');
          this.closeModal();
          this.loadLibros();
        },
        error: () => this.notificationService.showError('Error al crear libro')
      });
    }
  }

  deleteLibro(libro: Libro): void {
    if (confirm(`¿Eliminar libro ${libro.titulo}?`)) {
      this.libroService.deleteLibro(libro.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Libro eliminado exitosamente');
          this.loadLibros();
        },
        error: () => this.notificationService.showError('Error al eliminar libro')
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.editingLibro = null;
    this.libroForm.reset();
  }

  get filteredLibros(): Libro[] {
    if (!this.searchTerm) return this.libros;
    const term = this.searchTerm.toLowerCase();
    return this.libros.filter(l => l.titulo.toLowerCase().includes(term));
  }
}




