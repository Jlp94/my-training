import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, tap } from 'rxjs';
import { HttpCacheService } from '../cache/http-cache.service';

/**
 * Interceptor de caché para el Cliente Ionic.
 * Mejora el rendimiento al reutilizar respuestas de peticiones GET previas.
 */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(HttpCacheService);

  // Solo cacheamos GET. Invalidamos todo en escrituras.
  if (req.method !== 'GET') {
    cacheService.clear();
    return next(req);
  }

  const cachedResponse = cacheService.get(req.urlWithParams);
  if (cachedResponse) {
    return of(cachedResponse);
  }

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        cacheService.put(req.urlWithParams, event);
      }
    })
  );
};
