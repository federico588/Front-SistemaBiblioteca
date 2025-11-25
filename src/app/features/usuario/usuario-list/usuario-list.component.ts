import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Usuario, UsuarioCreate, UsuarioService, UsuarioUpdate } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.scss'
})
export class UsuarioListComponent implements OnInit {
  usuarios: Usuario[] = [];
  loading = false;
  skip = 0;
  limit = 1000;
  showModal = false;
  editingUsuario: Usuario | null = null;
  usuarioForm!: FormGroup;
  searchTerm = '';

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  initForm(): void {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      nombre_usuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      contraseña: ['', []], // Validación dinámica según si es creación o edición
      es_admin: [false]
    });
  }

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.loading = true;
    this.usuarioService.getUsuarios(this.skip, this.limit, false).subscribe({
      next: (response) => {
        this.usuarios = Array.isArray(response) ? response : [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.notificationService.showError('Error al cargar usuarios');
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.editingUsuario = null;
    this.usuarioForm.reset({
      nombre: '',
      nombre_usuario: '',
      email: '',
      telefono: '',
      contraseña: '',
      es_admin: false
    });
    // Hacer la contraseña requerida para creación
    this.usuarioForm.get('contraseña')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.usuarioForm.get('contraseña')?.updateValueAndValidity();
    this.showModal = true;
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  editUsuario(usuario: Usuario): void {
    this.editingUsuario = usuario;
    this.usuarioForm.patchValue({
      nombre: usuario.nombre,
      nombre_usuario: usuario.nombre_usuario,
      email: usuario.email,
      telefono: usuario.telefono || '',
      es_admin: usuario.es_admin,
      contraseña: ''
    });
    // La contraseña es opcional para edición
    this.usuarioForm.get('contraseña')?.setValidators([Validators.minLength(8)]);
    this.usuarioForm.get('contraseña')?.updateValueAndValidity();
    this.showModal = true;
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  saveUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.notificationService.showError('Por favor, completa todos los campos requeridos correctamente');
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.usuarioForm.controls).forEach(key => {
        this.usuarioForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.usuarioForm.value;
    
    // Validar que la contraseña esté presente al crear
    if (!this.editingUsuario && !formValue.contraseña) {
      this.notificationService.showError('La contraseña es obligatoria al crear un usuario');
      this.usuarioForm.get('contraseña')?.markAsTouched();
      return;
    }
    
    const idUsuarioCreacion = this.authService.getValidUUIDForCreation();

    if (this.editingUsuario) {
      const updateData: UsuarioUpdate = {
        nombre: formValue.nombre,
        nombre_usuario: formValue.nombre_usuario,
        email: formValue.email,
        telefono: formValue.telefono || null,
        es_admin: formValue.es_admin,
        id_usuario_edicion: this.authService.getValidUUIDForEdition() || idUsuarioCreacion
      };

      if (formValue.contraseña) {
        updateData.contraseña = formValue.contraseña;
      }

      this.usuarioService.updateUsuario(this.editingUsuario.id, updateData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Usuario actualizado exitosamente');
          this.closeModal();
          this.loadUsuarios();
        },
        error: (error) => {
          this.notificationService.showError(error.error?.detail || 'Error al actualizar usuario');
        }
      });
    } else {
      const createData: UsuarioCreate = {
        nombre: formValue.nombre,
        nombre_usuario: formValue.nombre_usuario,
        email: formValue.email,
        contraseña: formValue.contraseña,
        telefono: formValue.telefono || null,
        es_admin: formValue.es_admin || false
      };

      // Solo agregar id_usuario_creacion si es un UUID válido
      if (idUsuarioCreacion && idUsuarioCreacion !== '00000000-0000-0000-0000-000000000000') {
        createData.id_usuario_creacion = idUsuarioCreacion;
      }

      this.usuarioService.createUsuario(createData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Usuario creado exitosamente');
          this.closeModal();
          this.loadUsuarios();
        },
        error: (error) => {
          console.error('Error completo al crear usuario:', error);
          let errorMessage = 'Error al crear usuario';
          
          if (error?.error) {
            if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error.error.detail) {
              // El backend devuelve detail como objeto con message
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
              // Errores de validación de Pydantic
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

  deleteUsuario(usuario: Usuario): void {
    if (confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombre}?`)) {
      this.usuarioService.deleteUsuario(usuario.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Usuario eliminado exitosamente');
          this.loadUsuarios();
        },
        error: (error) => {
          this.notificationService.showError(error.error?.detail || 'Error al eliminar usuario');
        }
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.editingUsuario = null;
    this.usuarioForm.reset();
    // Limpiar cualquier estado residual
    document.body.style.overflow = '';
  }

  get filteredUsuarios(): Usuario[] {
    if (!this.searchTerm) return this.usuarios;
    const term = this.searchTerm.toLowerCase();
    return this.usuarios.filter(u => 
      u.nombre.toLowerCase().includes(term) ||
      u.nombre_usuario.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  }
}




