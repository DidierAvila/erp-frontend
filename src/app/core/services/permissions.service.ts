import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest, map, switchMap, of, catchError } from 'rxjs';
import { AuthService } from './auth.service';
import { RoleDto, PermissionDto, UserDto } from '../models/auth.models';
import { environment } from '../../../environments/environment';

export interface MenuPermission {
  id: string;
  name: string;
  description?: string;
  module: string; // 'dashboard', 'inventory', 'sales', 'purchases', 'finance', 'auth'
  action: string; // 'read', 'create', 'update', 'delete'
  resource: string; // 'users', 'products', 'sales', etc.
}

export interface UserPermissions {
  roleId: string;
  roleName: string;
  permissions: MenuPermission[];
  canAccess: {
    dashboard: boolean;
    inventory: boolean;
    sales: boolean;
    purchases: boolean;
    finance: boolean;
    auth: boolean;
    users: boolean;
    products: boolean;
    roles: boolean;
    permissions: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private apiUrl = environment.apiUrl;
  private userPermissionsSubject = new BehaviorSubject<UserPermissions | null>(null);
  public userPermissions$ = this.userPermissionsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Comentado temporalmente para usar la nueva implementación de permisos en AuthService
    // this.authService.currentUser$.subscribe(user => {
    //   if (user && user.userTypeId) {
    //     this.loadUserPermissions(user.userTypeId);
    //   } else {
    //     this.userPermissionsSubject.next(null);
    //   }
    // });
  }

  /**
   * Cargar permisos del usuario basado en su rol
   */
  private loadUserPermissions(roleId: string): void {
    this.getRolePermissions(roleId).subscribe({
      next: (role) => {
        const userPermissions = this.mapRoleToUserPermissions(role);
        this.userPermissionsSubject.next(userPermissions);
  
      },
      error: (error) => {
  
        // En caso de error, crear permisos básicos de solo lectura
        this.createFallbackPermissions(roleId);
      }
    });
  }

  /**
   * Obtener permisos de un rol desde el backend
   * NOTA: Método deshabilitado - ahora se usan los permisos del AuthService
   */
  private getRolePermissions(roleId: string): Observable<RoleDto> {
    // Retornar un rol básico sin hacer llamada al backend
    return of(this.createDevelopmentRole(roleId));
  }

  /**
   * Crear rol de desarrollo con permisos básicos basado en el roleId
   */
  private createDevelopmentRole(roleId: string): RoleDto {
    // Crear permisos básicos para desarrollo
    const basicPermissions: PermissionDto[] = [
      { id: '1', name: 'dashboard.read.all', description: 'Ver dashboard' },
      { id: '2', name: 'inventory.read.all', description: 'Ver inventario' },
      { id: '3', name: 'sales.read.all', description: 'Ver ventas' },
      { id: '4', name: 'purchases.read.all', description: 'Ver compras' },
      { id: '5', name: 'auth.read.users', description: 'Ver usuarios' }
    ];

    // Si es admin, agregar más permisos
    if (roleId.toLowerCase().includes('admin') || roleId === '1') {
      basicPermissions.push(
        { id: '6', name: 'auth.read.all', description: 'Administrar usuarios' },
        { id: '7', name: 'finance.read.all', description: 'Ver finanzas' },
        { id: '8', name: 'inventory.create.all', description: 'Crear productos' },
        { id: '9', name: 'sales.create.all', description: 'Crear ventas' }
      );
    }

    return {
      id: roleId,
      name: roleId.toLowerCase().includes('admin') ? 'Administrador' : 'Usuario',
      description: `Rol ${roleId.toLowerCase().includes('admin') ? 'administrador' : 'básico'} para desarrollo`,
      permissions: basicPermissions
    };
  }

  /**
   * Mapear permisos del rol a estructura de permisos del usuario
   */
  private mapRoleToUserPermissions(role: RoleDto): UserPermissions {
    const permissions = this.convertToMenuPermissions(role.permissions || []);
    
    return {
      roleId: role.id,
      roleName: role.name || 'Usuario',
      permissions: permissions,
      canAccess: {
        dashboard: this.hasPermission(permissions, 'dashboard', 'read'),
        inventory: this.hasPermission(permissions, 'inventory', 'read'),
        sales: this.hasPermission(permissions, 'sales', 'read'),
        purchases: this.hasPermission(permissions, 'purchases', 'read'),
        finance: this.hasPermission(permissions, 'finance', 'read'),
        auth: this.hasPermission(permissions, 'auth', 'read'),
        users: this.hasPermission(permissions, 'auth', 'read', 'users'),
        products: this.hasPermission(permissions, 'inventory', 'read', 'products'),
        roles: this.hasPermission(permissions, 'auth', 'read', 'roles'),
        permissions: this.hasPermission(permissions, 'auth', 'read', 'permissions')
      }
    };
  }

  /**
   * Convertir permisos DTO a permisos de menú
   */
  private convertToMenuPermissions(permissions: PermissionDto[]): MenuPermission[] {
    return permissions.map(permission => {
      // Parsear el nombre del permiso (formato: "module.action.resource")
      const parts = (permission.name || '').split('.');
      const module = parts[0] || 'general';
      const action = parts[1] || 'read';
      const resource = parts[2] || 'all';

      return {
        id: permission.id,
        name: permission.name || '',
        description: permission.description,
        module: module,
        action: action,
        resource: resource
      };
    });
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  private hasPermission(permissions: MenuPermission[], module: string, action: string, resource?: string): boolean {
    return permissions.some(permission => 
      permission.module === module && 
      permission.action === action &&
      (!resource || permission.resource === resource || permission.resource === 'all')
    );
  }

  /**
   * Crear permisos de fallback básicos
   */
  private createFallbackPermissions(roleId: string): void {
    const basicPermissions: UserPermissions = {
      roleId: roleId,
      roleName: 'Usuario Básico',
      permissions: [
        {
          id: 'fallback-dashboard-read',
          name: 'dashboard.read.all',
          module: 'dashboard',
          action: 'read',
          resource: 'all',
          description: 'Acceso básico al dashboard'
        }
      ],
      canAccess: {
        dashboard: true,
        inventory: false,
        sales: false,
        purchases: false,
        finance: false,
        auth: false,
        users: false,
        products: false,
        roles: false,
        permissions: false
      }
    };

    this.userPermissionsSubject.next(basicPermissions);
  }

  // Métodos públicos para verificar permisos
  
  /**
   * Verificar si el usuario puede acceder a un módulo
   */
  canAccessModule(moduleName: keyof UserPermissions['canAccess']): Observable<boolean> {
    return this.userPermissions$.pipe(
      map(permissions => permissions?.canAccess[moduleName] || false)
    );
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  hasUserPermission(module: string, action: string, resource?: string): Observable<boolean> {
    return this.userPermissions$.pipe(
      map(userPermissions => {
        if (!userPermissions) return false;
        return this.hasPermission(userPermissions.permissions, module, action, resource);
      })
    );
  }

  /**
   * Obtener permisos actuales del usuario
   */
  getCurrentUserPermissions(): UserPermissions | null {
    return this.userPermissionsSubject.value;
  }

  /**
   * Obtener información completa del usuario con permisos
   */
  getUserInfo(): Observable<{user: UserDto | null, permissions: UserPermissions | null}> {
    return combineLatest([
      this.authService.currentUser$,
      this.userPermissions$
    ]).pipe(
      map(([user, permissions]) => ({
        user,
        permissions
      }))
    );
  }
}
