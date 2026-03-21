import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

// Interceptor que añade el token JWT y redirige al login si recibe 401
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // No añadir JWT a peticiones externas (ej. Cloudinary)
  if (req.url.includes('cloudinary.com')) {
    return next(req);
  }

  const token = localStorage.getItem('access_token');

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        localStorage.removeItem('access_token');
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    })
  );
};
