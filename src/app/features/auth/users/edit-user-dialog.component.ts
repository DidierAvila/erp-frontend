import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { UpdateUserDto, UserDto, UserTypeDto, RoleDto } from '../../../core/models';
import { AuthService } from '../../../core/services';

interface ExtendedUserDto extends UserDto {
  userTypes?: UserTypeDto[];
}

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatExpansionModule,
    MatChipsModule,
    MatCheckboxModule,
    MatListModule
  ],
  template: `
    <h2 mat-dialog-title>Editar Usuario</h2>
    <div mat-dialog-content class="dialog-content">
      <form #userForm="ngForm">
        <!-- Información básica (solo lectura) -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput [value]="data.email" readonly>
          <mat-icon matSuffix>email</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput [value]="data.name" readonly>
          <mat-icon matSuffix>person</mat-icon>
        </mat-form-field>

        <!-- Campos editables -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Teléfono</mat-label>
          <input matInput [(ngModel)]="user.phone" name="phone">
          <mat-icon matSuffix>phone</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Dirección</mat-label>
          <input matInput [(ngModel)]="user.addres" name="addres">
          <mat-icon matSuffix>location_on</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tipo de Usuario</mat-label>
          <mat-select [(ngModel)]="user.userTypeId" name="userTypeId" required>
            <mat-option *ngFor="let type of data.userTypes" [value]="type.id">
              {{ type.name }}
            </mat-option>
          </mat-select>
          <mat-icon matSuffix>assignment_ind</mat-icon>
        </mat-form-field>

        <!-- Selección de Roles -->
        <mat-expansion-panel class="roles-section" [expanded]="true">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>admin_panel_settings</mat-icon>
              Roles del Usuario
            </mat-panel-title>
            <mat-panel-description>
              @if (selectedRoles.length > 0) {
                {{ selectedRoles.length }} rol(es) seleccionado(s)
                @if (rolesHaveChanged()) {
                  <mat-icon class="changed-indicator">edit</mat-icon>
                }
              } @else {
                Sin roles asignados
              }
            </mat-panel-description>
          </mat-expansion-panel-header>
          
          <div class="roles-content">
            @if (availableRoles.length > 0) {
              <div class="roles-list">
                @for (role of availableRoles; track role.id) {
                  <div class="role-checkbox-item">
                    <mat-checkbox 
                      [checked]="isRoleSelected(role.id)"
                      (change)="onRoleSelectionChange(role.id, $event.checked)"
                      class="role-checkbox">
                      <div class="role-info">
                        <div class="role-name">{{ role.name }}</div>
                        @if (role.description) {
                          <div class="role-description">{{ role.description }}</div>
                        }
                      </div>
                    </mat-checkbox>
                  </div>
                }
              </div>
              
              @if (selectedRoles.length > 0) {
                <div class="selected-roles-summary">
                  <strong>Roles seleccionados:</strong>
                  <mat-chip-set class="selected-chips">
                    @for (roleName of getSelectedRoleNames(); track roleName) {
                      <mat-chip>{{ roleName }}</mat-chip>
                    }
                  </mat-chip-set>
                  
                  @if (rolesHaveChanged()) {
                    <div class="changes-indicator">
                      <mat-icon>info</mat-icon>
                      <span>Los roles han sido modificados</span>
                    </div>
                  }
                </div>
              }
            } @else {
              <div class="no-roles-message">
                <mat-icon>info</mat-icon>
                <span>Cargando roles disponibles...</span>
              </div>
            }
          </div>
        </mat-expansion-panel>

        <!-- Campos adicionales -->
        <mat-expansion-panel class="additional-fields" [expanded]="hasAdditionalData()">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>edit</mat-icon>
              Campos Adicionales
            </mat-panel-title>
          </mat-expansion-panel-header>
          
          <div class="additional-data-section">
            <div *ngFor="let field of additionalFields; let i = index" class="field-row">
              <mat-form-field appearance="outline" class="field-name">
                <mat-label>Nombre del Campo</mat-label>
                <input matInput [(ngModel)]="field.key" [name]="'fieldKey' + i">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="field-value">
                <mat-label>Valor</mat-label>
                <input matInput [(ngModel)]="field.value" [name]="'fieldValue' + i">
              </mat-form-field>
              
              <button mat-icon-button color="warn" type="button" (click)="removeField(i)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
            
            <button mat-stroked-button type="button" (click)="addField()" class="add-field-btn">
              <mat-icon>add</mat-icon>
              Agregar Campo
            </button>
          </div>
        </mat-expansion-panel>
      </form>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onSave()" 
              [disabled]="!userForm.form.valid">
        Actualizar Usuario
      </button>
    </div>
  `,
  styles: [`
    .dialog-content {
      width: 500px;
      max-height: 70vh;
      overflow-y: auto;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .roles-section, .additional-fields {
      margin-top: 16px;
      width: 100%;
    }
    
    .roles-content {
      padding: 16px 0;
    }
    
    .roles-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .role-checkbox-item {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 12px;
      transition: background-color 0.2s;
    }
    
    .role-checkbox-item:hover {
      background-color: #f5f5f5;
    }
    
    .role-checkbox {
      width: 100%;
    }
    
    .role-info {
      margin-left: 8px;
    }
    
    .role-name {
      font-weight: 500;
      font-size: 14px;
      color: #333;
    }
    
    .role-description {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
    
    .selected-roles-summary {
      margin-top: 16px;
      padding: 12px;
      background-color: #f0f8ff;
      border-radius: 8px;
      border-left: 4px solid #1976d2;
    }
    
    .selected-chips {
      margin-top: 8px;
    }
    
    .changes-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      color: #ff9800;
      font-size: 12px;
    }
    
    .changed-indicator {
      color: #ff9800;
      font-size: 18px;
    }
    
    .no-roles-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      color: #666;
      font-style: italic;
    }
    
    .additional-data-section {
      padding: 16px 0;
    }
    
    .field-row {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .field-name, .field-value {
      flex: 1;
    }
    
    .add-field-btn {
      width: 100%;
    }
    
    mat-expansion-panel-header mat-panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class EditUserDialogComponent implements OnInit {
  user: UpdateUserDto = {
    phone: '',
    addres: '',
    userTypeId: '',
    additionalData: {},
    roleIds: []
  };

  additionalFields: { key: string; value: string }[] = [];
  availableRoles: RoleDto[] = [];
  selectedRoles: string[] = [];
  originalRoles: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExtendedUserDto,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Cargar datos actuales del usuario
    this.user = {
      phone: this.data.phone || '',
      addres: this.data.addres || '',
      userTypeId: this.data.userTypeId || '',
      additionalData: this.data.additionalData || {},
      roleIds: []
    };

    // Cargar roles disponibles y roles actuales del usuario
    this.loadAvailableRoles();
    this.loadUserCurrentRoles();

    // Cargar campos adicionales existentes
    if (this.data.additionalData) {
      Object.entries(this.data.additionalData).forEach(([key, value]) => {
        this.additionalFields.push({ key, value: String(value) });
      });
    }

    // Agregar campo vacío si no hay campos adicionales
    if (this.additionalFields.length === 0) {
      this.addField();
    }
  }

  hasAdditionalData(): boolean {
    return this.additionalFields.length > 0 && 
           this.additionalFields.some(field => field.key && field.value);
  }

  addField(): void {
    this.additionalFields.push({ key: '', value: '' });
  }

  removeField(index: number): void {
    this.additionalFields.splice(index, 1);
  }

  /**
   * Cargar roles disponibles desde el servidor
   */
  private loadAvailableRoles(): void {
    this.authService.getAllRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles;
        console.log('Roles disponibles cargados:', roles);
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        // Si falla, crear algunos roles de ejemplo
        this.availableRoles = [
          { id: '1', name: 'Administrador', description: 'Acceso completo al sistema' },
          { id: '2', name: 'Usuario', description: 'Acceso básico al sistema' },
          { id: '3', name: 'Gerente', description: 'Acceso de gestión' }
        ];
      }
    });
  }

  /**
   * Cargar roles actuales del usuario
   */
  private loadUserCurrentRoles(): void {
    if (this.data.id) {
      this.authService.getUserRoles(this.data.id).subscribe({
        next: (roles) => {
          this.originalRoles = roles.map(role => role.id);
          this.selectedRoles = [...this.originalRoles];
          this.user.roleIds = [...this.selectedRoles];
          console.log('Roles actuales del usuario:', roles);
        },
        error: (error) => {
          console.error('Error al cargar roles del usuario:', error);
          // Si falla, usar roles desde data si están disponibles
          if (this.data.roles) {
            this.originalRoles = this.data.roles.map(role => role.id);
            this.selectedRoles = [...this.originalRoles];
            this.user.roleIds = [...this.selectedRoles];
          }
        }
      });
    }
  }

  /**
   * Manejar cambios en la selección de roles
   */
  onRoleSelectionChange(roleId: string, isSelected: boolean): void {
    if (isSelected) {
      if (!this.selectedRoles.includes(roleId)) {
        this.selectedRoles.push(roleId);
      }
    } else {
      const index = this.selectedRoles.indexOf(roleId);
      if (index > -1) {
        this.selectedRoles.splice(index, 1);
      }
    }
    
    // Actualizar el user object
    this.user.roleIds = [...this.selectedRoles];
    console.log('Roles seleccionados:', this.selectedRoles);
  }

  /**
   * Verificar si un rol está seleccionado
   */
  isRoleSelected(roleId: string): boolean {
    return this.selectedRoles.includes(roleId);
  }

  /**
   * Obtener nombres de roles seleccionados para mostrar
   */
  getSelectedRoleNames(): string[] {
    return this.availableRoles
      .filter(role => this.selectedRoles.includes(role.id))
      .map(role => role.name || 'Sin nombre');
  }

  /**
   * Verificar si los roles han cambiado
   */
  rolesHaveChanged(): boolean {
    if (this.originalRoles.length !== this.selectedRoles.length) {
      return true;
    }
    return !this.originalRoles.every(roleId => this.selectedRoles.includes(roleId));
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    // Procesar campos adicionales
    const additionalData: { [key: string]: any } = {};
    
    this.additionalFields.forEach(field => {
      if (field.key && field.value) {
        additionalData[field.key] = field.value;
      }
    });

    // Crear el payload final
    const userData: UpdateUserDto = {
      ...this.user,
      additionalData: Object.keys(additionalData).length > 0 ? additionalData : undefined,
      roleIds: this.rolesHaveChanged() ? this.selectedRoles : undefined
    };

    console.log('Datos a actualizar:', userData);
    console.log('Roles cambiados:', this.rolesHaveChanged());
    this.dialogRef.close(userData);
  }
}
