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

export interface UserAdditionalValueResponseDto {
  key?: string;
  value?: any;
  exists: boolean;
}

export interface UpdateUserAdditionalDataDto {
  additionalData?: { [key: string]: any };
}
