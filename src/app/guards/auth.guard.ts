import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth-service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.isAuthenticated()) {
    authService.logout();
    return router.createUrlTree(['/login']);
  }

  return authService.pingServer().pipe(
    map((isAlive) => {
      if (isAlive) return true;
      authService.logout();
      return router.createUrlTree(['/login'], {
        queryParams: { serverDown: 'true' }
      });
    })
  );
};
