import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Editorial {
  id: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

export interface EditorialCreate {
  nombre: string;
  direccion?: string;
  telefono?: string;
  id_usuario_creacion: string;
}

export interface EditorialUpdate {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  id_usuario_edicion: string;
}

@Injectable({
  providedIn: 'root'
})
export class EditorialService {
  constructor(private apiService: ApiService) {}

  getEditoriales(skip: number = 0, limit: number = 1000): Observable<Editorial[]> {
    return this.apiService.get<Editorial[]>('/editoriales', { skip, limit });
  }

  getEditorial(id: string): Observable<Editorial> {
    return this.apiService.get<Editorial>(`/editoriales/${id}`);
  }

  createEditorial(editorial: EditorialCreate): Observable<Editorial> {
    return this.apiService.post<Editorial>('/editoriales', editorial);
  }

  updateEditorial(id: string, editorial: EditorialUpdate): Observable<Editorial> {
    return this.apiService.put<Editorial>(`/editoriales/${id}`, editorial);
  }

  deleteEditorial(id: string): Observable<any> {
    return this.apiService.delete(`/editoriales/${id}`);
  }
}




