import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Revista {
  id: string;
  titulo: string;
  numero_publicacion?: string;
  id_editorial: string;
  id_autor: string;
  id_categoria?: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

export interface RevistaCreate {
  titulo: string;
  numero_publicacion?: string;
  id_editorial: string;
  id_autor: string;
  id_categoria?: string;
  id_usuario_creacion: string;
}

export interface RevistaUpdate {
  titulo?: string;
  numero_publicacion?: string;
  id_editorial?: string;
  id_autor?: string;
  id_categoria?: string;
  id_usuario_edicion: string;
}

@Injectable({
  providedIn: 'root'
})
export class RevistaService {
  constructor(private apiService: ApiService) {}

  getRevistas(skip: number = 0, limit: number = 1000): Observable<Revista[]> {
    return this.apiService.get<Revista[]>('/revistas', { skip, limit });
  }

  getRevista(id: string): Observable<Revista> {
    return this.apiService.get<Revista>(`/revistas/${id}`);
  }

  createRevista(revista: RevistaCreate): Observable<Revista> {
    return this.apiService.post<Revista>('/revistas', revista);
  }

  updateRevista(id: string, revista: RevistaUpdate): Observable<Revista> {
    return this.apiService.put<Revista>(`/revistas/${id}`, revista);
  }

  deleteRevista(id: string): Observable<any> {
    return this.apiService.delete(`/revistas/${id}`);
  }

  getItemsByRevista(revistaId: string, soloDisponibles: boolean = false): Observable<any[]> {
    return this.apiService.get<any[]>(`/revistas/${revistaId}/items`, { solo_disponibles: soloDisponibles });
  }
}




