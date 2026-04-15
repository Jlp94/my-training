import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth-service';
import { map } from 'rxjs';

// Guard asíncrono que verifica:
// 1. Que exista un token en localStorage
// 2. Que el token NO haya expirado
// 3. Que el servidor esté vivo (cold start de Render)
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Paso 1 y 2: ¿Hay token válido y no expirado?
  if (!authService.isAuthenticated()) {
    authService.logout();
    return router.createUrlTree(['/login']);
  }

  // Paso 3: ¿El servidor está vivo?
  return authService.pingServer().pipe(
    map((isAlive) => {
      if (isAlive) return true;
      // Si el servidor está dormido, mandar al login con mensaje
      authService.logout();
      return router.createUrlTree(['/login'], {
        queryParams: { serverDown: 'true' }
      });
    })
  );
};
