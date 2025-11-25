import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';
import { ApiService } from './api.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    nombre_usuario?: string;
    activo: boolean;
    es_admin: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  nombre: string;
  nombre_usuario?: string;
  activo: boolean;
  es_admin?: boolean;
  rol: string;
}

export type UserRole = 'admin' | 'consumidor';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private readonly ROLE_KEY = 'user_role';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    const loginPayload = {
      nombre_usuario: credentials.email,
      contraseña: credentials.password
    };

    return this.apiService.post<LoginResponse>('/auth/login', loginPayload).pipe(
      map((response: LoginResponse) => {
        const loginResponse: LoginResponse = {
          access_token: response.access_token,
          token_type: response.token_type,
          user: {
            id: response.user.id,
            email: response.user.email,
            nombre: response.user.nombre,
            nombre_usuario: response.user.nombre_usuario,
            activo: response.user.activo,
            es_admin: response.user.es_admin
          }
        };

        return {
          success: true,
          message: 'Login exitoso',
          data: loginResponse,
          status: 200
        };
      }),
      catchError((error: any) => {
        // Extraer mensaje de error correctamente
        let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
        
        if (error?.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.detail) {
            errorMessage = error.error.detail;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.error) {
            errorMessage = error.error.error;
          }
        } else if (error?.message && typeof error.message === 'string') {
          errorMessage = error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getValidUUIDForCreation(): string {
    const currentUser = this.getCurrentUser();
    if (currentUser?.id) {
      const idStr = String(currentUser.id);
      if (this.isValidUUID(idStr)) {
        return idStr;
      }
    }
    return '00000000-0000-0000-0000-000000000000';
  }

  getValidUUIDForEdition(): string | undefined {
    const currentUser = this.getCurrentUser();
    if (currentUser?.id) {
      const idStr = String(currentUser.id);
      if (this.isValidUUID(idStr)) {
        return idStr;
      }
    }
    return undefined;
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  setUserData(loginResponse: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, loginResponse.access_token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(loginResponse.user));
    const role = loginResponse.user.es_admin ? 'admin' : 'consumidor';
    localStorage.setItem(this.ROLE_KEY, role);
    const user: User = {
      ...loginResponse.user,
      rol: role
    };
    this.currentUserSubject.next(user);
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem(this.USER_KEY);
    const roleData = localStorage.getItem(this.ROLE_KEY);
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const userWithRole: User = {
          ...user,
          rol: roleData as UserRole || (user.es_admin ? 'admin' : 'consumidor')
        };
        this.currentUserSubject.next(userWithRole);
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        this.logout();
      }
    }
  }

  getUserRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user?.rol as UserRole || null;
  }

  hasRole(role: UserRole): boolean {
    return this.getUserRole() === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isConsumidor(): boolean {
    return this.hasRole('consumidor');
  }

  canAccess(route: string): boolean {
    const role = this.getUserRole();
    
    if (!role) return false;

    if (role === 'admin') return true;

    if (role === 'consumidor') {
      const allowedRoutes = [
        'dashboard',
        'prestamos',
        'multas',
        'items'
      ];
      return allowedRoutes.includes(route.toLowerCase());
    }

    return true;
  }
}




