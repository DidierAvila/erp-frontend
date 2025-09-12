import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { SidebarService, AuthService } from '../../../core/services';
import { NavigationItem } from '../../../core/models';
import { Observable, map, switchMap, startWith, filter } from 'rxjs';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  component?: any;
  action?: () => void;
  children?: MenuItem[];
  id?: string; // Identificador único para el estilo activo
  permission?: string; // Permiso requerido para acceder
  module?: string; // Módulo del permiso
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatTooltipModule,
    MatMenuModule,
    RouterModule
  ],
  template: `
    <div class="sidebar-container">
      <!-- Sidebar -->
      <div class="sidebar" [style.width.px]="sidenavWidth()">
        <!-- Header del Sidebar -->
        <div class="sidenav-header">
          <button mat-icon-button (click)="toggleSidebar()" class="toggle-btn">
            <mat-icon>{{ isExpanded() ? 'menu_open' : 'menu' }}</mat-icon>
          </button>
          @if (isExpanded()) {
            <span class="company-name">ERP System</span>
          }
        </div>

        <!-- Menu Items -->
        <mat-nav-list class="nav-list">
          @for (item of (filteredMenuItems$ | async) || []; track item.label) {
            @if (item.children && item.children.length > 0) {
              <!-- Menu con submenu -->
              @if (isExpanded()) {
                <mat-expansion-panel class="menu-expansion" [hideToggle]="!isExpanded()">
                  <mat-expansion-panel-header class="expansion-header">
                    <mat-panel-title class="panel-title">
                      <mat-icon [matTooltip]="!isExpanded() ? item.label : ''" 
                               [matTooltipDisabled]="isExpanded()"
                               matTooltipPosition="right">
                        {{ item.icon }}
                      </mat-icon>
                      @if (isExpanded()) {
                        <span class="menu-text">{{ item.label }}</span>
                      }
                    </mat-panel-title>
                  </mat-expansion-panel-header>
                  
                  <div class="submenu-container">
                    @for (child of item.children; track child.label) {
                      <a mat-list-item [routerLink]="child.route" 
                         routerLinkActive="active-menu-item"
                         class="submenu-item">
                        <mat-icon matListItemIcon>{{ child.icon }}</mat-icon>
                        <span matListItemTitle>{{ child.label }}</span>
                      </a>
                    }
                  </div>
                </mat-expansion-panel>
              } @else {
                <!-- Menu colapsado con submenu - mostrar como botón con menú -->
                <button mat-list-item 
                        class="menu-item collapsed-menu"
                        [matMenuTriggerFor]="submenuMenu"
                        [matTooltip]="item.label"
                        matTooltipPosition="right">
                  <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                </button>
                <mat-menu #submenuMenu="matMenu" xPosition="after" yPosition="below">
                  @for (child of item.children; track child.label) {
                    <a mat-menu-item [routerLink]="child.route" class="submenu-menu-item">
                      <mat-icon>{{ child.icon }}</mat-icon>
                      <span>{{ child.label }}</span>
                    </a>
                  }
                </mat-menu>
              }
            } @else {
              <!-- Menu simple sin submenu -->
              <a mat-list-item [routerLink]="item.route" 
                 routerLinkActive="active-menu-item"
                 class="menu-item">
                <mat-icon matListItemIcon 
                         [matTooltip]="!isExpanded() ? item.label : ''" 
                         [matTooltipDisabled]="isExpanded()"
                         matTooltipPosition="right">
                  {{ item.icon }}
                </mat-icon>
                @if (isExpanded()) {
                  <span matListItemTitle>{{ item.label }}</span>
                }
              </a>
            }
          }
        </mat-nav-list>
      </div>

      <!-- Main Content -->
      <div class="main-content" [style.margin-left.px]="sidenavWidth()">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-container {
      display: flex;
      height: 100vh;
    }

    .sidebar {
      border-right: 1px solid #e0e0e0;
      background-color: #f5f5f5;
      transition: width 0.3s ease;
      position: fixed;
      height: calc(100vh - 64px);
      top: 64px;
      left: 0;
      z-index: 100;
      overflow-y: auto;
    }

    .sidenav-header {
      display: flex;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      min-height: 64px;
      box-sizing: border-box;
      justify-content: flex-start;
    }

    .toggle-btn {
      margin-right: 12px;
      flex-shrink: 0;
    }

    .company-name {
      font-weight: 500;
      font-size: 18px;
      color: #1976d2;
    }

    .nav-list {
      padding-top: 0;
    }

    .menu-item, .submenu-item {
      border-radius: 8px;
      margin: 4px 8px;
      transition: all 0.2s ease;
    }

    .menu-item:hover, .submenu-item:hover {
      background-color: rgba(25, 118, 210, 0.1);
    }

    .menu-expansion {
      box-shadow: none !important;
      background: transparent !important;
      margin: 4px 8px;
      border-radius: 8px;
    }

    .expansion-header {
      padding: 0 16px;
      height: 48px;
    }

    .expansion-header:hover {
      background-color: rgba(25, 118, 210, 0.1);
    }

    .panel-title {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .menu-text {
      font-weight: 500;
    }

    .submenu-container {
      padding-left: 16px;
    }

    .submenu-item {
      padding-left: 24px;
      font-size: 14px;
      cursor: pointer;
      text-decoration: none;
    }

    .submenu-item:focus {
      outline: none;
    }

    .active-menu-item {
      background-color: rgba(25, 118, 210, 0.15) !important;
      border-left: 4px solid #1976d2 !important;
      font-weight: 500 !important;
      color: #1976d2 !important;
    }

    .active-menu-item .mat-icon {
      color: #1976d2 !important;
    }

    .collapsed-menu {
      cursor: pointer;
      border-radius: 8px;
      margin: 4px 8px;
      transition: all 0.2s ease;
    }

    .collapsed-menu:hover {
      background-color: rgba(25, 118, 210, 0.1);
    }

    .submenu-menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      text-decoration: none;
      color: inherit;
    }

    .submenu-menu-item:hover {
      background-color: rgba(25, 118, 210, 0.1);
    }

    .main-content {
      padding: 20px;
      transition: margin-left 0.3s ease;
      width: 100%;
      min-height: calc(100vh - 64px);
      box-sizing: border-box;
    }

    ::ng-deep .mat-expansion-panel-body {
      padding: 8px 0 16px 0 !important;
    }

    ::ng-deep .mat-list-item-content {
      padding: 0 16px !important;
    }
  `]
})
export class SidebarComponent implements OnInit {
  
  // Menú filtrado basado en permisos
  filteredMenuItems$!: Observable<NavigationItem[]>;
  
  constructor(
    public sidebarService: SidebarService,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    // Cargar la navegación del usuario desde el backend
    this.filteredMenuItems$ = this.authService.currentUser$.pipe(
      switchMap(user => {
        if (user) {
          // Si hay usuario, verificar si ya tenemos navegación cargada
          return this.authService.navigation$.pipe(
            switchMap(navigation => {
              if (navigation.length === 0) {
                // Solo hacer la llamada si no tenemos navegación cargada
                return this.authService.getCurrentUserWithPermissions().pipe(
                  switchMap(() => this.authService.navigation$)
                );
              } else {
                // Ya tenemos navegación, usarla directamente
                return this.authService.navigation$;
              }
            })
          );
        } else {
          // Si no hay usuario, retornar navegación vacía
          return this.authService.navigation$;
        }
      }),
      map(navigation => this.filterVisibleItems(navigation)),
      startWith([]) // Empezar con un array vacío mientras se cargan los datos
    );
  }

  /**
   * Filtrar elementos de navegación basado en la propiedad visible
   */
  private filterVisibleItems(items: NavigationItem[]): NavigationItem[] {
    return items.filter(item => {
      // Solo mostrar elementos marcados como visibles
      if (!item.visible) {
        return false;
      }

      // Si tiene hijos, filtrar recursivamente
      if (item.children && item.children.length > 0) {
        item.children = this.filterVisibleItems(item.children);
        // Solo mostrar el padre si tiene al menos un hijo visible
        return item.children.length > 0;
      }

      return true;
    });
  }
  
  get isExpanded() {
    return this.sidebarService.isExpanded;
  }
  
  sidenavWidth = computed(() => this.sidebarService.isExpanded() ? 280 : 60);

  toggleSidebar() {
    this.sidebarService.toggle();
  }


}
