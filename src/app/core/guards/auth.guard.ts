import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ContentService } from '../services/content.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  console.log('AuthGuard - Verificando acceso a:', state.url);
  console.log('AuthGuard - Usuario autenticado:', authService.isAuthenticated);
  
  if (authService.isAuthenticated) {
    console.log('AuthGuard - Acceso permitido');
    return true;
  } else {
    console.log('Usuario no autenticado, redirigiendo al login...');
    router.navigate(['/login']);
    return false;
  }
};

export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const contentService = inject(ContentService);
  
  console.log('LoginGuard - Verificando acceso al login');
  console.log('LoginGuard - Usuario autenticado:', authService.isAuthenticated);
  
  // Si ya está autenticado, redirigir al dashboard
  if (authService.isAuthenticated) {
    console.log('LoginGuard - Usuario ya autenticado, redirigiendo al dashboard...');
    contentService.clearContent();
    router.navigate(['/dashboard'], { replaceUrl: true });
    return false;
  }
  
  console.log('LoginGuard - Usuario no autenticado, permitiendo acceso al login');
  return true;
};
