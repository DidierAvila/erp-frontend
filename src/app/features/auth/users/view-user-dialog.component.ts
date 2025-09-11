import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { UserDto, UserTypeDto } from '../../../core/models';

interface ExtendedUserDto extends UserDto {
  userTypes?: UserTypeDto[];
}

@Component({
  selector: 'app-view-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>person</mat-icon>
      Detalles del Usuario
    </h2>
    
    <div mat-dialog-content class="dialog-content">
      <mat-card class="user-info-card">
        <mat-card-content>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">
                <mat-icon>fingerprint</mat-icon>
                ID
              </div>
              <div class="info-value">{{ data.id }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">
                <mat-icon>person</mat-icon>
                Nombre
              </div>
              <div class="info-value">{{ data.name || 'No especificado' }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">
                <mat-icon>email</mat-icon>
                Email
              </div>
              <div class="info-value">{{ data.email || 'No especificado' }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">
                <mat-icon>phone</mat-icon>
                Teléfono
              </div>
              <div class="info-value">{{ data.phone || 'No especificado' }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">
                <mat-icon>location_on</mat-icon>
                Dirección
              </div>
              <div class="info-value">{{ data.addres || 'No especificada' }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">
                <mat-icon>assignment_ind</mat-icon>
                Tipo de Usuario
              </div>
              <div class="info-value">
                <mat-chip class="user-type-chip">{{ getUserTypeLabel() }}</mat-chip>
              </div>
            </div>

            <div class="info-item" *ngIf="data.createdAt">
              <div class="info-label">
                <mat-icon>schedule</mat-icon>
                Fecha de Creación
              </div>
              <div class="info-value">{{ formatDate(data.createdAt) }}</div>
            </div>

            <div class="info-item" *ngIf="data.updatedAt">
              <div class="info-label">
                <mat-icon>update</mat-icon>
                Última Actualización
              </div>
              <div class="info-value">{{ formatDate(data.updatedAt) }}</div>
            </div>
          </div>

          <!-- Roles del usuario -->
          <div *ngIf="hasRoles()" class="roles-section">
            <h3 class="section-title">
              <mat-icon>admin_panel_settings</mat-icon>
              Roles Asignados
            </h3>
            
            <div class="roles-chips">
              <mat-chip-set>
                <mat-chip *ngFor="let role of data.roles" class="role-chip">
                  <mat-icon matChipAvatar>security</mat-icon>
                  {{ role.name }}
                  <div class="role-description" *ngIf="role.description">
                    {{ role.description }}
                  </div>
                </mat-chip>
              </mat-chip-set>
            </div>
          </div>

          <!-- Sin roles asignados -->
          <div *ngIf="!hasRoles()" class="no-roles-section">
            <h3 class="section-title">
              <mat-icon>admin_panel_settings</mat-icon>
              Roles Asignados
            </h3>
            <div class="no-roles-message">
              <mat-icon>info</mat-icon>
              <span>Este usuario no tiene roles asignados</span>
            </div>
          </div>

          <!-- Campos adicionales -->
          <div *ngIf="hasAdditionalData()" class="additional-data-section">
            <h3 class="section-title">
              <mat-icon>extension</mat-icon>
              Información Adicional
            </h3>
            
            <div class="additional-fields">
              <div *ngFor="let field of getAdditionalFields()" class="additional-field">
                <div class="field-label">{{ formatFieldLabel(field.key) }}</div>
                <div class="field-value">{{ field.value }}</div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Cerrar</button>
      <button mat-raised-button color="primary" (click)="onEdit()">
        <mat-icon>edit</mat-icon>
        Editar
      </button>
    </div>
  `,
  styles: [`
    .dialog-content {
      width: 600px;
      max-height: 70vh;
      overflow-y: auto;
    }
    
    .user-info-card {
      margin: 0;
    }
    
    .info-grid {
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .info-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      color: #666;
      font-size: 14px;
    }
    
    .info-value {
      padding: 8px 12px;
      background: #f5f5f5;
      border-radius: 4px;
      border-left: 3px solid #1976d2;
      font-size: 14px;
      min-height: 20px;
    }
    
    .user-type-chip {
      background: #e3f2fd;
      color: #1976d2;
      font-weight: 500;
    }
    
    .additional-data-section {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      color: #1976d2;
      font-size: 16px;
      font-weight: 500;
    }
    
    .roles-section, .no-roles-section {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }
    
    .roles-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .role-chip {
      background-color: #e3f2fd !important;
      color: #1976d2 !important;
      border: 1px solid #bbdefb !important;
      font-weight: 500;
    }
    
    .role-description {
      font-size: 10px;
      font-weight: normal;
      color: #666;
      margin-top: 2px;
    }
    
    .no-roles-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background-color: #fff3e0;
      border: 1px solid #ffcc02;
      border-radius: 8px;
      color: #e65100;
      font-style: italic;
    }
    
    .additional-fields {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }
    
    .additional-field {
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
    }
    
    .field-label {
      font-weight: 500;
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    
    .field-value {
      font-size: 14px;
      color: #333;
    }
    
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }
  `]
})
export class ViewUserDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ViewUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExtendedUserDto
  ) {}

  hasAdditionalData(): boolean {
    return !!(this.data.additionalData && Object.keys(this.data.additionalData).length > 0);
  }

  hasRoles(): boolean {
    return !!(this.data.roles && this.data.roles.length > 0);
  }

  getAdditionalFields(): { key: string; value: any }[] {
    if (!this.data.additionalData) return [];
    
    return Object.entries(this.data.additionalData).map(([key, value]) => ({
      key,
      value
    }));
  }

  formatFieldLabel(key: string): string {
    return key.replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .trim();
  }

  getUserTypeLabel(): string {
    if (this.data.userTypes) {
      const userType = this.data.userTypes.find(type => type.id === this.data.userTypeId);
      return userType?.name || this.data.userTypeId;
    }
    return this.data.userTypeId;
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onEdit(): void {
    this.dialogRef.close('edit');
  }
}
