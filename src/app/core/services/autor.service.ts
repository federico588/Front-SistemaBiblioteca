import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Autor {
  id: string;
  nombre: string;
  nacionalidad: string;
  bibliografia?: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

export interface AutorCreate {
  nombre: string;
  nacionalidad: string;
  bibliografia?: string;
  id_usuario_creacion: string;
}

export interface AutorUpdate {
  nombre?: string;
  nacionalidad?: string;
  bibliografia?: string;
  id_usuario_edicion: string;
}

@Injectable({
  providedIn: 'root'
})
export class AutorService {
  constructor(private apiService: ApiService) {}

  getAutores(skip: number = 0, limit: number = 1000): Observable<Autor[]> {
    return this.apiService.get<Autor[]>('/autores', { skip, limit });
  }

  getAutor(id: string): Observable<Autor> {
    return this.apiService.get<Autor>(`/autores/${id}`);
  }

  createAutor(autor: AutorCreate): Observable<Autor> {
    return this.apiService.post<Autor>('/autores', autor);
  }

  updateAutor(id: string, autor: AutorUpdate): Observable<Autor> {
    return this.apiService.put<Autor>(`/autores/${id}`, autor);
  }

  deleteAutor(id: string): Observable<any> {
    return this.apiService.delete(`/autores/${id}`);
  }
}




