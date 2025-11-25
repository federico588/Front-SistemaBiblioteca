import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Usuario {
  id: string;
  nombre: string;
  nombre_usuario: string;
  email: string;
  telefono?: string;
  es_admin: boolean;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

export interface UsuarioCreate {
  nombre: string;
  nombre_usuario: string;
  email: string;
  contraseña: string;
  telefono?: string;
  es_admin?: boolean;
  id_usuario_creacion?: string;
}

export interface UsuarioUpdate {
  nombre?: string;
  nombre_usuario?: string;
  email?: string;
  contraseña?: string;
  telefono?: string;
  es_admin?: boolean;
  activo?: boolean;
  id_usuario_edicion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  constructor(private apiService: ApiService) {}

  getUsuarios(skip: number = 0, limit: number = 1000, includeInactive: boolean = false): Observable<Usuario[]> {
    return this.apiService.get<Usuario[]>('/usuarios', { skip, limit, include_inactive: includeInactive });
  }

  getUsuario(id: string): Observable<Usuario> {
    return this.apiService.get<Usuario>(`/usuarios/${id}`);
  }

  createUsuario(usuario: UsuarioCreate): Observable<Usuario> {
    return this.apiService.post<Usuario>('/usuarios', usuario);
  }

  updateUsuario(id: string, usuario: UsuarioUpdate): Observable<Usuario> {
    return this.apiService.put<Usuario>(`/usuarios/${id}`, usuario);
  }

  deleteUsuario(id: string): Observable<any> {
    return this.apiService.delete(`/usuarios/${id}`);
  }
}




