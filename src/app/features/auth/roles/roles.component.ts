import { Component, OnInit, signal, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../../core/services';
import { RoleDto, CreateRoleDto, UpdateRoleDto } from '../../../core/models';

// Interfaz extendida para la tabla
interface ExtendedRoleDto extends RoleDto {
  createdAt?: string;
  isActive?: boolean;
  isSelected?: boolean;
  permissionCount?: number;
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
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  template: `
    <div class="roles-container">
      <!-- Header con botón -->
      <div class="page-header">
        <button mat-raised-button color="primary" (click)="openRoleForm()" class="create-btn">
          <mat-icon>add</mat-icon>
          Nuevo Rol
        </button>
      </div>

      <!-- Filtros -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar roles</mat-label>
              <input matInput (keyup)="onSearchChange($event)" placeholder="Nombre, descripción...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Filtrar por estado</mat-label>
              <mat-select (selectionChange)="filterByStatus($event.value)">
                <mat-option value="">Todos los estados</mat-option>
                <mat-option value="active">Activos</mat-option>
                <mat-option value="inactive">Inactivos</mat-option>
              </mat-select>
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

      <!-- Results Summary -->
      <div class="results-summary" *ngIf="!isLoading() && roles().length > 0">
        <span class="result-count">
          {{ roles().length }} de {{ roles().length }} roles
        </span>
      </div>

      <!-- Loading -->
      <div class="loading-container" *ngIf="isLoading()">
        <mat-spinner></mat-spinner>
        <p>Cargando roles...</p>
      </div>

      <!-- Roles Table -->
      <mat-card class="table-card" *ngIf="!isLoading()">
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort class="roles-table">

              <!-- Icon Column -->
              <ng-container matColumnDef="icon">
                <th mat-header-cell *matHeaderCellDef>Icono</th>
                <td mat-cell *matCellDef="let role" class="icon-cell">
                  <div class="role-icon">
                    <mat-icon>{{ getRoleIcon(role.name) }}</mat-icon>
                  </div>
                </td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th>
                <td mat-cell *matCellDef="let role" class="name-cell">
                  <div class="role-details">
                    <div class="role-name">{{ role.name }}</div>
                    <div class="role-id">ID: {{ role.id?.substring(0, 8) }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Description Column -->
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Descripción</th>
                <td mat-cell *matCellDef="let role" class="description-cell">
                  <div class="role-description">
                    {{ role.description || 'Sin descripción' }}
                  </div>
                </td>
              </ng-container>

              <!-- User Count Column -->
              <ng-container matColumnDef="userCount">
                <th mat-header-cell *matHeaderCellDef>Usuarios</th>
                <td mat-cell *matCellDef="let role" class="user-count-cell">
                  <div class="user-count-badge">
                    <mat-icon class="count-icon">group</mat-icon>
                    <span class="count-number">{{ role.userCount || 0 }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Permission Count Column -->
              <ng-container matColumnDef="permissionCount">
                <th mat-header-cell *matHeaderCellDef>Permisos</th>
                <td mat-cell *matCellDef="let role" class="permissions-cell">
                  <div class="permissions-badge">
                    <mat-icon class="count-icon">security</mat-icon>
                    <span class="count-number">{{ role.permissionCount || 0 }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Created At Column -->
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Creado</th>
                <td mat-cell *matCellDef="let role" class="created-at-cell">
                  <span>{{ role.createdAt | date:'short' }}</span>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let role" class="status-cell">
                  <span [class]="role.status ? 'user-status-badge status-active' : 'user-status-badge status-inactive'">
                    <mat-icon>{{ role.status ? 'check_circle' : 'cancel' }}</mat-icon>
                    {{ role.status ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
              </ng-container>

              <!-- Actions Column -->
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
                    <button mat-icon-button [matMenuTriggerFor]="actionMenu" matTooltip="Más opciones" class="more-btn">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #actionMenu="matMenu">
                      <button mat-menu-item (click)="duplicateRole(role)">
                        <mat-icon>content_copy</mat-icon>
                        Duplicar Rol
                      </button>
                      <mat-divider></mat-divider>
                      <button mat-menu-item (click)="deleteRole(role)" class="delete-menu-item">
                        <mat-icon>delete</mat-icon>
                        Eliminar Rol
                      </button>
                    </mat-menu>
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
                      Crear primer rol
                    </button>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <!-- Paginador -->
          <mat-paginator 
            #paginator
            [length]="totalRecords"
            [pageIndex]="page - 1"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25, 50]"
            [showFirstLastButtons]="true"
            class="roles-paginator">
          </mat-paginator>
        </mat-card-content>
      </mat-card>


    </div>
  `,
  styles: [`
    .roles-container {
      padding: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Header con botón */
    .page-header {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 0 0 20px 0;
      margin-bottom: 24px;
    }

    .create-btn {
      font-weight: 500;
      height: 40px;
      padding: 0 16px;
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

    .search-field {
      min-width: 300px;
      flex: 1;
    }

    .filter-field {
      min-width: 180px;
      width: 180px;
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

    .create-btn {
      font-weight: 500;
    }

    .results-summary {
      padding: 8px 16px;
      background-color: #f8f9fa;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 14px;
      color: #666;
    }

    .result-count {
      font-weight: 500;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 16px;
    }

    .loading-container p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .table-card {
      width: 100%;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      /* flex: 1; */
      display: flex;
      flex-direction: column;
      margin-bottom: 16px;
      min-height: unset;
      max-height: unset;
    }

    .table-card .mat-mdc-card-content {
      /* flex: 1; */
      display: flex;
      flex-direction: column;
      padding: 0 !important;
    }

    .table-container {
      width: 100%;
      /* flex: 1; */
      overflow-x: auto;
      min-height: unset;
      max-height: 500px;
    }

    .roles-table {
      width: 100%;
    }

    .roles-table .mat-column-icon {
      width: 60px;
      text-align: center;
    }

    .roles-table .mat-column-permissions {
      width: 120px;
      text-align: center;
    }

    .roles-table .mat-column-actions {
      width: 120px;
      text-align: center;
    }

    .roles-paginator {
      border-top: 1px solid #e0e0e0;
      margin-top: 0;
      background: #fff;
      position: relative;
      z-index: 2;
    }

    .icon-cell {
      width: 60px;
      max-width: 60px;
      text-align: center;
    }

    .role-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }

    .role-icon mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #1976d2;
    }

    .role-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .role-name {
      font-weight: 500;
      color: #333;
    }

    .role-id {
      font-family: monospace;
      font-size: 12px;
      color: #666;
      background-color: #f5f5f5;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .role-description {
      color: #666;
      font-size: 14px;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .permissions-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background-color: #f5f5f5;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      justify-content: center;
    }

    .count-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #666;
    }

    .count-number {
      color: #333;
    }

    .actions-cell {
      text-align: right;
    }

    .actions-header {
      text-align: center;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
      justify-content: flex-end;
      align-items: center;
    }

    .view-btn, .edit-btn, .more-btn {
      width: 32px;
      height: 32px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .view-btn {
      color: #000000;
    }

    .edit-btn {
      color: #000000;
    }

    .more-btn {
      color: #666;
    }

    .view-btn:hover, .edit-btn:hover, .more-btn:hover {
      background-color: rgba(0,0,0,0.04);
    }

    .delete-menu-item {
      color: #f44336;
    }

    .no-data-message {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .no-data-message mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #ccc;
    }

    .no-data-message span {
      display: block;
      margin-bottom: 16px;
      font-size: 16px;
    }

    .user-status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .user-status-badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .status-active {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-inactive {
      background-color: #ffebee;
      color: #c62828;
    }



    @media (max-width: 768px) {
      .page-header {
        justify-content: center;
        padding: 0 0 16px 0;
      }

      .filters-row {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class RolesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading = signal(false);
  roles = signal<ExtendedRoleDto[]>([]);
  
  displayedColumns: string[] = ['icon', 'name', 'description', 'userCount', 'permissionCount', 'createdAt', 'status', 'actions'];
  dataSource = new MatTableDataSource<ExtendedRoleDto>([]);
  totalRecords = 0;
  page = 1;
  pageSize = 10;
  searchTerm = '';
  statusFilter = '';

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.paginator.page.subscribe((event) => {
        this.page = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this.loadRoles();
      });
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  loadRoles(): void {
    this.isLoading.set(true);
    this.authService.getRoles(this.page, this.pageSize).subscribe({
      next: (response: any) => {
        // El backend devuelve un objeto con paginación, los datos están en response.data
        if (response && response.data && Array.isArray(response.data)) {
          const extended: ExtendedRoleDto[] = response.data.map((role: any) => ({
            id: role.id,
            name: role.name,
            description: role.description,
            isActive: role.status, // Mapear status a isActive
            status: role.status,
            isSelected: false,
            permissionCount: role.permissionCount || 0,
            userCount: role.userCount || 0,
            permissions: [], // Por ahora vacío, se puede cargar más adelante
            createdAt: role.createdAt
          }));
          this.roles.set(extended);
          this.dataSource.data = extended;
          this.totalRecords = response.totalRecords || 0;
        } else {
          this.snackBar.open('Error: La respuesta del servidor no es válida', 'Cerrar', { duration: 3000 });
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.snackBar.open('Error al cargar roles', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.applyFilters();
  }

  filterByStatus(value: string) {
    this.statusFilter = value;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = this.roles();
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((role: ExtendedRoleDto) => 
        role.name?.toLowerCase().includes(term) ||
        role.description?.toLowerCase().includes(term)
      );
    }
    
    if (this.statusFilter) {
      const isActive = this.statusFilter === 'active';
      filtered = filtered.filter((role: ExtendedRoleDto) => role.isActive === isActive);
    }
    
    this.dataSource.data = filtered;
  }

  openRoleForm(): void {
    const dialogRef = this.dialog.open(CreateRoleDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveRole(result);
      }
    });
  }

  editRole(role: ExtendedRoleDto): void {
    this.authService.getRoleById(role.id).subscribe((fullRole) => {
      const dialogRef = this.dialog.open(EditRoleDialogComponent, {
        data: { role: fullRole },
        width: '500px'
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Aquí puedes llamar a updateRole con el resultado
          this.authService.updateRole(role.id, result).subscribe(() => this.loadRoles());
        }
      });
    });
  }

  viewRole(role: ExtendedRoleDto): void {
    this.authService.getRoleById(role.id).subscribe((fullRole) => {
      const dialogRef = this.dialog.open(ViewRoleDialogComponent, {
        data: { role: fullRole },
        width: '500px'
      });
      dialogRef.afterClosed().subscribe();
    });
  }

  private saveRole(roleData: any): void {
    this.isLoading.set(true);
    
    const createDto: CreateRoleDto = {
      name: roleData.name,
      description: roleData.description,
      permissionIds: roleData.permissionIds || []
    };
    
    this.authService.createRole(createDto).subscribe({
      next: () => {
        this.snackBar.open('Rol creado correctamente', 'Cerrar', { duration: 3000 });
        this.loadRoles();
      },
      error: (error) => {
        console.error('Error creating role:', error);
        this.snackBar.open('Error al crear el rol', 'Cerrar', { duration: 3000 });
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  private updateRole(id: string, roleData: any): void {
    this.isLoading.set(true);
    
    const updateDto: UpdateRoleDto = {
      name: roleData.name,
      description: roleData.description,
      permissionIds: roleData.permissionIds || []
    };
    
    this.authService.updateRole(id, updateDto).subscribe({
      next: () => {
        this.snackBar.open('Rol actualizado correctamente', 'Cerrar', { duration: 3000 });
        this.loadRoles();
      },
      error: (error) => {
        console.error('Error updating role:', error);
        this.snackBar.open('Error al actualizar el rol', 'Cerrar', { duration: 3000 });
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  deleteRole(role: ExtendedRoleDto): void {
    if (confirm(`¿Está seguro de eliminar el rol "${role.name}"?`)) {
      this.authService.deleteRole(role.id).subscribe({
        next: () => {
          this.snackBar.open('Rol eliminado correctamente', 'Cerrar', { duration: 3000 });
          this.loadRoles();
        },
        error: (error) => {
          console.error('Error deleting role:', error);
          this.snackBar.open('Error al eliminar el rol', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  duplicateRole(role: ExtendedRoleDto): void {
    const createDto: CreateRoleDto = {
      name: `${role.name} (Copia)`,
      description: role.description,
      permissionIds: []
    };
    
    this.authService.createRole(createDto).subscribe({
      next: () => {
        this.snackBar.open('Rol duplicado correctamente', 'Cerrar', { duration: 3000 });
        this.loadRoles();
      },
      error: (error) => {
        console.error('Error duplicating role:', error);
        this.snackBar.open('Error al duplicar el rol', 'Cerrar', { duration: 3000 });
      }
    });
  }

  refreshRoles(): void {
    this.loadRoles();
    this.snackBar.open('Lista de roles actualizada', 'Cerrar', { duration: 2000 });
  }



  // Métodos de exportación
  exportToExcel(): void {
    // TODO: Implementar exportación a Excel
    this.snackBar.open('Funcionalidad de exportación en desarrollo', 'Cerrar', { duration: 3000 });
  }

  exportToPDF(): void {
    // TODO: Implementar exportación a PDF
    this.snackBar.open('Funcionalidad de exportación en desarrollo', 'Cerrar', { duration: 3000 });
  }

  getRoleIcon(roleName?: string): string {
    if (!roleName) return 'admin_panel_settings';
    
    const iconMap: { [key: string]: string } = {
      'administrador': 'admin_panel_settings',
      'admin': 'admin_panel_settings',
      'gerente': 'supervisor_account',
      'manager': 'supervisor_account',
      'empleado': 'person',
      'employee': 'person',
      'usuario': 'person',
      'user': 'person',
      'invitado': 'person_outline',
      'guest': 'person_outline'
    };
    
    const normalizedName = roleName.toLowerCase();
    return iconMap[normalizedName] || 'admin_panel_settings';
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
}

// Componente de diálogo para crear roles
@Component({
  selector: 'app-create-role-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>Crear Nuevo Rol</h2>
    <mat-dialog-content>
      <form [formGroup]="roleForm" class="role-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre del Rol</mat-label>
          <input matInput formControlName="name" placeholder="Ej: Administrador">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="description" placeholder="Descripción del rol" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Estado</mat-label>
          <mat-select formControlName="status">
            <mat-option [value]="true">Activo</mat-option>
            <mat-option [value]="false">Inactivo</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Permisos</mat-label>
          <input matInput placeholder="Filtrar permisos..." (input)="onPermissionFilterInput($event)" />
          <mat-select formControlName="permissionIds" multiple>
            <mat-option *ngFor="let perm of filteredPermissions" [value]="perm.id">{{ perm.name }}</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="!roleForm.valid" (click)="onSave()">
        Crear Rol
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .role-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-content {
      padding: 20px 0;
    }
  `]
})
export class CreateRoleDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateRoleDialogComponent>);
  private authService = inject(AuthService);

  permissionsList: { id: string; name: string }[] = [];
  filteredPermissions: { id: string; name: string }[] = [];
  permissionFilter: string = '';

  roleForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    status: [true, Validators.required],
    permissionIds: [[]]
  });

  constructor() {
    this.authService.getAllPermissionsDropdown().subscribe((perms) => {
      // Mapear para asegurar que name nunca sea undefined
      this.permissionsList = perms.map(p => ({ id: p.id, name: p.name || '' }));
      this.filteredPermissions = this.permissionsList;
    });
  }

  onPermissionFilterInput(event: Event) {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.permissionFilter = value;
    this.filteredPermissions = this.permissionsList.filter(p => p.name.toLowerCase().includes(value));
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.roleForm.valid) {
      this.dialogRef.close(this.roleForm.value);
    }
  }
}

// Componente de diálogo para editar roles
@Component({
  selector: 'app-edit-role-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>Editar Rol</h2>
    <mat-dialog-content>
      <form [formGroup]="roleForm" class="role-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre del Rol</mat-label>
          <input matInput formControlName="name" placeholder="Ej: Administrador">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="description" placeholder="Descripción del rol" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Estado</mat-label>
          <mat-select formControlName="status">
            <mat-option [value]="true">Activo</mat-option>
            <mat-option [value]="false">Inactivo</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Permisos</mat-label>
          <input matInput placeholder="Filtrar permisos..." (input)="onPermissionFilterInput($event)" [value]="permissionFilter" />
          <mat-select formControlName="permissionIds" multiple>
            <mat-option *ngFor="let perm of filteredPermissions" [value]="perm.id">{{ perm.name }}</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="!roleForm.valid" (click)="onSave()">
        Actualizar Rol
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .role-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-content {
      padding: 20px 0;
    }
  `]
})
export class EditRoleDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditRoleDialogComponent>);
  private data = inject(MAT_DIALOG_DATA) as { role: ExtendedRoleDto };
  private authService = inject(AuthService);

  permissionsList: { id: string; name: string }[] = [];
  filteredPermissions: { id: string; name: string }[] = [];
  permissionFilter: string = '';

  roleForm: FormGroup;

  constructor() {
    const role = this.data?.role;
    this.roleForm = this.fb.group({
      name: [role?.name || '', [Validators.required, Validators.minLength(3)]],
      description: [role?.description || '', [Validators.required, Validators.minLength(5)]],
      status: [role?.status ?? true, Validators.required],
      permissionIds: [role?.permissions?.map(p => p.id) || []]
    });
    this.authService.getAllPermissionsDropdown().subscribe((perms) => {
      this.permissionsList = perms.map(p => ({ id: p.id, name: p.name || '' }));
      this.filteredPermissions = this.permissionsList;
    });
  }

  onPermissionFilterInput(event: Event) {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.permissionFilter = value;
    this.filteredPermissions = this.permissionsList.filter(p => p.name.toLowerCase().includes(value));
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.roleForm.valid) {
      this.dialogRef.close(this.roleForm.value);
    }
  }
}

// Componente de diálogo para ver roles
@Component({
  selector: 'app-view-role-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>admin_panel_settings</mat-icon>
      Detalles del Rol
    </h2>
    <mat-dialog-content>
      <div class="role-details">
        <div class="detail-section">
          <label>Nombre:</label>
          <span class="detail-value">{{ role.name }}</span>
        </div>

        <div class="detail-section">
          <label>Descripción:</label>
          <span class="detail-value">{{ role.description || 'Sin descripción' }}</span>
        </div>

        <div class="detail-section">
          <label>Permisos:</label>
          <ng-container *ngIf="role.permissions && role.permissions.length; else noPerms">
            <mat-chip-set>
              <mat-chip *ngFor="let perm of role.permissions" color="primary" selected>
                {{ perm.name }}
              </mat-chip>
            </mat-chip-set>
          </ng-container>
          <ng-template #noPerms>
            <span class="detail-value">Sin permisos asignados</span>
          </ng-template>
        </div>

        <div class="detail-section">
          <label>Estado:</label>
          <mat-chip-set>
            <mat-chip [color]="role.isActive ? 'primary' : 'warn'" selected>
              {{ role.isActive ? 'Activo' : 'Inactivo' }}
            </mat-chip>
          </mat-chip-set>
        </div>

        <div class="detail-section" *ngIf="role.createdAt">
          <label>Creado:</label>
          <span class="detail-value">{{ formatDate(role.createdAt) }}</span>
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
    .role-details {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
    }

    .detail-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-section label {
      font-weight: 500;
      color: #666;
      font-size: 14px;
    }

    .detail-value {
      font-size: 16px;
      color: #333;
    }

    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    mat-dialog-content {
      padding: 20px 0;
    }

    mat-chip-set {
      display: flex;
    }
  `]
})
export class ViewRoleDialogComponent {
  private dialogRef = inject(MatDialogRef<ViewRoleDialogComponent>);
  private data = inject(MAT_DIALOG_DATA) as { role: ExtendedRoleDto };
  
  role: ExtendedRoleDto;

  constructor() {
    this.role = this.data?.role;
  }

  onClose() {
    this.dialogRef.close();
  }

  onEdit() {
    this.dialogRef.close({ action: 'edit', role: this.role });
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
