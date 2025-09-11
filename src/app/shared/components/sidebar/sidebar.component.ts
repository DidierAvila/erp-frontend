import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { SidebarService, PermissionsService } from '../../../core/services';
import { Observable, map } from 'rxjs';

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
                
                @if (isExpanded()) {
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
                }
              </mat-expansion-panel>
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
  filteredMenuItems$!: Observable<MenuItem[]>;
  
  constructor(
    public sidebarService: SidebarService,
    private permissionsService: PermissionsService
  ) {
  }

  ngOnInit(): void {
    // Crear observable del menú filtrado por permisos
    this.filteredMenuItems$ = this.permissionsService.userPermissions$.pipe(
      map(permissions => this.filterMenuByPermissions(this.menuItems, permissions))
    );
  }

  /**
   * Filtrar elementos del menú basado en permisos del usuario
   */
  private filterMenuByPermissions(items: MenuItem[], permissions: any): MenuItem[] {
    if (!permissions) {
      // Si no hay permisos, solo mostrar dashboard
      return items.filter(item => item.module === 'dashboard');
    }

    return items.filter(item => {
      // Verificar si el usuario puede acceder al módulo
      if (item.module && permissions.canAccess) {
        const canAccess = permissions.canAccess[item.module as keyof typeof permissions.canAccess];
        if (!canAccess) {
          return false;
        }
      }

      // Si tiene hijos, filtrar recursivamente
      if (item.children && item.children.length > 0) {
        const filteredChildren = this.filterMenuByPermissions(item.children, permissions);
        if (filteredChildren.length === 0) {
          return false; // No mostrar el item padre si no tiene hijos accesibles
        }
        // Crear una copia del item con los hijos filtrados
        return Object.assign({}, item, { children: filteredChildren });
      }

      return true;
    }).map(item => {
      // Si tiene hijos, aplicar el filtro a los hijos
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: this.filterMenuByPermissions(item.children, permissions)
        };
      }
      return item;
    });
  }
  
  get isExpanded() {
    return this.sidebarService.isExpanded;
  }
  
  sidenavWidth = computed(() => this.sidebarService.isExpanded() ? 280 : 60);

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      module: 'dashboard'
    },
    {
      label: 'Administración',
      icon: 'admin_panel_settings',
      module: 'auth',
      children: [
        { 
          label: 'Usuarios', 
          icon: 'people',
          route: '/users',
          module: 'auth'
        },
        { 
          label: 'Roles', 
          icon: 'admin_panel_settings',
          route: '/roles',
          module: 'auth'
        },
        { 
          label: 'Permisos', 
          icon: 'security',
          route: '/permissions',
          module: 'auth'
        },
        { 
          label: 'Tipos de Usuario', 
          icon: 'category',
          route: '/user-types',
          module: 'auth'
        }
      ]
    },
    {
      label: 'Inventario',
      icon: 'inventory_2',
      module: 'inventory',
      children: [
        { 
          label: 'Productos', 
          icon: 'shopping_bag', 
          route: '/inventory/products',
          module: 'inventory'
        },
        { 
          label: 'Categorías', 
          icon: 'category', 
          route: '/inventory/categories',
          module: 'inventory'
        },
        { 
          label: 'Stock', 
          icon: 'storage', 
          route: '/inventory/stock',
          module: 'inventory'
        },
        { 
          label: 'Movimientos', 
          icon: 'swap_horiz', 
          route: '/inventory/movements',
          module: 'inventory'
        }
      ]
    },
    {
      label: 'Compras',
      icon: 'shopping_cart',
      module: 'purchases',
      children: [
        { 
          label: 'Órdenes de Compra', 
          icon: 'receipt', 
          route: '/purchases/orders',
          module: 'purchases'
        },
        { 
          label: 'Proveedores', 
          icon: 'business', 
          route: '/purchases/suppliers',
          module: 'purchases'
        },
        { 
          label: 'Facturas', 
          icon: 'description', 
          route: '/purchases/invoices',
          module: 'purchases'
        }
      ]
    },
    {
      label: 'Ventas',
      icon: 'point_of_sale',
      module: 'sales',
      children: [
        { 
          label: 'Órdenes de Venta', 
          icon: 'sell', 
          route: '/sales/orders',
          module: 'sales'
        },
        { 
          label: 'Clientes', 
          icon: 'people_outline', 
          route: '/sales/customers',
          module: 'sales'
        },
        { 
          label: 'Facturas', 
          icon: 'receipt_long', 
          route: '/sales/invoices',
          module: 'sales'
        },
        { 
          label: 'Reportes', 
          icon: 'analytics', 
          route: '/sales/reports',
          module: 'sales'
        }
      ]
    },
    {
      label: 'Finanzas',
      icon: 'account_balance',
      module: 'finance',
      children: [
        { 
          label: 'Cuentas', 
          icon: 'account_balance_wallet', 
          route: '/finance/accounts',
          module: 'finance'
        },
        { 
          label: 'Transacciones', 
          icon: 'payment', 
          route: '/finance/transactions',
          module: 'finance'
        },
        { 
          label: 'Reportes', 
          icon: 'assessment', 
          route: '/finance/reports',
          module: 'finance'
        },
        { 
          label: 'Presupuesto', 
          icon: 'savings', 
          route: '/finance/budget',
          module: 'finance'
        }
      ]
    }
  ];

  toggleSidebar() {
    this.sidebarService.toggle();
  }


}
