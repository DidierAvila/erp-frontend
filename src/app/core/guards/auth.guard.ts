import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ContentService } from '../services/content.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  

  
  if (authService.isAuthenticated) {

    return true;
  } else {
  
    router.navigate(['/login']);
    return false;
  }
};

export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const contentService = inject(ContentService);
  

  
  // Si ya está autenticado, redirigir al dashboard
  if (authService.isAuthenticated) {

    contentService.clearContent();
    router.navigate(['/dashboard'], { replaceUrl: true });
    return false;
  }
  

  return true;
};
