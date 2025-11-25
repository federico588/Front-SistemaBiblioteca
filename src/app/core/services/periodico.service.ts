import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Periodico {
  id: string;
  titulo: string;
  fecha_publicacion: string;
  id_editorial: string;
  id_autor: string;
  id_categoria?: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

export interface PeriodicoCreate {
  titulo: string;
  fecha_publicacion: string;
  id_editorial: string;
  id_autor: string;
  id_categoria?: string;
  id_usuario_creacion: string;
}

export interface PeriodicoUpdate {
  titulo?: string;
  fecha_publicacion?: string;
  id_editorial?: string;
  id_autor?: string;
  id_categoria?: string;
  id_usuario_edicion: string;
}

@Injectable({
  providedIn: 'root'
})
export class PeriodicoService {
  constructor(private apiService: ApiService) {}

  getPeriodicos(skip: number = 0, limit: number = 1000): Observable<Periodico[]> {
    return this.apiService.get<Periodico[]>('/periodicos', { skip, limit });
  }

  getPeriodico(id: string): Observable<Periodico> {
    return this.apiService.get<Periodico>(`/periodicos/${id}`);
  }

  createPeriodico(periodico: PeriodicoCreate): Observable<Periodico> {
    return this.apiService.post<Periodico>('/periodicos', periodico);
  }

  updatePeriodico(id: string, periodico: PeriodicoUpdate): Observable<Periodico> {
    return this.apiService.put<Periodico>(`/periodicos/${id}`, periodico);
  }

  deletePeriodico(id: string): Observable<any> {
    return this.apiService.delete(`/periodicos/${id}`);
  }

  getItemsByPeriodico(periodicoId: string, soloDisponibles: boolean = false): Observable<any[]> {
    return this.apiService.get<any[]>(`/periodicos/${periodicoId}/items`, { solo_disponibles: soloDisponibles });
  }
}




