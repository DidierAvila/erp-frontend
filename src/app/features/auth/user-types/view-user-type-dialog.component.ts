import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

interface UserType {
  id?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  userCount?: number;
}

@Component({
  selector: 'app-view-user-type-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>group</mat-icon>
      Detalles del Tipo de Usuario
    </h2>
    <mat-dialog-content>
      <div class="user-type-details">
        <div class="detail-row">
          <span class="label">ID:</span>
          <span class="value">{{ data.userType.id || 'N/A' }}</span>
        </div>
        
        <mat-divider></mat-divider>
        
        <div class="detail-row">
          <span class="label">Nombre:</span>
          <span class="value">{{ data.userType.name || 'N/A' }}</span>
        </div>
        
        <mat-divider></mat-divider>
        
        <div class="detail-row full-width">
          <span class="label">Descripción:</span>
          <p class="value description">{{ data.userType.description || 'Sin descripción disponible' }}</p>
        </div>
        
        <mat-divider></mat-divider>
        
        <div class="detail-row">
          <span class="label">Estado:</span>
          <div class="value">
            <mat-chip-set>
              <mat-chip [color]="data.userType.isActive ? 'primary' : 'warn'" selected>
                <mat-icon>{{ data.userType.isActive ? 'check_circle' : 'cancel' }}</mat-icon>
                {{ data.userType.isActive ? 'Activo' : 'Inactivo' }}
              </mat-chip>
            </mat-chip-set>
          </div>
        </div>
        
        <mat-divider></mat-divider>
        
        <div class="detail-row">
          <span class="label">Usuarios Asignados:</span>
          <div class="value">
            <mat-chip-set>
              <mat-chip color="accent" selected>
                <mat-icon>people</mat-icon>
                {{ data.userType.userCount || 0 }} usuarios
              </mat-chip>
            </mat-chip-set>
          </div>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Cerrar</button>
      <button mat-raised-button color="primary" (click)="onEdit()">
        <mat-icon>edit</mat-icon>
        Editar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .user-type-details {
      padding: 16px 0;
    }

    .detail-row {
      display: flex;
      align-items: flex-start;
      padding: 12px 0;
      gap: 16px;
    }

    .detail-row.full-width {
      flex-direction: column;
      gap: 8px;
    }

    .label {
      font-weight: 600;
      color: #333;
      min-width: 140px;
      flex-shrink: 0;
    }

    .value {
      flex: 1;
      color: #666;
    }

    .description {
      margin: 0;
      line-height: 1.5;
      padding: 8px 12px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #1976d2;
    }

    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1976d2;
    }

    mat-chip-set {
      display: flex;
    }

    mat-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }

    mat-divider {
      margin: 8px 0;
    }
  `]
})
export class ViewUserTypeDialogComponent {
  private dialogRef = inject(MatDialogRef<ViewUserTypeDialogComponent>);
  protected data = inject(MAT_DIALOG_DATA) as { userType: UserType };

  onClose() {
    this.dialogRef.close();
  }

  onEdit() {
    this.dialogRef.close({ action: 'edit', userType: this.data.userType });
  }
}
