import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component').then(c => c.LoginComponent),
    canActivate: [loginGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'inventory/products',
    loadComponent: () => import('./features/inventory/products/products.component').then(c => c.ProductsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./features/auth/users/users.component').then(c => c.UsersComponent),
    canActivate: [authGuard]
  },
  // Redirects simples (sin guards - los guards se aplican en las rutas de destino)
  { path: 'auth', redirectTo: '/login', pathMatch: 'full' },
  { path: 'finance', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'inventory', redirectTo: '/inventory/products', pathMatch: 'full' },
  { path: 'purchases', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'sales', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
