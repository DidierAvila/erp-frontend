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
import { PermissionsService } from './core/services/permissions.service';
import { CommonModule } from '@angular/common';
import { Observable, map, combineLatest } from 'rxjs';

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
    public sidebarService: SidebarService,
    public permissionsService: PermissionsService
  ) {
    // Crear un Observable basado en el currentUser$ con debouncing para evitar cambios rápidos
    this.isAuthenticated$ = this.authService.currentUser$.pipe(
      map(user => {
        const hasUser = !!user;
        const hasToken = !!localStorage.getItem('auth_token');
        return hasUser && hasToken;
      })
    );

    // Observable combinado con información del usuario y permisos
    this.userInfo$ = this.permissionsService.getUserInfo();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
