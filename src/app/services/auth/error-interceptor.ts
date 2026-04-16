import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../ui/toast-service';

/**
 * Interceptor para capturar errores HTTP de forma global en la aplicación móvil/cliente.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Status 0: Sin conexión (backend apagado, modo avión, etc.)
      if (error.status === 0) {
        toastService.warning('No se pudo conectar con el servidor. Verifica tu conexión.');
      } 
      // Errores de servidor
      else if (error.status >= 500) {
        toastService.error('Error interno del servidor. Inténtalo de nuevo más tarde.');
      }
      // Otros errores (excluyendo 401 que maneja el authInterceptor)
      else if (error.status !== 401) {
        const message = error.error?.message || 'Ha ocurrido un error inesperado';
        // toastService.error(message);
      }

      console.error(`[Client HTTP Error ${error.status}]:`, error);
      return throwError(() => error);
    })
  );
};
