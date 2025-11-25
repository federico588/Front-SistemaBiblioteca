import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ItemMaterial {
  id: string;
  titulo: string;
  tipo: 'libro' | 'revista' | 'periodico';
  isbn?: string;
  numero_publicacion?: string;
  fecha_publicacion?: string;
}

export interface Item {
  id: string;
  id_libro?: string;
  id_revista?: string;
  id_periodico?: string;
  tipo_item: 'libro' | 'revista' | 'periodico';
  codigo_barras?: string;
  ubicacion?: string;
  estado_fisico: string;
  disponible: boolean;
  observaciones?: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
  material?: ItemMaterial;
}

export interface ItemCreate {
  id_libro?: string;
  id_revista?: string;
  id_periodico?: string;
  codigo_barras?: string;
  ubicacion?: string;
  estado_fisico?: string;
  disponible?: boolean;
  observaciones?: string;
  id_usuario_creacion: string;
}

export interface ItemUpdate {
  id_libro?: string;
  id_revista?: string;
  id_periodico?: string;
  codigo_barras?: string;
  ubicacion?: string;
  estado_fisico?: string;
  disponible?: boolean;
  observaciones?: string;
  id_usuario_edicion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  constructor(private apiService: ApiService) {}

  getItems(
    skip: number = 0,
    limit: number = 1000,
    soloDisponibles: boolean = false,
    idLibro?: string,
    idRevista?: string,
    idPeriodico?: string
  ): Observable<Item[]> {
    const params: any = { skip, limit, solo_disponibles: soloDisponibles };
    if (idLibro) params.id_libro = idLibro;
    if (idRevista) params.id_revista = idRevista;
    if (idPeriodico) params.id_periodico = idPeriodico;
    return this.apiService.get<Item[]>('/items', params);
  }

  getItem(id: string): Observable<Item> {
    return this.apiService.get<Item>(`/items/${id}`);
  }

  createItem(item: ItemCreate): Observable<Item> {
    return this.apiService.post<Item>('/items', item);
  }

  updateItem(id: string, item: ItemUpdate): Observable<Item> {
    return this.apiService.put<Item>(`/items/${id}`, item);
  }

  deleteItem(id: string): Observable<any> {
    return this.apiService.delete(`/items/${id}`);
  }

  getItemsByMaterial(tipo: 'libro' | 'revista' | 'periodico', materialId: string, soloDisponibles: boolean = false): Observable<Item[]> {
    return this.apiService.get<Item[]>(`/items/por-material/${tipo}/${materialId}`, { solo_disponibles: soloDisponibles });
  }
}
