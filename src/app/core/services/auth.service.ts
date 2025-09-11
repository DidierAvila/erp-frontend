import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
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
  UpdatePermissionDto
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
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  constructor(private http: HttpClient) {
    // Verificar si hay usuario guardado al inicializar
    const savedUser = localStorage.getItem(this.userKey);
    const token = localStorage.getItem(this.tokenKey);
    
    if (savedUser && token) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error al parsear usuario guardado:', error);
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

  get isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  // Auth endpoints
  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post(`${this.baseUrl}/api/Auth/Login`, loginRequest, { 
      responseType: 'text' 
    }).pipe(
      map((tokenResponse: string) => {
        console.log('AuthService - Token JWT recibido:', tokenResponse.substring(0, 50) + '...');
        
        // Decodificar el JWT para extraer la información del usuario
        const user = this.decodeJwtToken(tokenResponse);
        
        const loginResponse: LoginResponse = {
          token: tokenResponse,
          user: user
        };
        
        return loginResponse;
      }),
      tap(response => {
        console.log('AuthService - Login exitoso, guardando datos...');
        // Guardar token y datos del usuario
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
        console.log('AuthService - isAuthenticated:', this.isAuthenticated);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
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
      console.log('JWT Payload decodificado:', payload);
      
      // Mapear los claims de .NET Identity a nuestro modelo UserDto
      const user: UserDto = {
        id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '1',
        name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] || 'Usuario',
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 'usuario@sistema.com',
        userTypeId: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'user',
        // Agregar datos adicionales si existen
        additionalData: this.extractAdditionalClaims(payload)
      };
      
      console.log('Usuario extraído del JWT:', user);
      return user;
      
    } catch (error) {
      console.error('Error al decodificar JWT:', error);
      
      // Fallback: crear usuario básico si no se puede decodificar
      return {
        id: '1',
        name: 'Usuario',
        email: 'usuario@sistema.com',
        userTypeId: 'user'
      };
    }
  }

  private extractAdditionalClaims(payload: any): { [key: string]: any } {
    const additionalData: { [key: string]: any } = {};
    
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

  updateUserAdditionalData(id: string, key: string, value: any): Observable<UserAdditionalValueResponseDto> {
    return this.http.put<UserAdditionalValueResponseDto>(`${this.baseUrl}/api/auth/Users/${id}/additional-data/${key}`, value);
  }

  getUserAdditionalData(id: string, key: string): Observable<UserAdditionalValueResponseDto> {
    return this.http.get<UserAdditionalValueResponseDto>(`${this.baseUrl}/api/auth/Users/${id}/additional-data/${key}`);
  }

  deleteUserAdditionalData(id: string, key: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/api/auth/Users/${id}/additional-data/${key}`);
  }

  updateAllUserAdditionalData(id: string, data: UpdateUserAdditionalDataDto): Observable<{[key: string]: any}> {
    return this.http.put<{[key: string]: any}>(`${this.baseUrl}/api/auth/Users/${id}/additional-data`, data);
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
  getUserTypes(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/UserTypes`);
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
  getPermissions(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/Permissions`);
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
        console.error('Error al obtener roles:', error);
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
        console.error('Error al obtener tipos de usuario:', error);
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
        console.error(`Error al obtener roles del usuario ${userId}:`, error);
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
        console.error(`Error al asignar roles al usuario ${userId}:`, error);
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
        console.error(`Error al remover roles del usuario ${userId}:`, error);
        throw error;
      })
    );
  }
}
