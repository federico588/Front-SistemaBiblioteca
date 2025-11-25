import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Multa {
  id: string;
  id_prestamo: string;
  id_usuario: string;
  monto: number;
  motivo?: string;
  fecha_multa: string;
  fecha_pago?: string;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

export interface MultaCreate {
  id_prestamo: string;
  id_usuario: string;
  monto: number;
  motivo?: string;
  id_usuario_creacion: string;
}

export interface MultaUpdate {
  monto?: number;
  motivo?: string;
  fecha_pago?: string;
  estado?: string;
  id_usuario_edicion: string;
}

@Injectable({
  providedIn: 'root'
})
export class MultaService {
  constructor(private apiService: ApiService) {}

  getMultas(skip: number = 0, limit: number = 1000, estado?: string, idUsuario?: string): Observable<Multa[]> {
    const params: any = { skip, limit };
    if (estado) params.estado = estado;
    if (idUsuario) params.id_usuario = idUsuario;
    return this.apiService.get<Multa[]>('/multas', params);
  }

  getMulta(id: string): Observable<Multa> {
    return this.apiService.get<Multa>(`/multas/${id}`);
  }

  createMulta(multa: MultaCreate): Observable<Multa> {
    return this.apiService.post<Multa>('/multas', multa);
  }

  updateMulta(id: string, multa: MultaUpdate): Observable<Multa> {
    return this.apiService.put<Multa>(`/multas/${id}`, multa);
  }

  pagarMulta(id: string, idUsuarioEdicion: string): Observable<Multa> {
    return this.apiService.post<Multa>(`/multas/${id}/pagar`, { id_usuario_edicion: idUsuarioEdicion });
  }

  deleteMulta(id: string): Observable<any> {
    return this.apiService.delete(`/multas/${id}`);
  }
}




