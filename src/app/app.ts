import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AuthService } from './core/services/auth.service';
import { SidebarService } from './core/services/sidebar.service';

import { CommonModule } from '@angular/common';
import { Observable, map, combineLatest, take, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    SidebarComponent,
    CommonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'erp-frontend';
  
  // Observable que indica si el usuario está autenticado
  isAuthenticated$: Observable<boolean>;
  
  // Observable con información completa del usuario y permisos
  userInfo$: Observable<{user: any, permissions: any}>;

  constructor(
    private router: Router,
    public authService: AuthService,
    public sidebarService: SidebarService
    // public permissionsService: PermissionsService // Comentado - usando AuthService
  ) {
    // Observable para verificar si el usuario está autenticado
    this.isAuthenticated$ = this.authService.currentUser$.pipe(
      map(user => {
        const hasUser = !!user;
        const hasToken = !!localStorage.getItem('auth_token');
        return hasUser && hasToken;
      })
    );

    // Observable combinado con información del usuario y permisos
    this.userInfo$ = this.authService.currentUser$.pipe(
      map(user => ({ user, permissions: user?.menuPermissions || null }))
    );

    // Inicializar permisos del usuario si está autenticado
    this.initializeUserPermissions();
  }

  private initializeUserPermissions(): void {
    // Verificar si necesitamos cargar permisos solo una vez al inicio
    this.authService.currentUser$.pipe(
      distinctUntilChanged(),
      take(1)
    ).subscribe(user => {
      if (user && !user.menuPermissions) {
        // Verificar si ya tenemos navegación cargada para evitar llamadas duplicadas
        this.authService.navigation$.pipe(take(1)).subscribe(navigation => {
          if (navigation.length === 0) {
            // Solo hacer la llamada si no tenemos datos cargados
            this.authService.getCurrentUserWithPermissions().pipe(take(1)).subscribe({
              next: (response) => {
      
              },
              error: (error) => {

              }
            });
          }
        });
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
