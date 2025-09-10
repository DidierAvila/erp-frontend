import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface ExtendedPermission {
  id?: string;
  name?: string;
  description?: string;
  normalizedName?: string;
}

@Component({
  selector: 'app-view-roles-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>group</mat-icon>
      Roles con el permiso: {{ data.permission.name }}
    </h2>
    <mat-dialog-content>
      <div class="permission-info">
        <p><strong>Descripción:</strong> {{ data.permission.description }}</p>
        <p><strong>Categoría:</strong> 
          <mat-chip-set>
            <mat-chip>{{ getPermissionCategory(data.permission.name) }}</mat-chip>
          </mat-chip-set>
        </p>
      </div>
      
      <div class="roles-section">
        <h3>Roles que tienen este permiso:</h3>
        
        <div *ngIf="isLoading" class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando roles...</p>
        </div>
        
        <mat-list *ngIf="!isLoading && roles.length > 0">
          <mat-list-item *ngFor="let role of roles">
            <mat-icon matListItemIcon>security</mat-icon>
            <div matListItemTitle>{{ role.name }}</div>
            <div matListItemLine>{{ role.description }}</div>
          </mat-list-item>
        </mat-list>
        
        <div *ngIf="!isLoading && roles.length === 0" class="no-roles">
          <mat-icon>info</mat-icon>
          <p>Este permiso no está asignado a ningún rol actualmente.</p>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .permission-info {
      margin-bottom: 20px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .roles-section h3 {
      margin: 16px 0 12px 0;
      color: #333;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
    }

    .loading-container p {
      margin-top: 12px;
      color: #666;
    }

    .no-roles {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      color: #666;
    }

    .no-roles mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
    }

    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    mat-chip-set {
      display: flex;
    }
  `]
})
export class ViewRolesDialogComponent {
  private dialogRef = inject(MatDialogRef<ViewRolesDialogComponent>);
  protected data = inject(MAT_DIALOG_DATA) as { permission: ExtendedPermission };

  roles: any[] = [];
  isLoading = true;

  constructor() {
    this.loadRolesWithPermission();
  }

  private async loadRolesWithPermission() {
    try {
      // Simulamos la carga de roles por ahora
      // En el futuro esto debería llamar al servicio para obtener roles reales
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Datos simulados
      this.roles = [
        {
          name: 'Administrador',
          description: 'Acceso completo al sistema'
        },
        {
          name: 'Supervisor',
          description: 'Acceso de supervisión'
        }
      ];
    } catch (error) {
      console.error('Error loading roles:', error);
      this.roles = [];
    } finally {
      this.isLoading = false;
    }
  }

  getPermissionCategory(permissionName: string | undefined): string {
    if (!permissionName) return 'Sistema';
    const name = permissionName.toLowerCase();
    if (name.includes('user') || name.includes('usuario')) return 'Usuarios';
    if (name.includes('role') || name.includes('rol')) return 'Roles';
    if (name.includes('product') || name.includes('producto')) return 'Productos';
    if (name.includes('sale') || name.includes('venta')) return 'Ventas';
    if (name.includes('purchase') || name.includes('compra')) return 'Compras';
    if (name.includes('finance') || name.includes('finanza')) return 'Finanzas';
    return 'Sistema';
  }

  onClose() {
    this.dialogRef.close();
  }
}
