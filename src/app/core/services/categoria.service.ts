import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

export interface CategoriaCreate {
  nombre: string;
  descripcion?: string;
  id_usuario_creacion: string;
}

export interface CategoriaUpdate {
  nombre?: string;
  descripcion?: string;
  id_usuario_edicion: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  constructor(private apiService: ApiService) {}

  getCategorias(skip: number = 0, limit: number = 1000): Observable<Categoria[]> {
    return this.apiService.get<Categoria[]>('/categorias', { skip, limit });
  }

  getCategoria(id: string): Observable<Categoria> {
    return this.apiService.get<Categoria>(`/categorias/${id}`);
  }

  createCategoria(categoria: CategoriaCreate): Observable<Categoria> {
    return this.apiService.post<Categoria>('/categorias', categoria);
  }

  updateCategoria(id: string, categoria: CategoriaUpdate): Observable<Categoria> {
    return this.apiService.put<Categoria>(`/categorias/${id}`, categoria);
  }

  deleteCategoria(id: string): Observable<any> {
    return this.apiService.delete(`/categorias/${id}`);
  }
}




