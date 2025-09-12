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
    loadComponent: () => import('./features/auth/users/users-page.component').then(c => c.UsersPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'roles',
    loadComponent: () => import('./features/auth/roles/roles-page.component').then(c => c.RolesPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'permissions',
    loadComponent: () => import('./features/auth/permissions/permissions-page.component').then(c => c.PermissionsPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'user-types',
    loadComponent: () => import('./features/auth/user-types/user-types-page.component').then(c => c.UserTypesPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'finance/accounts',
    loadComponent: () => import('./features/finance/accounts/accounts.component').then(c => c.AccountsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'finance/transactions',
    loadComponent: () => import('./features/finance/transactions/transactions.component').then(c => c.TransactionsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'sales/orders',
    loadComponent: () => import('./features/sales/sales-order/sales-order.component').then(m => m.SalesOrderComponent),
    canActivate: [authGuard]
  },
  {
    path: 'sales/invoices',
    loadComponent: () => import('./features/sales/sales-invoice/sales-invoice.component').then(m => m.SalesInvoiceComponent),
    canActivate: [authGuard]
  },
  // Redirects simples (sin guards - los guards se aplican en las rutas de destino)
  { path: 'auth', redirectTo: '/login', pathMatch: 'full' },
  { path: 'finance', redirectTo: '/finance/accounts', pathMatch: 'full' },
  { path: 'inventory', redirectTo: '/inventory/products', pathMatch: 'full' },
  { path: 'purchases', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'sales', redirectTo: '/sales/orders', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
