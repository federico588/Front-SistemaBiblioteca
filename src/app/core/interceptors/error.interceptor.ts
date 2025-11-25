import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';
      const isLoginRoute = req.url.includes('/auth/login');

      // Extraer mensaje de error del backend
      if (error.error) {
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error.detail) {
          // El backend puede devolver detail como objeto o string
          if (typeof error.error.detail === 'string') {
            errorMessage = error.error.detail;
          } else if (error.error.detail.message) {
            // Formato del APIErrorHandler: { error_type, message, success, details }
            errorMessage = error.error.detail.message;
          } else if (error.error.detail.error_type) {
            errorMessage = error.error.detail.message || error.error.detail.error_type;
          } else {
            errorMessage = JSON.stringify(error.error.detail);
          }
        } else if (error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error.error) {
          errorMessage = error.error.error;
        } else if (Array.isArray(error.error)) {
          // Errores de validación de Pydantic
          errorMessage = error.error.map((e: any) => {
            if (typeof e === 'string') return e;
            const field = e.loc ? e.loc.join('.') : e.field || 'campo';
            const msg = e.msg || e.message || 'Error de validación';
            return `${field}: ${msg}`;
          }).join(', ');
        }
      }

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 400:
            if (!errorMessage || errorMessage === 'Ha ocurrido un error inesperado') {
              // Si hay errores de validación, ya fueron extraídos arriba
              if (Array.isArray(error.error)) {
                // Ya se procesó arriba
              } else {
                errorMessage = 'Solicitud incorrecta. Verifica los datos ingresados';
              }
            }
            break;
          case 401:
            // No hacer logout si estamos en la ruta de login
            if (!isLoginRoute) {
              errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente';
              authService.logout();
            } else {
              // Para login, usar el mensaje del backend o uno genérico
              if (!errorMessage || errorMessage === 'Ha ocurrido un error inesperado') {
                errorMessage = 'Credenciales incorrectas. Verifica tu usuario y contraseña';
              }
            }
            break;
          case 403:
            if (!errorMessage || errorMessage === 'Ha ocurrido un error inesperado') {
              errorMessage = 'Acceso denegado';
            }
            break;
          case 404:
            if (!errorMessage || errorMessage === 'Ha ocurrido un error inesperado') {
              errorMessage = 'Recurso no encontrado';
            }
            break;
          case 422:
            if (!errorMessage || errorMessage === 'Ha ocurrido un error inesperado') {
              errorMessage = 'Datos de entrada inválidos';
            }
            break;
          case 500:
            if (!errorMessage || errorMessage === 'Ha ocurrido un error inesperado') {
              errorMessage = 'Error interno del servidor';
            }
            break;
          default:
            if (!errorMessage || errorMessage === 'Ha ocurrido un error inesperado') {
              errorMessage = `Error ${error.status}: ${error.message || 'Error desconocido'}`;
            }
        }
      }

      // Solo mostrar notificación si NO es la ruta de login (el componente manejará su propio error)
      if (!isLoginRoute) {
        notificationService.showError(errorMessage);
      }

      // Crear un error con el mensaje extraído
      const customError = new Error(errorMessage);
      (customError as any).status = error.status;
      (customError as any).error = error.error;
      
      return throwError(() => customError);
    })
  );
};




