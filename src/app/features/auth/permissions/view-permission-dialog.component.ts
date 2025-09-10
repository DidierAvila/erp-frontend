import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

interface ExtendedPermission {
  id?: string;
  name?: string;
  description?: string;
  normalizedName?: string;
}

@Component({
  selector: 'app-view-permission-dialog',
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
      <mat-icon>security</mat-icon>
      Detalles del Permiso
    </h2>
    <mat-dialog-content>
      <div class="permission-details">
        <div class="detail-row">
          <span class="label">ID:</span>
          <span class="value">{{ data.permission.id || 'N/A' }}</span>
        </div>
        
        <mat-divider></mat-divider>
        
        <div class="detail-row">
          <span class="label">Nombre:</span>
          <span class="value">{{ data.permission.name || 'N/A' }}</span>
        </div>
        
        <mat-divider></mat-divider>
        
        <div class="detail-row">
          <span class="label">Nombre Normalizado:</span>
          <span class="value code">{{ data.permission.normalizedName || 'N/A' }}</span>
        </div>
        
        <mat-divider></mat-divider>
        
        <div class="detail-row full-width">
          <span class="label">Descripción:</span>
          <p class="value description">{{ data.permission.description || 'Sin descripción disponible' }}</p>
        </div>
        
        <mat-divider></mat-divider>
        
        <div class="detail-row">
          <span class="label">Categoría:</span>
          <div class="value">
            <mat-chip-set>
              <mat-chip [class]="'category-' + getCategoryClass(data.permission.name)">
                {{ getPermissionCategory(data.permission.name) }}
              </mat-chip>
            </mat-chip-set>
          </div>
        </div>
        
        <mat-divider></mat-divider>
        
        <div class="detail-row">
          <span class="label">Estado:</span>
          <div class="value">
            <mat-chip-set>
              <mat-chip color="primary" selected>
                <mat-icon>check_circle</mat-icon>
                Activo
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
    .permission-details {
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

    .value.code {
      font-family: 'Courier New', monospace;
      background-color: #f5f5f5;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
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

    /* Category chip styles */
    .category-usuarios { background-color: #e3f2fd; color: #1976d2; }
    .category-roles { background-color: #f3e5f5; color: #7b1fa2; }
    .category-productos { background-color: #fff3e0; color: #f57c00; }
    .category-ventas { background-color: #ffebee; color: #c62828; }
    .category-compras { background-color: #e0f2f1; color: #00695c; }
    .category-finanzas { background-color: #fce4ec; color: #ad1457; }
    .category-sistema { background-color: #f5f5f5; color: #666; }
  `]
})
export class ViewPermissionDialogComponent {
  private dialogRef = inject(MatDialogRef<ViewPermissionDialogComponent>);
  protected data = inject(MAT_DIALOG_DATA) as { permission: ExtendedPermission };

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

  getCategoryClass(permissionName: string | undefined): string {
    if (!permissionName) return 'sistema';
    const name = permissionName.toLowerCase();
    if (name.includes('user') || name.includes('usuario')) return 'usuarios';
    if (name.includes('role') || name.includes('rol')) return 'roles';
    if (name.includes('product') || name.includes('producto')) return 'productos';
    if (name.includes('sale') || name.includes('venta')) return 'ventas';
    if (name.includes('purchase') || name.includes('compra')) return 'compras';
    if (name.includes('finance') || name.includes('finanza')) return 'finanzas';
    return 'sistema';
  }

  onClose() {
    this.dialogRef.close();
  }

  onEdit() {
    this.dialogRef.close({ action: 'edit', permission: this.data.permission });
  }
}
