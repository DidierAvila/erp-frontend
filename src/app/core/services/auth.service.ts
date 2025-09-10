import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
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
  private readonly baseUrl = 'https://localhost:7271';
  private currentUserSubject = new BehaviorSubject<UserDto | null>(null);
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  constructor(private http: HttpClient) {
    // Verificar si hay usuario guardado al inicializar
    const savedUser = localStorage.getItem(this.userKey);
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
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
    // Simulación simple para desarrollo
    if (loginRequest.email === 'admin@erp.com' && loginRequest.password === 'admin123') {
      const mockUser: UserDto = {
        id: '1',
        name: 'Administrador',
        email: 'admin@erp.com',
        userTypeId: 'admin'
      };

      const mockResponse: LoginResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        user: mockUser
      };
      
      // Guardar datos inmediatamente
      localStorage.setItem(this.tokenKey, mockResponse.token);
      localStorage.setItem(this.userKey, JSON.stringify(mockResponse.user));
      this.currentUserSubject.next(mockResponse.user);
      
      // Simular delay mínimo
      return new Observable(observer => {
        setTimeout(() => {
          observer.next(mockResponse);
          observer.complete();
        }, 500);
      });
    } else {
      return new Observable(observer => {
        setTimeout(() => {
          observer.error({ error: { message: 'Credenciales inválidas' } });
        }, 1000);
      });
    }
    
    // Código real para cuando la API esté disponible:
    // return this.http.post<LoginResponse>(`${this.baseUrl}/api/Auth/Login`, loginRequest).pipe(
    //   tap(response => {
    //     localStorage.setItem(this.tokenKey, response.token);
    //     localStorage.setItem(this.userKey, JSON.stringify(response.user));
    //     this.currentUserSubject.next(response.user);
    //   })
    // );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
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
  getRoles(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(`${this.baseUrl}/api/Roles`);
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
}
