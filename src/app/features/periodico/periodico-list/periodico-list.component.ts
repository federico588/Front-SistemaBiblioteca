import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { AutorService } from '../../../core/services/autor.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { EditorialService } from '../../../core/services/editorial.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Periodico, PeriodicoCreate, PeriodicoService, PeriodicoUpdate } from '../../../core/services/periodico.service';

@Component({
  selector: 'app-periodico-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './periodico-list.component.html',
  styleUrl: './periodico-list.component.scss'
})
export class PeriodicoListComponent implements OnInit {
  periodicos: Periodico[] = [];
  editoriales: any[] = [];
  autores: any[] = [];
  categorias: any[] = [];
  loading = false;
  showModal = false;
  editingPeriodico: Periodico | null = null;
  periodicoForm!: FormGroup;
  searchTerm = '';

  constructor(
    private periodicoService: PeriodicoService,
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
    this.periodicoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(255)]],
      fecha_publicacion: ['', Validators.required],
      id_editorial: ['', Validators.required],
      id_autor: ['', Validators.required],
      id_categoria: ['']
    });
  }

  ngOnInit(): void {
    this.loadPeriodicos();
    this.loadEditoriales();
    this.loadAutores();
    this.loadCategorias();
  }

  loadPeriodicos(): void {
    this.loading = true;
    this.periodicoService.getPeriodicos().subscribe({
      next: (response) => {
        this.periodicos = Array.isArray(response) ? response : [];
        this.loading = false;
      },
      error: () => {
        this.notificationService.showError('Error al cargar periódicos');
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
    this.editingPeriodico = null;
    this.periodicoForm.reset();
    this.showModal = true;
  }

  editPeriodico(periodico: Periodico): void {
    this.editingPeriodico = periodico;
    this.periodicoForm.patchValue({
      ...periodico,
      fecha_publicacion: periodico.fecha_publicacion.split('T')[0]
    });
    this.showModal = true;
  }

  savePeriodico(): void {
    if (this.periodicoForm.invalid) return;

    const formValue = this.periodicoForm.value;
    const idUsuario = this.authService.getValidUUIDForCreation();

    // Convertir cadenas vacías a null para campos opcionales
    const cleanFormValue = {
      ...formValue,
      id_categoria: formValue.id_categoria && formValue.id_categoria.trim() !== '' 
        ? formValue.id_categoria 
        : null
    };

    if (this.editingPeriodico) {
      const updateData: PeriodicoUpdate = {
        ...cleanFormValue,
        fecha_publicacion: new Date(formValue.fecha_publicacion).toISOString(),
        id_usuario_edicion: this.authService.getValidUUIDForEdition() || idUsuario
      };
      this.periodicoService.updatePeriodico(this.editingPeriodico.id, updateData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Periódico actualizado exitosamente');
          this.closeModal();
          this.loadPeriodicos();
        },
        error: () => this.notificationService.showError('Error al actualizar periódico')
      });
    } else {
      const createData: PeriodicoCreate = {
        ...cleanFormValue,
        fecha_publicacion: new Date(formValue.fecha_publicacion).toISOString(),
        id_usuario_creacion: idUsuario
      };
      this.periodicoService.createPeriodico(createData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Periódico creado exitosamente');
          this.closeModal();
          this.loadPeriodicos();
        },
        error: () => this.notificationService.showError('Error al crear periódico')
      });
    }
  }

  deletePeriodico(periodico: Periodico): void {
    if (confirm(`¿Eliminar periódico ${periodico.titulo}?`)) {
      this.periodicoService.deletePeriodico(periodico.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Periódico eliminado exitosamente');
          this.loadPeriodicos();
        },
        error: () => this.notificationService.showError('Error al eliminar periódico')
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.editingPeriodico = null;
    this.periodicoForm.reset();
  }

  get filteredPeriodicos(): Periodico[] {
    if (!this.searchTerm) return this.periodicos;
    const term = this.searchTerm.toLowerCase();
    return this.periodicos.filter(p => p.titulo.toLowerCase().includes(term));
  }
}




