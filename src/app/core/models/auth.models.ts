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
  additionalData?: { [key: string]: any };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  email?: string;
  name?: string;
  password?: string;
  image?: string;
  phone?: string;
  userTypeId: string;
  addres?: string;
  additionalData?: { [key: string]: any };
}

export interface UpdateUserDto {
  image?: string;
  phone?: string;
  userTypeId?: string;
  addres?: string;
  additionalData?: { [key: string]: any };
}

export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword?: string;
}

export interface RoleDto {
  id: string;
  name?: string;
  description?: string;
  permissions?: PermissionDto[];
}

export interface CreateRoleDto {
  name?: string;
  description?: string;
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
  value?: any;
  exists: boolean;
}

export interface UpdateUserAdditionalDataDto {
  additionalData?: { [key: string]: any };
}
