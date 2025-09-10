import { Component, OnInit, signal, computed, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { UserTypeDto, CreateUserTypeDto, UpdateUserTypeDto } from '../../../core/models/auth.models';
import { CreateUserTypeDialogComponent } from './create-user-type-dialog.component';
import { EditUserTypeDialogComponent } from './edit-user-type-dialog.component';
import { ViewUserTypeDialogComponent } from './view-user-type-dialog.component';

interface ExtendedUserType extends UserTypeDto {
  isSelected?: boolean;
  userCount?: number;
}

interface UserTypesResponse {
  data: any[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  sortBy: string | null;
}

@Component({
  selector: 'app-user-types',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="user-types-container">
      <!-- Filtros -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar tipos de usuario</mat-label>
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
              <button mat-icon-button (click)="refreshUserTypes()" matTooltip="Actualizar lista" class="action-btn">
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
      <div class="results-summary" *ngIf="!isLoading()">
        <span class="result-count">
          {{ filteredUserTypes().length }} de {{ userTypes().length }} tipos de usuario
        </span>
      </div>

      <!-- Loading -->
      <div class="loading-container" *ngIf="isLoading()">
        <mat-spinner></mat-spinner>
        <p>Cargando tipos de usuario...</p>
      </div>

      <!-- User Types Table -->
      <mat-card class="table-card" *ngIf="!isLoading()">
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort class="user-types-table">
              
              <!-- Icon Column -->
              <ng-container matColumnDef="icon">
                <th mat-header-cell *matHeaderCellDef>Icono</th>
                <td mat-cell *matCellDef="let userType">
                  <div class="user-type-info">
                    <div class="user-type-icon">
                      <mat-icon>{{ getUserTypeIcon(userType.name) }}</mat-icon>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th>
                <td mat-cell *matCellDef="let userType">
                  <div class="user-type-details">
                    <div class="user-type-name">{{ userType.name }}</div>
                    <div class="user-type-id">ID: {{ userType.id?.substring(0, 8) }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Description Column -->
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Descripción</th>
                <td mat-cell *matCellDef="let userType">
                  <div class="user-type-description">
                    {{ userType.description || 'Sin descripción' }}
                  </div>
                </td>
              </ng-container>

              <!-- Columna Cantidad de Usuarios -->
              <ng-container matColumnDef="userCount">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Usuarios</th>
                <td mat-cell *matCellDef="let userType" class="count-cell">
                  <div class="user-count-badge">
                    <mat-icon class="count-icon">people</mat-icon>
                    <span class="count-number">{{userType.userCount || 0}}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Columna Estado -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let userType" class="status-cell">
                  <span [class]="getStatusClass(userType.isActive)" class="user-type-status-badge">
                    <mat-icon>{{getStatusIcon(userType.isActive)}}</mat-icon>
                    {{userType.isActive ? 'Activo' : 'Inactivo'}}
                  </span>
                </td>
              </ng-container>

              <!-- Columna Acciones -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="actions-header">Acciones</th>
                <td mat-cell *matCellDef="let userType" class="actions-cell">
                  <div class="action-buttons">
                    <button mat-icon-button (click)="viewUserType(userType)" matTooltip="Ver detalles" class="view-btn">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button (click)="editUserType(userType)" matTooltip="Editar tipo" class="edit-btn">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button [matMenuTriggerFor]="actionMenu" matTooltip="Más opciones" class="more-btn">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #actionMenu="matMenu">
                      <button mat-menu-item (click)="toggleUserTypeStatus(userType)">
                        <mat-icon>{{userType.isActive ? 'block' : 'check_circle'}}</mat-icon>
                        {{userType.isActive ? 'Desactivar' : 'Activar'}}
                      </button>
                      <button mat-menu-item (click)="duplicateUserType(userType)">
                        <mat-icon>content_copy</mat-icon>
                        Duplicar Tipo
                      </button>
                      <mat-divider></mat-divider>
                      <button mat-menu-item (click)="deleteUserType(userType)" class="delete-menu-item">
                        <mat-icon>delete</mat-icon>
                        Eliminar Tipo
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
                    <mat-icon>category_outline</mat-icon>
                    <span>No se encontraron tipos de usuario</span>
                    <button mat-raised-button color="primary" (click)="createUserType()">
                      <mat-icon>add</mat-icon>
                      Crear primer tipo
                    </button>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <!-- Paginador -->
          <mat-paginator 
            #paginator
            [pageSizeOptions]="[5, 10, 25, 50]"
            [pageSize]="10"
            [showFirstLastButtons]="true"
            class="user-types-paginator">
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .user-types-container {
      padding: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .content-section {
      margin-top: 12px;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
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

    .user-type-description {
      color: #666;
      font-size: 14px;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }



    .table-card {
      width: 100%;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .table-card .mat-mdc-card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 0 !important;
    }

    .table-container {
      width: 100%;
      flex: 1;
      overflow: auto;
    }

    .user-types-table {
      width: 100%;
    }

    .user-types-table .mat-column-icon {
      width: 60px;
      text-align: center;
    }

    .user-types-table .mat-column-status {
      width: 120px;
      text-align: center;
    }

    .user-types-table .mat-column-userCount {
      width: 100px;
      text-align: center;
    }

    .user-types-table .mat-column-actions {
      width: 120px;
      text-align: center;
    }

    .user-types-paginator {
      border-top: 1px solid #e0e0e0;
    }

    .user-type-status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .status-active {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-inactive {
      background-color: #ffebee;
      color: #c62828;
    }

    .user-type-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-type-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-type-icon mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #1976d2;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-type-name {
      font-weight: 500;
    }

    .user-type-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .user-type-name {
      font-weight: 500;
      color: #333;
    }

    .user-type-id {
      font-family: monospace;
      font-size: 12px;
      color: #666;
      background-color: #f5f5f5;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .user-count-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background-color: #f5f5f5;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .count-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .count-number {
      color: #333;
    }

    .no-data {
      color: #999;
      font-style: italic;
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

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }

    mat-form-field {
      width: 100%;
      margin-bottom: 16px;
    }
  `]
})
export class UserTypesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  userTypes = signal<ExtendedUserType[]>([]);
  filteredUserTypes = signal<ExtendedUserType[]>([]);
  isLoading = signal(false);
  
  displayedColumns = ['icon', 'name', 'description', 'userCount', 'status', 'actions'];
  dataSource = new MatTableDataSource<ExtendedUserType>([]);
  searchTerm = '';
  statusFilter = '';

  constructor(
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadUserTypes();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }



  loadUserTypes() {
    this.isLoading.set(true);
    this.authService.getUserTypes().subscribe({
      next: (response: any) => {
        console.log('Response from getUserTypes:', response);
        
        // El backend devuelve un objeto con paginación, los datos están en response.data
        if (response && response.data && Array.isArray(response.data)) {
          const extended = response.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            isActive: item.status, // Mapear status a isActive
            userCount: item.userCount,
            isSelected: false
          }));
          this.userTypes.set(extended);
          this.dataSource.data = extended;
          this.applyFilters();
        } else {
          console.error('Response structure is not valid:', response);
          this.snackBar.open('Error: La respuesta del servidor no es válida', 'Cerrar', { duration: 3000 });
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading user types:', error);
        this.snackBar.open('Error al cargar tipos de usuario', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.applyFilters();
  }

  createUserType() {
    const dialogRef = this.dialog.open(CreateUserTypeDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveUserType(result);
      }
    });
  }

  editUserType(userType: ExtendedUserType) {
    const dialogRef = this.dialog.open(EditUserTypeDialogComponent, {
      width: '600px',
      data: { userType }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateUserType(userType.id!, result);
      }
    });
  }

  viewUserType(userType: ExtendedUserType) {
    const dialogRef = this.dialog.open(ViewUserTypeDialogComponent, {
      width: '600px',
      data: { userType }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'edit') {
        this.editUserType(result.userType);
      }
    });
  }

  private async saveUserType(userTypeData: any) {
    try {
      this.isLoading.set(true);
      await this.authService.createUserType(userTypeData).toPromise();
      this.snackBar.open('Tipo de usuario creado correctamente', 'Cerrar', { duration: 3000 });
      this.loadUserTypes();
    } catch (error) {
      console.error('Error creating user type:', error);
      this.snackBar.open('Error al crear tipo de usuario', 'Cerrar', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  private async updateUserType(id: string, userTypeData: any) {
    try {
      this.isLoading.set(true);
      await this.authService.updateUserType(id, userTypeData).toPromise();
      this.snackBar.open('Tipo de usuario actualizado correctamente', 'Cerrar', { duration: 3000 });
      this.loadUserTypes();
    } catch (error) {
      console.error('Error updating user type:', error);
      this.snackBar.open('Error al actualizar tipo de usuario', 'Cerrar', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  deleteUserType(userType: ExtendedUserType) {
    if (confirm(`¿Eliminar "${userType.name}"?`)) {
      this.authService.deleteUserType(userType.id).subscribe({
        next: () => {
          this.loadUserTypes();
          this.snackBar.open('Tipo de usuario eliminado correctamente', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting user type:', error);
          this.snackBar.open('Error al eliminar tipo de usuario', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }



  // Métodos para filtros y utilidades
  applyFilters() {
    let filteredData = [...this.userTypes()];

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filteredData = filteredData.filter(item => 
        (item.name && item.name.toLowerCase().includes(searchLower)) ||
        (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }

    // Filtrar por estado
    if (this.statusFilter) {
      filteredData = filteredData.filter(item => {
        if (this.statusFilter === 'active') return item.isActive;
        if (this.statusFilter === 'inactive') return !item.isActive;
        return true;
      });
    }

    this.dataSource.data = filteredData;
  }

  filterByStatus(status: string) {
    this.statusFilter = status;
    this.applyFilters();
  }

  refreshUserTypes() {
    this.loadUserTypes();
  }

  exportToExcel() {
    // TODO: Implementar exportación a Excel
    this.snackBar.open('Funcionalidad de exportación en desarrollo', 'Cerrar', { duration: 3000 });
  }

  exportToPDF() {
    // TODO: Implementar exportación a PDF
    this.snackBar.open('Funcionalidad de exportación en desarrollo', 'Cerrar', { duration: 3000 });
  }

  getUserTypeIcon(typeName?: string): string {
    if (!typeName) return 'category';
    
    const iconMap: { [key: string]: string } = {
      'administrador': 'admin_panel_settings',
      'gerente': 'supervisor_account',
      'empleado': 'person',
      'cliente': 'people',
      'contratista': 'engineering'
    };
    
    const normalizedName = typeName.toLowerCase();
    return iconMap[normalizedName] || 'category';
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  getStatusIcon(isActive: boolean): string {
    return isActive ? 'check_circle' : 'cancel';
  }

  toggleUserTypeStatus(userType: ExtendedUserType) {
    const newStatus = !userType.isActive;
    const updateDto: any = {
      name: userType.name,
      description: userType.description,
      status: newStatus
    };
    
    this.authService.updateUserType(userType.id, updateDto).subscribe({
      next: () => {
        this.loadUserTypes();
        this.snackBar.open(
          `Tipo de usuario ${newStatus ? 'activado' : 'desactivado'} correctamente`, 
          'Cerrar', 
          { duration: 3000 }
        );
      },
      error: (error) => {
        console.error('Error updating user type status:', error);
        this.snackBar.open('Error al cambiar el estado del tipo de usuario', 'Cerrar', { duration: 3000 });
      }
    });
  }

  duplicateUserType(userType: ExtendedUserType) {
    const createDto: any = {
      name: `${userType.name} (Copia)`,
      description: userType.description,
      status: userType.isActive
    };
    
    this.authService.createUserType(createDto).subscribe({
      next: () => {
        this.loadUserTypes();
        this.snackBar.open('Tipo de usuario duplicado correctamente', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error duplicating user type:', error);
        this.snackBar.open('Error al duplicar tipo de usuario', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
