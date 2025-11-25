import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Libro {
  id: string;
  titulo: string;
  isbn?: string;
  numero_paginas?: string;
  id_editorial: string;
  id_autor: string;
  id_categoria?: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

export interface LibroCreate {
  titulo: string;
  isbn?: string;
  numero_paginas?: string;
  id_editorial: string;
  id_autor: string;
  id_categoria?: string;
  id_usuario_creacion: string;
}

export interface LibroUpdate {
  titulo?: string;
  isbn?: string;
  numero_paginas?: string;
  id_editorial?: string;
  id_autor?: string;
  id_categoria?: string;
  id_usuario_edicion: string;
}

@Injectable({
  providedIn: 'root'
})
export class LibroService {
  constructor(private apiService: ApiService) {}

  getLibros(skip: number = 0, limit: number = 1000): Observable<Libro[]> {
    return this.apiService.get<Libro[]>('/libros', { skip, limit });
  }

  getLibro(id: string): Observable<Libro> {
    return this.apiService.get<Libro>(`/libros/${id}`);
  }

  createLibro(libro: LibroCreate): Observable<Libro> {
    return this.apiService.post<Libro>('/libros', libro);
  }

  updateLibro(id: string, libro: LibroUpdate): Observable<Libro> {
    return this.apiService.put<Libro>(`/libros/${id}`, libro);
  }

  deleteLibro(id: string): Observable<any> {
    return this.apiService.delete(`/libros/${id}`);
  }

  getItemsByLibro(libroId: string, soloDisponibles: boolean = false): Observable<any[]> {
    return this.apiService.get<any[]>(`/libros/${libroId}/items`, { solo_disponibles: soloDisponibles });
  }
}




