import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../ui/toast-service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let isExpected404 = false;

      if (error.status === 0) {
        toastService.warning('No se pudo conectar con el servidor. Verifica tu conexión.');
      } else if (error.status >= 500) {
        toastService.error('Error interno del servidor. Inténtalo de nuevo más tarde.');
      } else if (error.status === 404 && (
        req.url.includes('/workout-logs/') || 
        req.url.includes('/neat-logs/') ||
        req.url.includes('/sessions/')
      )) {
        isExpected404 = true;
      } else if (error.status !== 401) {
        const message = error.error?.message || 'Ha ocurrido un error inesperado';
        toastService.error(message);
      }

      if (!isExpected404) {
        console.error(`[Client HTTP Error ${error.status}]:`, error);
      }
      return throwError(() => error);
    })
  );
};
