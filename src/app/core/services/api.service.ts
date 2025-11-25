import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse, PaginationParams } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return this.http.get<any>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  getPaginated<T>(endpoint: string, pagination: PaginationParams, filters?: any): Observable<PaginatedResponse<T>> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('skip', ((pagination.page - 1) * pagination.limit).toString());
    httpParams = httpParams.set('limit', pagination.limit.toString());
    
    if (pagination.sort) {
      httpParams = httpParams.set('sort', pagination.sort);
    }
    
    if (pagination.order) {
      httpParams = httpParams.set('order', pagination.order);
    }

    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          httpParams = httpParams.set(key, filters[key].toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<T>>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  post<T>(endpoint: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}${endpoint}`, data);
  }

  put<T>(endpoint: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}${endpoint}`, data);
  }

  patch<T>(endpoint: string, data: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}${endpoint}`, data);
  }

  delete<T>(endpoint: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}${endpoint}`);
  }
}




