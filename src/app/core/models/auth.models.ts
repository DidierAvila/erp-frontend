// Auth Models basados en la API Swagger

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
  twoFactorRecoveryCode?: string;
}

export interface UserDto {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  phone?: string;
  userTypeId: string;
  addres?: string;
  additionalData?: { [key: string]: string | number | boolean };
  roles?: RoleDto[]; // Roles asignados al usuario
  createdAt?: string;
  updatedAt?: string;
  menuPermissions?: MenuPermissions; // Permisos de menú del usuario
  // Propiedades adicionales para compatibilidad con el frontend
  roleName?: string;
  userTypeName?: string;
  isActive?: boolean;
}

export interface CreateUserDto {
  email?: string;
  name?: string;
  password?: string;
  image?: string;
  phone?: string;
  userTypeId: string;
  addres?: string;
  additionalData?: { [key: string]: string | number | boolean };
  roleIds?: string[]; // IDs de roles a asignar
}

export interface UpdateUserDto {
  image?: string;
  phone?: string;
  userTypeId?: string;
  addres?: string;
  additionalData?: { [key: string]: string | number | boolean };
  roleIds?: string[]; // IDs de roles a asignar
}

export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword?: string;
}

export interface RoleDto {
  id: string;
  name?: string;
  description?: string;
  status?: boolean;
  permissions?: PermissionDto[];
}

export interface CreateRoleDto {
  name?: string;
  description?: string;
  status?: boolean;
  permissionIds?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

export interface PermissionDto {
  id: string;
  name?: string;
  description?: string;
}

export interface CreatePermissionDto {
  name?: string;
  description?: string;
}

export interface UpdatePermissionDto {
  name?: string;
  description?: string;
}

// Interfaces para tipos de usuario (preparadas para futura implementación en API)
export interface UserTypeDto {
  id: string;
  name?: string;
  description?: string;
  isActive: boolean;
}

export interface CreateUserTypeDto {
  name?: string;
  description?: string;
  isActive: boolean;
}

export interface UpdateUserTypeDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface UserAdditionalValueResponseDto {
  key?: string;
  value?: string | number | boolean;
  exists: boolean;
}

export interface UpdateUserAdditionalDataDto {
  additionalData?: { [key: string]: string | number | boolean };
}

// Interfaces para permisos de menú
export interface MenuPermissions {
  dashboard?: boolean;
  auth?: ModulePermissions;
  inventory?: ModulePermissions;
  purchases?: ModulePermissions;
  sales?: ModulePermissions;
  finance?: ModulePermissions;
}

export interface ModulePermissions {
  access?: boolean;
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
  submodules?: { [key: string]: ModulePermissions };
}

// Respuesta del endpoint /api/Auth/me
export interface NavigationItem {
  id: string;
  label: string;
  route: string | null;
  icon: string;
  order: number;
  visible: boolean;
  children: NavigationItem[];
}

export interface UserPermissions {
  [key: string]: {
    read: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    export: boolean;
    import: boolean;
  };
}

export interface UserMeResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      roleId: string;
      avatar: string;
    };
    navigation: NavigationItem[];
    permissions: UserPermissions;
  };
}

// Interfaz legacy para compatibilidad
export interface UserMeResponseLegacy {
  user: UserDto;
  permissions: MenuPermissions;
}
