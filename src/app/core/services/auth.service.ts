import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map, catchError, shareReplay } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  LoginRequest, 
  UserDto, 
  CreateUserDto, 
  UpdateUserDto, 
  ChangePasswordDto,
  RoleDto,
  CreateRoleDto,
  UpdateRoleDto,
  UserAdditionalValueResponseDto,
  UpdateUserAdditionalDataDto,
  UserTypeDto,
  CreateUserTypeDto,
  UpdateUserTypeDto,
  PermissionDto,
  CreatePermissionDto,
  UpdatePermissionDto,
  UserMeResponse,
  UserMeResponseLegacy,
  MenuPermissions,
  NavigationItem,
  UserPermissions
} from '../models';

interface LoginResponse {
  token: string;
  user: UserDto;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = environment.apiUrl;
  private readonly keyJwt = environment.keyJwt;
  private currentUserSubject = new BehaviorSubject<UserDto | null>(null);
  private navigationSubject = new BehaviorSubject<NavigationItem[]>([]);
  private permissionsSubject = new BehaviorSubject<UserPermissions>({});
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private navigationKey = 'user_navigation';
  private permissionsKey = 'user_permissions';
  private currentUserWithPermissions$: Observable<UserMeResponse> | null = null;

  constructor(private http: HttpClient) {
    // Verificar si hay usuario guardado al inicializar
    const savedUser = localStorage.getItem(this.userKey);
    const savedNavigation = localStorage.getItem(this.navigationKey);
    const savedPermissions = localStorage.getItem(this.permissionsKey);
    const token = localStorage.getItem(this.tokenKey);
    
    if (savedUser && token) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
        
        if (savedNavigation) {
          this.navigationSubject.next(JSON.parse(savedNavigation));
        }
        
        if (savedPermissions) {
          this.permissionsSubject.next(JSON.parse(savedPermissions));
        }
      } catch (error) {
  
        // Limpiar datos corruptos
        this.logout();
      }
    } else if (!token && savedUser) {
      // Si hay usuario pero no token, limpiar todo
      this.logout();
    }
  }

  get currentUser$(): Observable<UserDto | null> {
    return this.currentUserSubject.asObservable();
  }

  get navigation$(): Observable<NavigationItem[]> {
    return this.navigationSubject.asObservable();
  }

  get permissions$(): Observable<UserPermissions> {
    return this.permissionsSubject.asObservable();
  }

  get isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  // Auth endpoints
  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post(`${this.baseUrl}/api/Auth/Login`, loginRequest, { 
      responseType: 'text' 
    }).pipe(
      map((tokenResponse: string) => {

        
        // Decodificar el JWT para extraer la información del usuario
        const user = this.decodeJwtToken(tokenResponse);
        
        const loginResponse: LoginResponse = {
          token: tokenResponse,
          user: user
        };
        
        return loginResponse;
      }),
      tap(response => {

        // Guardar token y datos del usuario
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);

      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.navigationKey);
    localStorage.removeItem(this.permissionsKey);
    this.currentUserSubject.next(null);
    this.navigationSubject.next([]);
    this.permissionsSubject.next({});
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private decodeJwtToken(token: string): UserDto {
    try {
      // Decodificar el payload del JWT (parte media del token)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);

      
      // Mapear los claims del token a nuestro modelo UserDto
      const user: UserDto = {
        id: payload['custom:userId'] || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '1',
        name: payload['custom:UserName'] || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] || 'Usuario',
        email: payload['custom:UserEmail'] || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 'usuario@sistema.com',
        userTypeId: payload['custom:UserTypeId'] || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'user',
        // Agregar datos adicionales si existen
        additionalData: {
          ...this.extractAdditionalClaims(payload),
          userTypeName: payload['custom:UserTypeName'] || 'Usuario',
          exp: payload['exp'] || null
        }
      };
      

      return user;
      
    } catch (error) {
  
      
      // Fallback: crear usuario básico si no se puede decodificar
      return {
        id: '1',
        name: 'Usuario',
        email: 'usuario@sistema.com',
        userTypeId: 'user'
      };
    }
  }

  private extractAdditionalClaims(payload: any): { [key: string]: string | number | boolean } {
    const additionalData: { [key: string]: string | number | boolean } = {};
    
    // Claims estándar que ya mapeamos
    const standardClaims = [
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
      'exp', // expiration time
      'iss', // issuer
      'aud', // audience
      'nbf', // not before
      'iat'  // issued at
    ];
    
    // Extraer cualquier claim adicional
    Object.keys(payload).forEach(key => {
      if (!standardClaims.includes(key)) {
        // Convertir las URLs largas a nombres más amigables
        let friendlyKey = key;
        if (key.includes('/')) {
          const parts = key.split('/');
          friendlyKey = parts[parts.length - 1];
        }
        additionalData[friendlyKey] = payload[key];
      }
    });
    
    // También agregar información de expiración
    if (payload.exp) {
      additionalData['tokenExpiration'] = new Date(payload.exp * 1000).toISOString();
    }
    
    return Object.keys(additionalData).length > 0 ? additionalData : {};
  }



  register(createUser: CreateUserDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/Auth/Register`, createUser);
  }

  oauthLogin(loginRequest: LoginRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/OAuth/Login`, loginRequest);
  }

  // Users endpoints
  getUsers(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/auth/Users`);
  }

  createUser(user: CreateUserDto): Observable<UserDto> {
    // Enviar los datos directamente como espera el backend
    return this.http.post<UserDto>(`${this.baseUrl}/api/auth/Users`, user);
  }

  getUserById(id: string): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.baseUrl}/api/auth/Users/${id}`);
  }

  updateUser(id: string, user: UpdateUserDto): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.baseUrl}/api/auth/Users/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/auth/Users/${id}`);
  }

  changePassword(id: string, changePassword: ChangePasswordDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/api/auth/Users/${id}/change-password`, changePassword);
  }

  updateUserAdditionalData(id: string, key: string, value: string | number | boolean): Observable<UserAdditionalValueResponseDto> {
    return this.http.put<UserAdditionalValueResponseDto>(`${this.baseUrl}/api/auth/Users/${id}/additional-data/${key}`, value);
  }

  getUserAdditionalData(id: string, key: string): Observable<UserAdditionalValueResponseDto> {
    return this.http.get<UserAdditionalValueResponseDto>(`${this.baseUrl}/api/auth/Users/${id}/additional-data/${key}`);
  }

  deleteUserAdditionalData(id: string, key: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/api/auth/Users/${id}/additional-data/${key}`);
  }

  updateAllUserAdditionalData(id: string, data: UpdateUserAdditionalDataDto): Observable<{[key: string]: string | number | boolean}> {
    return this.http.put<{[key: string]: string | number | boolean}>(`${this.baseUrl}/api/auth/Users/${id}/additional-data`, data);
  }

  // Roles endpoints
  getRoles(page: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/Roles?Page=${page}&PageSize=${pageSize}`);
  }

  createRole(role: CreateRoleDto): Observable<RoleDto> {
    return this.http.post<RoleDto>(`${this.baseUrl}/api/Roles`, role);
  }

  getRoleById(id: string): Observable<RoleDto> {
    return this.http.get<RoleDto>(`${this.baseUrl}/api/Roles/${id}`);
  }

  updateRole(id: string, role: UpdateRoleDto): Observable<RoleDto> {
    return this.http.put<RoleDto>(`${this.baseUrl}/api/Roles/${id}`, role);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/Roles/${id}`);
  }

  // User Types endpoints
  getUserTypes(page: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/auth/UserTypes?Page=${page}&PageSize=${pageSize}`);
  }

  createUserType(userType: CreateUserTypeDto): Observable<UserTypeDto> {
    return this.http.post<UserTypeDto>(`${this.baseUrl}/api/UserTypes`, userType);
  }

  getUserTypeById(id: string): Observable<UserTypeDto> {
    return this.http.get<UserTypeDto>(`${this.baseUrl}/api/UserTypes/${id}`);
  }

  updateUserType(id: string, userType: UpdateUserTypeDto): Observable<UserTypeDto> {
    return this.http.put<UserTypeDto>(`${this.baseUrl}/api/UserTypes/${id}`, userType);
  }

  deleteUserType(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/UserTypes/${id}`);
  }

  // Permissions endpoints
  getPermissions(page: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/Permissions`, {
      params: {
        Page: page.toString(),
        PageSize: pageSize.toString()
      }
    });
  }

  // Para dropdowns/select
  getAllPermissionsDropdown(): Observable<PermissionDto[]> {
    return this.http.get<PermissionDto[]>(`${this.baseUrl}/api/Permissions/dropdown`);
  }

  createPermission(permission: CreatePermissionDto): Observable<PermissionDto> {
    return this.http.post<PermissionDto>(`${this.baseUrl}/api/Permissions`, permission);
  }

  getPermissionById(id: string): Observable<PermissionDto> {
    return this.http.get<PermissionDto>(`${this.baseUrl}/api/Permissions/${id}`);
  }

  updatePermission(id: string, permission: UpdatePermissionDto): Observable<PermissionDto> {
    return this.http.put<PermissionDto>(`${this.baseUrl}/api/Permissions/${id}`, permission);
  }

  deletePermission(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/Permissions/${id}`);
  }

  // =============================================================================
  // MÉTODOS ADICIONALES PARA ROLES
  // =============================================================================

  /**
   * Obtener todos los roles disponibles para asignar a usuarios
   */
  getAllRoles(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(`${this.baseUrl}/api/Roles/dropdown`).pipe(
      catchError((error: any) => {

        return of([]); // Retornar array vacío en caso de error
      })
    );
  }

  /**
   * Obtener todos los tipos de usuario disponibles para dropdown
   */
  getAllUserTypes(): Observable<UserTypeDto[]> {
    return this.http.get<UserTypeDto[]>(`${this.baseUrl}/api/auth/UserTypes/dropdown`).pipe(
      catchError((error: any) => {

        return of([]); // Retornar array vacío en caso de error
      })
    );
  }

  /**
   * Obtener roles de un usuario específico
   */
  getUserRoles(userId: string): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(`${this.baseUrl}/api/Auth/Users/${userId}/roles`).pipe(
      catchError((error: any) => {

        return of([]); // Retornar array vacío en caso de error
      })
    );
  }

  /**
   * Asignar roles a un usuario
   */
  assignRolesToUser(userId: string, roleIds: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/Auth/Users/${userId}/roles`, { roleIds }).pipe(
      catchError((error: any) => {

        throw error;
      })
    );
  }

  /**
   * Remover roles de un usuario
   */
  removeRolesFromUser(userId: string, roleIds: string[]): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/Auth/Users/${userId}/roles`, { 
      body: { roleIds } 
    }).pipe(
      catchError((error: any) => {

        throw error;
      })
    );
  }

  // Método para obtener información completa del usuario con permisos
  getCurrentUserWithPermissions(): Observable<UserMeResponse> {
    // Si ya hay una petición en curso, reutilizarla
    if (this.currentUserWithPermissions$) {
      return this.currentUserWithPermissions$;
    }

    // Crear nueva petición con caché
    this.currentUserWithPermissions$ = this.http.get<UserMeResponse>(`${this.baseUrl}/api/Auth/me`).pipe(
      tap(response => {
  
        
        if (response.success && response.data) {
          // Crear UserDto compatible con la estructura existente
          const userData: UserDto = {
            id: response.data.user.id,
            name: response.data.user.name,
            email: response.data.user.email,
            image: response.data.user.avatar,
            userTypeId: response.data.user.roleId,
            roles: [{
              id: response.data.user.roleId,
              name: response.data.user.role
            }] as RoleDto[]
          };
          
          // Guardar datos en localStorage
          localStorage.setItem(this.userKey, JSON.stringify(userData));
          localStorage.setItem(this.navigationKey, JSON.stringify(response.data.navigation));
          localStorage.setItem(this.permissionsKey, JSON.stringify(response.data.permissions));
          
          // Actualizar subjects
          this.currentUserSubject.next(userData);
          this.navigationSubject.next(response.data.navigation);
          this.permissionsSubject.next(response.data.permissions);
        }
        
        // Limpiar caché después de completar la petición
        this.currentUserWithPermissions$ = null;
      }),
      catchError(error => {

        // Limpiar caché en caso de error
        this.currentUserWithPermissions$ = null;
        
        // Proporcionar navegación de respaldo cuando el backend no esté disponible
        const fallbackNavigation: NavigationItem[] = [
          {
            id: 'dashboard',
            label: 'Dashboard',
            route: '/dashboard',
            icon: 'dashboard',
            order: 1,
            visible: true,
            children: []
          },
          {
            id: 'auth',
            label: 'Administración',
            route: null,
            icon: 'admin_panel_settings',
            order: 2,
            visible: true,
            children: [
              {
                id: 'users',
                label: 'Usuarios',
                route: '/users',
                icon: 'people',
                order: 1,
                visible: true,
                children: []
              },
              {
                id: 'roles',
                label: 'Roles',
                route: '/roles',
                icon: 'security',
                order: 2,
                visible: true,
                children: []
              },
              {
                id: 'permissions',
                label: 'Permisos',
                route: '/permissions',
                icon: 'lock',
                order: 3,
                visible: true,
                children: []
              },
              {
                id: 'user-types',
                label: 'Tipos de Usuario',
                route: '/user-types',
                icon: 'group',
                order: 4,
                visible: true,
                children: []
              }
            ]
          },
          {
            id: 'finance',
            label: 'Finanzas',
            route: null,
            icon: 'account_balance',
            order: 3,
            visible: true,
            children: [
              {
                id: 'accounts',
                label: 'Cuentas',
                route: '/finance/accounts',
                icon: 'account_balance_wallet',
                order: 1,
                visible: true,
                children: []
              },
              {
                id: 'transactions',
                label: 'Transacciones',
                route: '/finance/transactions',
                icon: 'receipt',
                order: 2,
                visible: true,
                children: []
              }
            ]
          },
          {
            id: 'sales',
            label: 'Ventas',
            route: null,
            icon: 'point_of_sale',
            order: 4,
            visible: true,
            children: [
              {
                id: 'sales-orders',
                label: 'Órdenes de Venta',
                route: '/sales/orders',
                icon: 'receipt_long',
                order: 1,
                visible: true,
                children: []
              },
              {
                id: 'sales-invoices',
                label: 'Facturas de Venta',
                route: '/sales/invoices',
                icon: 'description',
                order: 2,
                visible: true,
                children: []
              }
            ]
          },
          {
            id: 'inventory',
            label: 'Inventario',
            route: null,
            icon: 'inventory',
            order: 5,
            visible: true,
            children: [
              {
                id: 'products',
                label: 'Productos',
                route: '/inventory/products',
                icon: 'shopping_bag',
                order: 1,
                visible: true,
                children: []
              }
            ]
          }
        ];
        
        // Actualizar navegación con datos de respaldo
        localStorage.setItem(this.navigationKey, JSON.stringify(fallbackNavigation));
        this.navigationSubject.next(fallbackNavigation);
        
        return of({
          success: false,
          data: {
            user: {
              id: '',
              name: '',
              email: '',
              role: '',
              roleId: '',
              avatar: ''
            },
            navigation: fallbackNavigation,
            permissions: {}
          }
        });
      }),
      shareReplay(1) // Compartir el resultado con múltiples suscriptores
    );

    return this.currentUserWithPermissions$;
  }

  // Método para verificar si el usuario tiene acceso a un módulo específico
  hasModuleAccess(module: string): boolean {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser?.menuPermissions) {
      return false;
    }

    const permissions = currentUser.menuPermissions as any;
    
    // Para dashboard es un boolean directo
    if (module === 'dashboard') {
      return permissions.dashboard === true;
    }

    // Para otros módulos, verificar si tiene acceso
    const modulePermissions = permissions[module];
    return modulePermissions?.access === true;
  }

  // Método para verificar permisos específicos en un módulo
  hasPermission(module: string, permission: string): boolean {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser?.menuPermissions) {
      return false;
    }

    const permissions = currentUser.menuPermissions as any;
    const modulePermissions = permissions[module];
    
    if (!modulePermissions) {
      return false;
    }

    return modulePermissions[permission] === true;
  }
}
