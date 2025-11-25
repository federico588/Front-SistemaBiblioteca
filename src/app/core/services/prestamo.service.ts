import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Prestamo {
  id: string;
  id_item: string;
  id_usuario: string;
  fecha_prestamo: string;
  fecha_devolucion_estimada: string;
  fecha_devolucion_real?: string;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

export interface PrestamoCreate {
  id_item: string;
  id_usuario: string;
  id_usuario_creacion: string;
  fecha_devolucion_estimada?: string;
}

export interface PrestamoUpdate {
  fecha_devolucion_estimada?: string;
  fecha_devolucion_real?: string;
  estado?: string;
  id_usuario_edicion: string;
}

@Injectable({
  providedIn: 'root'
})
export class PrestamoService {
  constructor(private apiService: ApiService) {}

  getPrestamos(skip: number = 0, limit: number = 1000, estado?: string, idUsuario?: string): Observable<Prestamo[]> {
    const params: any = { skip, limit };
    if (estado) params.estado = estado;
    if (idUsuario) params.id_usuario = idUsuario;
    return this.apiService.get<Prestamo[]>('/prestamos', params);
  }

  getPrestamo(id: string): Observable<Prestamo> {
    return this.apiService.get<Prestamo>(`/prestamos/${id}`);
  }

  createPrestamo(prestamo: PrestamoCreate): Observable<Prestamo> {
    return this.apiService.post<Prestamo>('/prestamos', prestamo);
  }

  updatePrestamo(id: string, prestamo: PrestamoUpdate): Observable<Prestamo> {
    return this.apiService.put<Prestamo>(`/prestamos/${id}`, prestamo);
  }

  devolverPrestamo(id: string, idUsuarioEdicion: string): Observable<Prestamo> {
    return this.apiService.post<Prestamo>(`/prestamos/${id}/devolver`, { id_usuario_edicion: idUsuarioEdicion });
  }

  deletePrestamo(id: string): Observable<any> {
    return this.apiService.delete(`/prestamos/${id}`);
  }
}




