import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Autor, AutorCreate, AutorService, AutorUpdate } from '../../../core/services/autor.service';

@Component({
  selector: 'app-autor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './autor-list.component.html',
  styleUrl: './autor-list.component.scss'
})
export class AutorListComponent implements OnInit {
  autores: Autor[] = [];
  loading = false;
  showModal = false;
  editingAutor: Autor | null = null;
  autorForm!: FormGroup;
  searchTerm = '';

  constructor(
    private autorService: AutorService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  initForm(): void {
    this.autorForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      nacionalidad: ['', [Validators.required, Validators.maxLength(50)]],
      bibliografia: ['']
    });
  }

  ngOnInit(): void {
    this.loadAutores();
  }

  loadAutores(): void {
    this.loading = true;
    this.autorService.getAutores().subscribe({
      next: (response) => {
        this.autores = Array.isArray(response) ? response : [];
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar autores');
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.editingAutor = null;
    this.autorForm.reset();
    this.showModal = true;
  }

  editAutor(autor: Autor): void {
    this.editingAutor = autor;
    this.autorForm.patchValue(autor);
    this.showModal = true;
  }

  saveAutor(): void {
    if (this.autorForm.invalid) return;

    const formValue = this.autorForm.value;
    const idUsuario = this.authService.getValidUUIDForCreation();

    if (this.editingAutor) {
      const updateData: AutorUpdate = {
        ...formValue,
        id_usuario_edicion: this.authService.getValidUUIDForEdition() || idUsuario
      };
      this.autorService.updateAutor(this.editingAutor.id, updateData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Autor actualizado exitosamente');
          this.closeModal();
          this.loadAutores();
        },
        error: () => this.notificationService.showError('Error al actualizar autor')
      });
    } else {
      const createData: AutorCreate = {
        ...formValue,
        id_usuario_creacion: idUsuario
      };
      this.autorService.createAutor(createData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Autor creado exitosamente');
          this.closeModal();
          this.loadAutores();
        },
        error: () => this.notificationService.showError('Error al crear autor')
      });
    }
  }

  deleteAutor(autor: Autor): void {
    if (confirm(`¿Eliminar autor ${autor.nombre}?`)) {
      this.autorService.deleteAutor(autor.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Autor eliminado exitosamente');
          this.loadAutores();
        },
        error: () => this.notificationService.showError('Error al eliminar autor')
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.editingAutor = null;
    this.autorForm.reset();
  }

  get filteredAutores(): Autor[] {
    if (!this.searchTerm) return this.autores;
    const term = this.searchTerm.toLowerCase();
    return this.autores.filter(a => a.nombre.toLowerCase().includes(term));
  }
}




