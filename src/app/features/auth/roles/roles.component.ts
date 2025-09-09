import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services';
import { RoleDto, CreateRoleDto, UpdateRoleDto } from '../../../core/models';

// Interfaz extendida para la tabla
interface ExtendedRoleDto extends RoleDto {
  createdAt?: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDividerModule
  ],
  template: `
    <div class="roles-container">
      <!-- Formulario de Rol (Solo visible cuando showForm es true) -->
      <mat-card class="form-card" *ngIf="showForm()">
        <mat-card-header>
          <mat-card-title>
            <div class="form-header">
              <mat-icon>{{isViewingRole() ? 'visibility' : (editingRole() ? 'edit' : 'add')}}</mat-icon>
              <span>{{isViewingRole() ? 'Ver Rol' : (editingRole() ? 'Editar Rol' : 'Crear Nuevo Rol')}}</span>
            </div>
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="roleForm" class="role-form">
            <!-- Información del Rol -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>admin_panel_settings</mat-icon>
                Información del Rol
              </h3>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nombre del Rol</mat-label>
                  <input matInput formControlName="name" placeholder="Administrador" required>
                  <mat-icon matSuffix>badge</mat-icon>
                  <mat-error *ngIf="roleForm.get('name')?.hasError('required')">
                    El nombre del rol es requerido
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Descripción</mat-label>
                  <textarea matInput formControlName="description" 
                           placeholder="Descripción del rol y sus responsabilidades"
                           rows="3"></textarea>
                  <mat-icon matSuffix>description</mat-icon>
                </mat-form-field>
              </div>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions align="end" class="form-actions">
          <button mat-button (click)="cancelForm()" [disabled]="isLoading()">
            <mat-icon>{{isViewingRole() ? 'arrow_back' : 'cancel'}}</mat-icon>
            {{isViewingRole() ? 'Volver' : 'Cancelar'}}
          </button>
          <button 
            *ngIf="!isViewingRole()"
            mat-raised-button 
            color="primary" 
            (click)="saveRole()"
            [disabled]="!roleForm.valid || isLoading()">
            <mat-icon>{{editingRole() ? 'save' : 'add'}}</mat-icon>
            {{editingRole() ? 'Actualizar Rol' : 'Crear Rol'}}
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- Filtros y Tabla -->
      <div class="content-section" *ngIf="!showForm()">
        <!-- Botón Crear Rol -->
        <div class="create-role-section">
          <button mat-raised-button class="create-role-btn" (click)="openRoleForm()" [disabled]="isLoading()">
            <mat-icon>add</mat-icon>
            Crear Rol
          </button>
        </div>

        <!-- Barra de Herramientas y Filtros -->
        <mat-card class="filters-card">
          <mat-card-content>
            <div class="filters-row">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Buscar roles</mat-label>
                <input matInput (keyup)="applyFilter($event)" placeholder="Nombre, descripción...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <div class="filter-actions">
                <button mat-icon-button (click)="refreshRoles()" matTooltip="Actualizar lista" class="action-btn">
                  <mat-icon>refresh</mat-icon>
                </button>

                <button mat-icon-button [matMenuTriggerFor]="exportMenu" matTooltip="Exportar" class="action-btn">
                  <mat-icon>file_download</mat-icon>
                </button>
              </div>
              <mat-menu #exportMenu="matMenu">
                <button mat-menu-item (click)="exportToExcel()">
                  <mat-icon>table_view</mat-icon>
                  Exportar a Excel
                </button>
                <button mat-menu-item (click)="exportToPDF()">
                  <mat-icon>picture_as_pdf</mat-icon>
                  Exportar a PDF
                </button>
              </mat-menu>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Tabla Principal -->
        <mat-card class="table-card">
          <mat-card-content>
            <div class="table-container" [class.loading]="isLoading()">
              <table mat-table [dataSource]="dataSource" matSort class="roles-table">
                
                <!-- Columna ID -->
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                  <td mat-cell *matCellDef="let role" class="id-cell">
                    <span class="role-id">#{{role.id}}</span>
                  </td>
                </ng-container>

                <!-- Columna Nombre -->
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th>
                  <td mat-cell *matCellDef="let role" class="name-cell">
                    <div class="role-info">
                      <div class="role-avatar">
                        <mat-icon>admin_panel_settings</mat-icon>
                      </div>
                      <div class="role-name">{{role.name}}</div>
                    </div>
                  </td>
                </ng-container>

                <!-- Columna Descripción -->
                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Descripción</th>
                  <td mat-cell *matCellDef="let role" class="description-cell">
                    <span class="role-description">{{role.description || 'Sin descripción'}}</span>
                  </td>
                </ng-container>

                <!-- Columna Permisos -->
                <ng-container matColumnDef="permissions">
                  <th mat-header-cell *matHeaderCellDef>Permisos</th>
                  <td mat-cell *matCellDef="let role" class="permissions-cell">
                    <div class="permissions-container">
                      <mat-chip-listbox>
                        <mat-chip *ngFor="let permission of role.permissions?.slice(0, 2)" 
                                 class="permission-chip">
                          {{permission.name}}
                        </mat-chip>
                      </mat-chip-listbox>
                      <span *ngIf="(role.permissions?.length || 0) > 2" class="more-permissions">
                        +{{(role.permissions?.length || 0) - 2}} más
                      </span>
                    </div>
                  </td>
                </ng-container>

                <!-- Columna Fecha de Creación -->
                <ng-container matColumnDef="createdAt">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Creado</th>
                  <td mat-cell *matCellDef="let role" class="date-cell">
                    <div class="date-info">
                      <span class="date">{{formatDate(role.createdAt)}}</span>
                      <span class="time">{{formatTime(role.createdAt)}}</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Columna Acciones -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef class="actions-header">Acciones</th>
                  <td mat-cell *matCellDef="let role" class="actions-cell">
                    <div class="action-buttons">
                      <button mat-icon-button (click)="viewRole(role)" matTooltip="Ver detalles" class="view-btn">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      <button mat-icon-button (click)="editRole(role)" matTooltip="Editar rol" class="edit-btn">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button (click)="deleteRole(role)" matTooltip="Eliminar rol" class="delete-btn">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <!-- Header y Filas -->
                <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

                <!-- Fila para cuando no hay datos -->
                <tr class="mat-row" *matNoDataRow>
                  <td class="mat-cell no-data-row" [attr.colspan]="displayedColumns.length">
                    <div class="no-data-message">
                      <mat-icon>admin_panel_settings</mat-icon>
                      <span>No se encontraron roles</span>
                      <button mat-raised-button color="primary" (click)="openRoleForm()">
                        <mat-icon>add</mat-icon>
                        Agregar primer rol
                      </button>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .roles-container {
      padding: 0;
      height: 100%;
      overflow: hidden;
    }



    .content-section {
      margin-top: 12px;
    }

    .create-role-section {
      display: flex;
      justify-content: flex-start;
      margin-bottom: 16px;
      padding: 0 4px;
    }

    .form-card {
      margin-bottom: 20px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .form-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .role-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 16px;
    }

    .form-section {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      background: #fafafa;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      color: #1976d2;
      font-weight: 500;
    }

    .section-title mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .form-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      background: #fafafa;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .form-row .mat-form-field {
      flex: 1;
    }

    .filters-card {
      margin-bottom: 16px;
      box-shadow: none;
      border-radius: 8px;
      border: none;
    }

    .filters-card .mat-mdc-card-content {
      padding: 16px 20px !important;
      border-bottom: none !important;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
      min-height: 48px;
      border: none;
      box-shadow: none;
    }

    .filters-row .mat-mdc-form-field {
      font-size: 14px;
    }

    .search-field {
      min-width: 300px;
      flex: 1;
    }

    .filter-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      height: 36px;
    }

    .action-btn {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 4px;
      color: #666;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background-color: #f5f5f5;
      color: #333;
    }

    .create-role-btn {
      background-color: #1976d2;
      color: white;
      font-weight: 500;
      box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
      flex-shrink: 0;
      height: 40px;
    }

    .create-role-btn:hover {
      background-color: #1565c0;
      box-shadow: 0 4px 8px rgba(25, 118, 210, 0.4);
    }

    .create-role-btn:disabled {
      background-color: #e0e0e0;
      color: #9e9e9e;
      box-shadow: none;
    }

    .table-card {
      width: 100%;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .table-container {
      width: 100%;
      overflow: visible;
    }

    .roles-table {
      width: 100%;
    }

    /* Estilos específicos para columnas de tabla */
    .id-cell {
      width: 80px;
      max-width: 80px;
    }

    .role-id {
      font-family: monospace;
      font-weight: bold;
      color: #666;
    }

    .name-cell {
      width: 200px;
      max-width: 200px;
    }

    .role-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .role-avatar {
      flex-shrink: 0;
    }

    .role-avatar mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #666;
    }

    .role-name {
      font-weight: 500;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .description-cell {
      width: 250px;
      max-width: 250px;
    }

    .role-description {
      color: #666;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .permissions-cell {
      width: 200px;
      max-width: 200px;
    }

    .permissions-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .permission-chip {
      font-size: 11px;
      height: 24px;
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .more-permissions {
      font-size: 12px;
      color: #666;
      font-style: italic;
    }

    .date-cell {
      width: 120px;
      max-width: 120px;
    }

    .date-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .date {
      font-size: 13px;
      color: #333;
    }

    .time {
      font-size: 11px;
      color: #666;
    }

    .actions-cell {
      width: 120px;
      max-width: 120px;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
    }

    .view-btn {
      color: #000;
    }

    .edit-btn {
      color: #000;
    }

    .delete-btn {
      color: #000;
    }

    .actions-header {
      text-align: center;
    }

    .no-data-row {
      height: 200px;
      text-align: center;
    }

    .no-data-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      color: #666;
    }

    .no-data-message mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class RolesComponent implements OnInit {
  roleForm: FormGroup;
  showForm = signal(false);
  editingRole = signal<RoleDto | null>(null);
  isLoading = signal(false);
  isViewingRole = signal(false);
  
  displayedColumns: string[] = ['id', 'name', 'description', 'permissions', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<ExtendedRoleDto>([]);
  
  // Datos simulados para desarrollo
  mockRoles: ExtendedRoleDto[] = [
    {
      id: '1',
      name: 'Administrador',
      description: 'Acceso completo al sistema',
      permissions: [
        { id: '1', name: 'Crear usuarios' },
        { id: '2', name: 'Editar usuarios' },
        { id: '3', name: 'Eliminar usuarios' }
      ],
      createdAt: '2025-01-10T09:00:00'
    },
    {
      id: '2',
      name: 'Gerente',
      description: 'Gestión de equipos y reportes',
      permissions: [
        { id: '4', name: 'Ver reportes' },
        { id: '5', name: 'Gestionar equipos' }
      ],
      createdAt: '2025-02-15T14:30:00'
    },
    {
      id: '3',
      name: 'Empleado',
      description: 'Acceso básico para tareas diarias',
      permissions: [
        { id: '6', name: 'Ver perfil' }
      ],
      createdAt: '2025-03-20T11:15:00'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoading.set(true);
    
    // Simular carga desde API
    setTimeout(() => {
      this.dataSource.data = [...this.mockRoles];
      this.isLoading.set(false);
    }, 1000);
  }

  openRoleForm(): void {
    this.showForm.set(true);
    this.editingRole.set(null);
    this.isViewingRole.set(false);
    this.roleForm.reset();
    this.roleForm.enable();
  }

  editRole(role: ExtendedRoleDto): void {
    this.editingRole.set(role);
    this.isViewingRole.set(false);
    this.roleForm.patchValue({
      name: role.name,
      description: role.description
    });
    // Habilitar todos los campos del formulario para modo de edición
    this.roleForm.enable();
    this.showForm.set(true);
  }

  saveRole(): void {
    if (this.roleForm.valid) {
      this.isLoading.set(true);
      
      setTimeout(() => {
        if (this.editingRole()) {
          // Actualizar rol
          const index = this.mockRoles.findIndex(r => r.id === this.editingRole()?.id);
          if (index !== -1) {
            this.mockRoles[index] = {
              ...this.mockRoles[index],
              ...this.roleForm.value,
              id: this.editingRole()!.id
            };
          }
          this.snackBar.open('Rol actualizado correctamente', 'Cerrar', { duration: 3000 });
        } else {
          // Crear nuevo rol
          const maxId = Math.max(...this.mockRoles.map(r => parseInt(r.id)));
          const newRole: ExtendedRoleDto = {
            id: (maxId + 1).toString(),
            ...this.roleForm.value,
            permissions: [],
            createdAt: new Date().toISOString(),
            isActive: true
          };
          this.mockRoles.push(newRole);
          this.snackBar.open('Rol creado correctamente', 'Cerrar', { duration: 3000 });
        }
        
        this.dataSource.data = [...this.mockRoles];
        this.isLoading.set(false);
        this.showForm.set(false);
      }, 1500);
    }
  }

  deleteRole(role: ExtendedRoleDto): void {
    if (confirm(`¿Está seguro de eliminar el rol "${role.name}"?`)) {
      const index = this.mockRoles.findIndex(r => r.id === role.id);
      if (index !== -1) {
        this.mockRoles.splice(index, 1);
        this.dataSource.data = [...this.mockRoles];
        this.snackBar.open('Rol eliminado correctamente', 'Cerrar', { duration: 3000 });
      }
    }
  }

  // Métodos de filtrado y búsqueda
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  refreshRoles(): void {
    this.loadRoles();
    this.snackBar.open('Lista de roles actualizada', 'Cerrar', { duration: 2000 });
  }

  // Métodos de visualización
  viewRole(role: ExtendedRoleDto): void {
    this.editingRole.set(role);
    this.isViewingRole.set(true);
    this.roleForm.patchValue({
      name: role.name,
      description: role.description
    });
    // Deshabilitar todos los campos del formulario para modo de solo lectura
    this.roleForm.disable();
    this.showForm.set(true);
    this.snackBar.open(`Visualizando detalles de ${role.name}`, 'Cerrar', { duration: 2000 });
  }

  // Métodos de exportación
  exportToExcel(): void {
    this.snackBar.open('Exportando a Excel...', 'Cerrar', { duration: 2000 });
  }

  exportToPDF(): void {
    this.snackBar.open('Exportando a PDF...', 'Cerrar', { duration: 2000 });
  }

  // Métodos de formato
  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingRole.set(null);
    this.isViewingRole.set(false);
    this.roleForm.reset();
    this.roleForm.enable();
  }
}
