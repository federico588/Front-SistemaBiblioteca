import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { AutorService } from '../../../core/services/autor.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { EditorialService } from '../../../core/services/editorial.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Revista, RevistaCreate, RevistaService, RevistaUpdate } from '../../../core/services/revista.service';

@Component({
  selector: 'app-revista-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './revista-list.component.html',
  styleUrl: './revista-list.component.scss'
})
export class RevistaListComponent implements OnInit {
  revistas: Revista[] = [];
  editoriales: any[] = [];
  autores: any[] = [];
  categorias: any[] = [];
  loading = false;
  showModal = false;
  editingRevista: Revista | null = null;
  revistaForm!: FormGroup;
  searchTerm = '';

  constructor(
    private revistaService: RevistaService,
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
    this.revistaForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(255)]],
      numero_publicacion: [''],
      id_editorial: ['', Validators.required],
      id_autor: ['', Validators.required],
      id_categoria: ['']
    });
  }

  ngOnInit(): void {
    this.loadRevistas();
    this.loadEditoriales();
    this.loadAutores();
    this.loadCategorias();
  }

  loadRevistas(): void {
    this.loading = true;
    this.revistaService.getRevistas().subscribe({
      next: (response) => {
        this.revistas = Array.isArray(response) ? response : [];
        this.loading = false;
      },
      error: () => {
        this.notificationService.showError('Error al cargar revistas');
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
    this.editingRevista = null;
    this.revistaForm.reset();
    this.showModal = true;
  }

  editRevista(revista: Revista): void {
    this.editingRevista = revista;
    this.revistaForm.patchValue(revista);
    this.showModal = true;
  }

  saveRevista(): void {
    if (this.revistaForm.invalid) return;

    const formValue = this.revistaForm.value;
    const idUsuario = this.authService.getValidUUIDForCreation();

    // Convertir cadenas vacías a null para campos opcionales
    const cleanFormValue = {
      ...formValue,
      id_categoria: formValue.id_categoria && formValue.id_categoria.trim() !== '' 
        ? formValue.id_categoria 
        : null,
      numero_publicacion: formValue.numero_publicacion && formValue.numero_publicacion.toString().trim() !== '' 
        ? formValue.numero_publicacion.toString().trim() 
        : null
    };

    if (this.editingRevista) {
      const updateData: RevistaUpdate = {
        ...cleanFormValue,
        id_usuario_edicion: this.authService.getValidUUIDForEdition() || idUsuario
      };
      this.revistaService.updateRevista(this.editingRevista.id, updateData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Revista actualizada exitosamente');
          this.closeModal();
          this.loadRevistas();
        },
        error: () => this.notificationService.showError('Error al actualizar revista')
      });
    } else {
      const createData: RevistaCreate = {
        ...cleanFormValue,
        id_usuario_creacion: idUsuario
      };
      this.revistaService.createRevista(createData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Revista creada exitosamente');
          this.closeModal();
          this.loadRevistas();
        },
        error: () => this.notificationService.showError('Error al crear revista')
      });
    }
  }

  deleteRevista(revista: Revista): void {
    if (confirm(`¿Eliminar revista ${revista.titulo}?`)) {
      this.revistaService.deleteRevista(revista.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Revista eliminada exitosamente');
          this.loadRevistas();
        },
        error: () => this.notificationService.showError('Error al eliminar revista')
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.editingRevista = null;
    this.revistaForm.reset();
  }

  get filteredRevistas(): Revista[] {
    if (!this.searchTerm) return this.revistas;
    const term = this.searchTerm.toLowerCase();
    return this.revistas.filter(r => r.titulo.toLowerCase().includes(term));
  }
}




