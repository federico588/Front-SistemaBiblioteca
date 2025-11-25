import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Editorial, EditorialCreate, EditorialService, EditorialUpdate } from '../../../core/services/editorial.service';

@Component({
  selector: 'app-editorial-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './editorial-list.component.html',
  styleUrl: './editorial-list.component.scss'
})
export class EditorialListComponent implements OnInit {
  editoriales: Editorial[] = [];
  loading = false;
  showModal = false;
  editingEditorial: Editorial | null = null;
  editorialForm!: FormGroup;
  searchTerm = '';

  constructor(
    private editorialService: EditorialService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  initForm(): void {
    this.editorialForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      direccion: [''],
      telefono: ['']
    });
  }

  ngOnInit(): void {
    this.loadEditoriales();
  }

  loadEditoriales(): void {
    this.loading = true;
    this.editorialService.getEditoriales().subscribe({
      next: (response) => {
        this.editoriales = Array.isArray(response) ? response : [];
        this.loading = false;
      },
      error: () => {
        this.notificationService.showError('Error al cargar editoriales');
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.editingEditorial = null;
    this.editorialForm.reset();
    this.showModal = true;
  }

  editEditorial(editorial: Editorial): void {
    this.editingEditorial = editorial;
    this.editorialForm.patchValue(editorial);
    this.showModal = true;
  }

  saveEditorial(): void {
    if (this.editorialForm.invalid) return;

    const formValue = this.editorialForm.value;
    const idUsuario = this.authService.getValidUUIDForCreation();

    if (this.editingEditorial) {
      const updateData: EditorialUpdate = {
        ...formValue,
        id_usuario_edicion: this.authService.getValidUUIDForEdition() || idUsuario
      };
      this.editorialService.updateEditorial(this.editingEditorial.id, updateData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Editorial actualizada exitosamente');
          this.closeModal();
          this.loadEditoriales();
        },
        error: () => this.notificationService.showError('Error al actualizar editorial')
      });
    } else {
      const createData: EditorialCreate = {
        ...formValue,
        id_usuario_creacion: idUsuario
      };
      this.editorialService.createEditorial(createData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Editorial creada exitosamente');
          this.closeModal();
          this.loadEditoriales();
        },
        error: () => this.notificationService.showError('Error al crear editorial')
      });
    }
  }

  deleteEditorial(editorial: Editorial): void {
    if (confirm(`¿Eliminar editorial ${editorial.nombre}?`)) {
      this.editorialService.deleteEditorial(editorial.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Editorial eliminada exitosamente');
          this.loadEditoriales();
        },
        error: () => this.notificationService.showError('Error al eliminar editorial')
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.editingEditorial = null;
    this.editorialForm.reset();
  }

  get filteredEditoriales(): Editorial[] {
    if (!this.searchTerm) return this.editoriales;
    const term = this.searchTerm.toLowerCase();
    return this.editoriales.filter(e => e.nombre.toLowerCase().includes(term));
  }
}




