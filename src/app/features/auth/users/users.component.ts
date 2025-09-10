import { Component, OnInit, AfterViewInit, signal, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
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
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../core/services';
import { UserDto, CreateUserDto, UpdateUserDto } from '../../../core/models';

// Interfaz extendida para la tabla que coincide con la respuesta del backend
interface ExtendedUserDto {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  image?: string;
  roleName?: string;
  userTypeName?: string;
  userTypeId?: string; // Mantener para compatibilidad con el código existente
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  isSelected?: boolean;
  additionalData?: any;
}

@Component({
  selector: 'app-users',
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
    MatSelectModule,
    MatTooltipModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <div class="users-container">
      <!-- Header con botón -->
      <div class="page-header">
        <button mat-raised-button color="primary" (click)="openUserForm()" class="create-btn">
          <mat-icon>add</mat-icon>
          Nuevo Usuario
        </button>
      </div>

      <!-- Filtros -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar usuarios</mat-label>
              <input matInput (keyup)="onSearchChange($event)" placeholder="Nombre, email, teléfono...">
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
              <button mat-icon-button (click)="refreshUsers()" matTooltip="Actualizar lista" class="action-btn">
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
                  <table mat-table [dataSource]="dataSource" matSort class="users-table">
                    
                    <!-- Columna ID -->
                    <ng-container matColumnDef="id">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                      <td mat-cell *matCellDef="let user" class="id-cell">
                        <span class="user-id">#{{user.id}}</span>
                      </td>
                    </ng-container>

                    <!-- Columna Nombre -->
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th>
                      <td mat-cell *matCellDef="let user" class="name-cell">
                        <div class="user-info">
                          <div class="user-avatar">
                            <mat-icon>account_circle</mat-icon>
                          </div>
                          <div class="user-name">{{user.name}}</div>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Columna Email -->
                    <ng-container matColumnDef="email">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
                      <td mat-cell *matCellDef="let user" class="email-cell">
                        <span class="user-email">{{user.email}}</span>
                      </td>
                    </ng-container>

                    <!-- Columna Teléfono -->
                    <ng-container matColumnDef="phone">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Teléfono</th>
                      <td mat-cell *matCellDef="let user" class="phone-cell">
                        <span *ngIf="user.phone; else noPhone">
                          <mat-icon class="contact-icon">phone</mat-icon>
                          {{user.phone}}
                        </span>
                        <ng-template #noPhone>
                          <span class="no-data">Sin teléfono</span>
                        </ng-template>
                      </td>
                    </ng-container>

                    <!-- Columna Tipo de Usuario -->
                    <ng-container matColumnDef="userTypeId">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Tipo</th>
                      <td mat-cell *matCellDef="let user" class="type-cell">
                        <span [class]="getUserTypeClass(user.userTypeId)" class="user-type-badge">
                          <mat-icon>{{getUserTypeIcon(user.userTypeId)}}</mat-icon>
                          {{getUserTypeLabel(user.userTypeId)}}
                        </span>
                      </td>
                    </ng-container>

                    <!-- Columna Estado -->
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Estado</th>
                      <td mat-cell *matCellDef="let user" class="status-cell">
                        <span [class]="getUserStatusClass(user)" class="user-status-badge">
                          <mat-icon>{{getUserStatusIcon(user)}}</mat-icon>
                          {{getUserStatus(user)}}
                        </span>
                      </td>
                    </ng-container>

                    <!-- Columna Fecha de Registro -->
                    <ng-container matColumnDef="createdAt">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Registrado</th>
                      <td mat-cell *matCellDef="let user" class="date-cell">
                        <div class="date-info">
                          <span class="date">{{formatDate(user.createdAt)}}</span>
                          <span class="time">{{formatTime(user.createdAt)}}</span>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Columna Acciones -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef class="actions-header">Acciones</th>
                      <td mat-cell *matCellDef="let user" class="actions-cell">
                        <div class="action-buttons">
                          <button mat-icon-button (click)="viewUser(user)" matTooltip="Ver detalles" class="view-btn">
                            <mat-icon>visibility</mat-icon>
                          </button>
                          <button mat-icon-button (click)="editUser(user)" matTooltip="Editar usuario" class="edit-btn">
                            <mat-icon>edit</mat-icon>
                          </button>
                          <button mat-icon-button [matMenuTriggerFor]="actionMenu" matTooltip="Más opciones" class="more-btn">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          <mat-menu #actionMenu="matMenu">
                            <button mat-menu-item (click)="resetPassword(user)">
                              <mat-icon>lock_reset</mat-icon>
                              Restablecer Contraseña
                            </button>
                            <button mat-menu-item (click)="toggleUserStatus(user)">
                              <mat-icon>{{user.isActive ? 'block' : 'check_circle'}}</mat-icon>
                              {{user.isActive ? 'Desactivar' : 'Activar'}}
                            </button>
                            <mat-divider></mat-divider>
                            <button mat-menu-item (click)="deleteUser(user)" class="delete-menu-item">
                              <mat-icon>delete</mat-icon>
                              Eliminar Usuario
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
                          <mat-icon>people_outline</mat-icon>
                          <span>No se encontraron usuarios</span>
                          <button mat-raised-button color="primary" (click)="openUserForm()">
                            <mat-icon>person_add</mat-icon>
                            Agregar primer usuario
                          </button>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Paginador -->
                <mat-paginator 
                  #paginator
                  [pageSizeOptions]="[10]"
                  [pageSize]="10"
                  [hidePageSize]="true"
                  [disabled]="true"
                  class="users-paginator">
                </mat-paginator>
              </mat-card-content>
            </mat-card>
    </div>
  `,
  styles: [`
    .users-container {
      padding: 0;
      height: 100%;
      overflow: hidden;
    }



    .content-section {
      margin-top: 12px;
    }

    .create-user-section {
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

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding: 0 4px;
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .section-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #1976d2;
    }

    .header-info h2 {
      margin: 0;
      font-weight: 500;
      color: #333;
    }

    .user-form {
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

    .create-user-btn {
      background-color: #1976d2;
      color: white;
      font-weight: 500;
      box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
      flex-shrink: 0;
      height: 40px;
    }

    .create-user-btn:hover {
      background-color: #1565c0;
      box-shadow: 0 4px 8px rgba(25, 118, 210, 0.4);
    }

    .create-user-btn:disabled {
      background-color: #e0e0e0;
      color: #9e9e9e;
      box-shadow: none;
    }

    .filter-separator {
      width: 1px;
      height: 40px;
      background-color: #e0e0e0;
      margin: 0 16px;
      flex-shrink: 0;
    }

    .table-card {
      width: 100%;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .table-container {
      width: 100%;
      overflow: visible;
    }

    .users-table {
      width: 100%;
    }

    .users-paginator {
      border-top: 1px solid #e0e0e0;
    }

    .user-type-badge, .user-status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .user-type-badge mat-icon,
    .user-status-badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .type-admin {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .type-manager {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .type-employee {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .type-viewer {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .status-active {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-inactive {
      background-color: #ffebee;
      color: #c62828;
    }

    /* Estilos específicos para columnas de tabla */
    .id-cell {
      width: 80px;
      max-width: 80px;
    }

    .user-id {
      font-family: monospace;
      font-weight: bold;
      color: #666;
    }

    .name-cell {
      width: 200px;
      max-width: 200px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-avatar {
      flex-shrink: 0;
    }

    .user-avatar mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #666;
    }

    .user-name {
      font-weight: 500;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .email-cell {
      width: 220px;
      max-width: 220px;
    }

    .user-email {
      color: #666;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .phone-cell {
      width: 140px;
      max-width: 140px;
    }

    .contact-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
      vertical-align: middle;
    }

    .no-data {
      color: #999;
      font-style: italic;
      font-size: 13px;
    }

    .type-cell {
      width: 120px;
      max-width: 120px;
    }

    .status-cell {
      width: 100px;
      max-width: 100px;
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

    .more-btn {
      color: #000;
    }

    .delete-menu-item {
      color: #f44336;
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

    .selected-row {
      background-color: #e3f2fd !important;
    }

    @media (max-width: 768px) {
      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .form-row {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class UsersComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Estado
  isLoading = signal(false);

  // Datos y configuración de tabla
  displayedColumns: string[] = ['id', 'name', 'email', 'phone', 'userTypeId', 'status', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<ExtendedUserDto>([]);

  // Tipos de usuario
  userTypes: any[] = [];



  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    console.log('UsersComponent iniciado, cargando datos...');
    // Cargar primero los tipos de usuario, luego los usuarios
    this.loadUserTypes().then(() => {
      this.loadUsers();
    });
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit ejecutado');
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = this.customFilterPredicate.bind(this);
    console.log('DataSource configurado:', this.dataSource);
  }



  // Métodos de carga de datos
  loadUsers(): void {
    this.isLoading.set(true);
    
    this.authService.getUsers().subscribe({
      next: (response: any) => {
        console.log('Respuesta completa del backend:', response);
        console.log('Tipo de respuesta:', typeof response);
        
        // Verificar si la respuesta es directamente un array o tiene estructura { data: [] }
        let users: any[] = [];
        if (Array.isArray(response)) {
          // Si es directamente un array
          users = response;
        } else if (response.data && Array.isArray(response.data)) {
          // Si tiene estructura { data: [] }
          users = response.data;
        } else {
          console.warn('Formato de respuesta no reconocido:', response);
          users = [];
        }
        
        const processedUsers = users.map((user: any) => {
          let userTypeId = user.userTypeId;
          
          // Si no tiene userTypeId pero tiene roleName o userTypeName, buscar el ID correspondiente
          if (!userTypeId && (user.roleName || user.userTypeName)) {
            const typeName = user.roleName || user.userTypeName;
            const matchedType = this.userTypes.find(type => 
              type.name?.toLowerCase() === typeName.toLowerCase()
            );
            userTypeId = matchedType ? matchedType.id : userTypeId;
          }
          
          // Si aún no tiene userTypeId, usar el primer tipo disponible o un fallback
          if (!userTypeId) {
            userTypeId = this.userTypes.length > 0 ? this.userTypes[0].id : 'employee';
          }
          
          return {
            ...user,
            isSelected: false,
            isActive: user.isActive !== undefined ? user.isActive : true,
            userTypeId: userTypeId
          };
        });
        
        console.log('Usuarios procesados:', processedUsers);
        console.log('Cantidad de usuarios:', processedUsers.length);
        
        this.dataSource.data = processedUsers;
        // Forzar actualización de la tabla
        this.dataSource._updateChangeSubscription();
        this.isLoading.set(false);
        
        if (processedUsers.length === 0) {
          this.snackBar.open('No se encontraron usuarios', 'Cerrar', { duration: 2000 });
        }
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.snackBar.open('Error al cargar usuarios: ' + (error.message || 'Error desconocido'), 'Cerrar', { duration: 5000 });
        this.dataSource.data = [];
        this.isLoading.set(false);
      }
    });
  }

  loadUserTypes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.authService.getUserTypes().subscribe({
        next: (response) => {
          console.log('Tipos de usuario cargados:', response);
          
          if (Array.isArray(response)) {
            this.userTypes = response;
          } else if (response.data && Array.isArray(response.data)) {
            this.userTypes = response.data;
          } else {
            console.warn('Formato de respuesta de tipos de usuario no reconocido:', response);
            this.userTypes = [];
          }
          
          console.log('User types procesados:', this.userTypes);
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar tipos de usuario:', error);
          this.snackBar.open('Error al cargar tipos de usuario', 'Cerrar', { duration: 3000 });
          // Fallback con tipos básicos
          this.userTypes = [
            { id: 'admin', name: 'Administrador' },
            { id: 'manager', name: 'Gerente' },
            { id: 'employee', name: 'Empleado' },
            { id: 'viewer', name: 'Visualizador' }
          ];
          resolve(); // Resolver aún con error para continuar
        }
      });
    });
  }

  refreshUsers(): void {
    this.loadUsers();
    this.snackBar.open('Lista de usuarios actualizada', 'Cerrar', { duration: 2000 });
  }

  // Métodos de filtrado y búsqueda
  onSearchChange(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByStatus(status: string): void {
    if (!status) {
      this.dataSource.filter = '';
      return;
    }

    this.dataSource.filterPredicate = (user: ExtendedUserDto) => {
      if (status === 'active') {
        return user.isActive === true;
      } else if (status === 'inactive') {
        return user.isActive === false;
      }
      return true;
    };
    this.dataSource.filter = 'statusFilter';
  }

  customFilterPredicate(user: ExtendedUserDto, filter: string): boolean {
    const searchStr = filter.toLowerCase();
    return Boolean(
      (user.name && user.name.toLowerCase().includes(searchStr)) ||
      (user.email && user.email.toLowerCase().includes(searchStr)) ||
      (user.phone && user.phone.toLowerCase().includes(searchStr)) ||
      (user.roleName && user.roleName.toLowerCase().includes(searchStr)) ||
      (user.userTypeName && user.userTypeName.toLowerCase().includes(searchStr))
    );
  }

  filterByUserType(userType: string): void {
    if (!userType) {
      this.dataSource.filter = '';
    } else {
      this.dataSource.filterPredicate = (user: ExtendedUserDto) => user.userTypeId === userType;
      this.dataSource.filter = 'userTypeFilter';
    }
  }

  // Métodos de diálogo
  openUserForm(): void {
    const dialogRef = this.dialog.open(CreateUserDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { userTypes: this.userTypes }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createUser(result);
      }
    });
  }

  editUser(user: ExtendedUserDto): void {
    this.isLoading.set(true);
    
    // Cargar datos completos del usuario desde el backend
    this.authService.getUserById(user.id).subscribe({
      next: (fullUserData) => {
        console.log('Datos completos del usuario cargados para edición:', fullUserData);
        
        const dialogRef = this.dialog.open(EditUserDialogComponent, {
          width: '700px',
          disableClose: true,
          data: { ...fullUserData, userTypes: this.userTypes }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.updateUser(user.id, result);
          }
        });
        
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar datos completos del usuario para edición:', error);
        this.snackBar.open('Error al cargar los detalles del usuario', 'Cerrar', { duration: 3000 });
        
        // Fallback: usar los datos que ya tenemos
        const dialogRef = this.dialog.open(EditUserDialogComponent, {
          width: '700px',
          disableClose: true,
          data: { ...user, userTypes: this.userTypes }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.updateUser(user.id, result);
          }
        });
        
        this.isLoading.set(false);
      }
    });
  }

  viewUser(user: ExtendedUserDto): void {
    this.isLoading.set(true);
    
    // Cargar datos completos del usuario desde el backend
    this.authService.getUserById(user.id).subscribe({
      next: (fullUserData) => {
        console.log('Datos completos del usuario cargados:', fullUserData);
        
        this.dialog.open(ViewUserDialogComponent, {
          width: '700px',
          data: { ...fullUserData, userTypes: this.userTypes }
        });
        
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar datos completos del usuario:', error);
        this.snackBar.open('Error al cargar los detalles del usuario', 'Cerrar', { duration: 3000 });
        
        // Fallback: usar los datos que ya tenemos
        this.dialog.open(ViewUserDialogComponent, {
          width: '700px',
          data: { ...user, userTypes: this.userTypes }
        });
        
        this.isLoading.set(false);
      }
    });
  }

  // Métodos de CRUD
  createUser(userData: any): void {
    this.isLoading.set(true);
    
    // Los datos ya vienen formateados del diálogo
    console.log('Datos a enviar al backend:', userData);
    
    this.authService.createUser(userData).subscribe({
      next: (response) => {
        this.snackBar.open('Usuario creado correctamente', 'Cerrar', { duration: 3000 });
        this.loadUsers();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        console.error('Detalles del error:', error.error);
        this.snackBar.open('Error al crear usuario: ' + (error.error?.title || error.message), 'Cerrar', { duration: 5000 });
        this.isLoading.set(false);
      }
    });
  }

  updateUser(id: string, userData: any): void {
    this.isLoading.set(true);
    this.authService.updateUser(id, userData).subscribe({
      next: (response) => {
        this.snackBar.open('Usuario actualizado correctamente', 'Cerrar', { duration: 3000 });
        this.loadUsers();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al actualizar usuario:', error);
        this.snackBar.open('Error al actualizar usuario', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  deleteUser(user: ExtendedUserDto): void {
    if (confirm(`¿Está seguro de eliminar al usuario "${user.name}"?`)) {
      this.authService.deleteUser(user.id).subscribe({
        next: (response) => {
          this.snackBar.open('Usuario eliminado correctamente', 'Cerrar', { duration: 3000 });
          this.loadUsers(); // Recargar lista
        },
        error: (error) => {
          console.error('Error al eliminar usuario:', error);
          this.snackBar.open('Error al eliminar usuario', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }



  // Métodos de estado y utilidades
  toggleUserStatus(user: ExtendedUserDto): void {
    // Por ahora solo simular el cambio hasta que se implemente el endpoint específico
    const status = !user.isActive ? 'activado' : 'desactivado';
    this.snackBar.open(`Funcionalidad pendiente: ${status} usuario`, 'Cerrar', { duration: 2000 });
    // TODO: Implementar cuando exista endpoint específico para cambiar estado
  }

  resetPassword(user: ExtendedUserDto): void {
    if (confirm(`¿Desea restablecer la contraseña de ${user.name}?`)) {
      // TODO: Implementar cuando exista endpoint para reset de contraseña
      this.snackBar.open('Funcionalidad pendiente: Restablecer contraseña', 'Cerrar', { duration: 3000 });
    }
  }

  // Métodos de etiquetas y estilos
  getUserTypeLabel(userType: string): string {
    const labels: { [key: string]: string } = {
      'admin': 'Administrador',
      'manager': 'Gerente',
      'employee': 'Empleado',
      'viewer': 'Visualizador'
    };
    return labels[userType] || userType;
  }

  getUserTypeClass(userType: string): string {
    const classes: { [key: string]: string } = {
      'admin': 'type-admin',
      'manager': 'type-manager',
      'employee': 'type-employee',
      'viewer': 'type-viewer'
    };
    return classes[userType] || 'type-default';
  }

  getUserTypeIcon(userType: string): string {
    const icons: { [key: string]: string } = {
      'admin': 'admin_panel_settings',
      'manager': 'supervisor_account',
      'employee': 'person',
      'viewer': 'visibility'
    };
    return icons[userType] || 'person';
  }

  getUserStatus(user: ExtendedUserDto): string {
    return user.isActive ? 'Activo' : 'Inactivo';
  }

  getUserStatusClass(user: ExtendedUserDto): string {
    return user.isActive ? 'status-active' : 'status-inactive';
  }

  getUserStatusIcon(user: ExtendedUserDto): string {
    return user.isActive ? 'check_circle' : 'cancel';
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

  // Métodos de exportación
  exportToExcel(): void {
    this.snackBar.open('Exportando a Excel...', 'Cerrar', { duration: 2000 });
  }

  exportToPDF(): void {
    this.snackBar.open('Exportando a PDF...', 'Cerrar', { duration: 2000 });
  }
}

// Componente de diálogo para crear usuarios
@Component({
  selector: 'app-create-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>person_add</mat-icon>
      Crear Nuevo Usuario
    </h2>
    
    <mat-dialog-content>
      <form [formGroup]="userForm" class="user-form">
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nombre Completo</mat-label>
            <input matInput formControlName="name" placeholder="Juan Pérez García" required>
            <mat-icon matSuffix>badge</mat-icon>
            <mat-error *ngIf="userForm.get('name')?.hasError('required')">
              El nombre es requerido
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Correo Electrónico</mat-label>
            <input matInput type="email" formControlName="email" placeholder="juan@empresa.com" required>
            <mat-icon matSuffix>email</mat-icon>
            <mat-error *ngIf="userForm.get('email')?.hasError('required')">
              El email es requerido
            </mat-error>
            <mat-error *ngIf="userForm.get('email')?.hasError('email')">
              El formato del email es inválido
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="phone" placeholder="+57 300 123 4567">
            <mat-icon matSuffix>phone</mat-icon>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Dirección</mat-label>
            <input matInput formControlName="address" placeholder="Calle 123 #45-67">
            <mat-icon matSuffix>location_on</mat-icon>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Tipo de Usuario</mat-label>
            <mat-select formControlName="userTypeId" required>
              <mat-option *ngFor="let userType of data.userTypes" [value]="userType.id">
                {{userType.name}}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="userForm.get('userTypeId')?.hasError('required')">
              El tipo de usuario es requerido
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Contraseña</mat-label>
            <input matInput type="password" formControlName="password" required>
            <mat-icon matSuffix>lock</mat-icon>
            <mat-error *ngIf="userForm.get('password')?.hasError('required')">
              La contraseña es requerida
            </mat-error>
            <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">
              Mínimo 6 caracteres
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Confirmar Contraseña</mat-label>
            <input matInput type="password" formControlName="confirmPassword" required>
            <mat-icon matSuffix>lock_outline</mat-icon>
            <mat-error *ngIf="userForm.get('confirmPassword')?.hasError('required')">
              Debe confirmar la contraseña
            </mat-error>
            <mat-error *ngIf="userForm.get('confirmPassword')?.hasError('mustMatch')">
              Las contraseñas no coinciden
            </mat-error>
          </mat-form-field>
        </div>
      </form>

      <!-- Sección de Campos Adicionales -->
      <div class="additional-fields-section">
        <div class="section-header">
          <button mat-button type="button" (click)="toggleAddFieldSection()" class="add-field-toggle">
            <mat-icon>{{showAddFieldSection ? 'expand_less' : 'expand_more'}}</mat-icon>
            Campos Adicionales del Tipo de Usuario
          </button>
        </div>
        
        <div *ngIf="showAddFieldSection" class="additional-fields">
          <div *ngFor="let field of additionalFields; let i = index" class="additional-field-row">
            <mat-form-field appearance="outline" class="field-name">
              <mat-label>Nombre del Campo</mat-label>
              <input matInput [(ngModel)]="field.key" placeholder="ej: departamento">
              <mat-icon matSuffix>label</mat-icon>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="field-label">
              <mat-label>Etiqueta</mat-label>
              <input matInput [(ngModel)]="field.label" placeholder="ej: Departamento">
              <mat-icon matSuffix>text_fields</mat-icon>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="field-value">
              <mat-label>Valor</mat-label>
              <input matInput [(ngModel)]="field.value" placeholder="ej: Ventas">
              <mat-icon matSuffix>edit</mat-icon>
            </mat-form-field>
            
            <button mat-icon-button type="button" (click)="removeAdditionalField(i)" class="remove-field-btn">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
          
          <div class="add-field-actions">
            <button mat-stroked-button type="button" (click)="addAdditionalField()">
              <mat-icon>add</mat-icon>
              Agregar Campo
            </button>
          </div>
        </div>
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!userForm.valid">
        <mat-icon>save</mat-icon>
        Crear Usuario
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .user-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 16px;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .full-width {
      width: 100%;
    }
    mat-dialog-content {
      padding: 20px 0;
    }
    .additional-fields-section {
      margin-top: 24px;
      border-top: 1px solid #e0e0e0;
      padding-top: 16px;
    }
    .section-header {
      margin-bottom: 16px;
    }
    .add-field-toggle {
      color: #1976d2;
      font-weight: 500;
    }
    .additional-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .additional-field-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    .field-name {
      flex: 1;
    }
    .field-label {
      flex: 1;
    }
    .field-value {
      flex: 1.5;
    }
    .remove-field-btn {
      margin-top: 8px;
      color: #f44336;
    }
    .add-field-actions {
      display: flex;
      justify-content: center;
      margin-top: 8px;
    }
  `]
})
export class CreateUserDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateUserDialogComponent>);
  public data = inject<{userTypes: any[]}>(MAT_DIALOG_DATA);

  userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    address: [''],
    userTypeId: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  // Campos adicionales dinámicos
  additionalFields: { key: string; value: string; label: string }[] = [];
  showAddFieldSection = false;

  // Validador personalizado para confirmar contraseña
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    
    if (!password || !confirmPassword) return null;
    
    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mustMatch: true });
      return { mustMatch: true };
    }
    
    confirmPassword.setErrors(null);
    return null;
  }

  // Métodos para campos adicionales
  addAdditionalField() {
    this.additionalFields.push({
      key: '',
      value: '',
      label: ''
    });
  }

  removeAdditionalField(index: number) {
    this.additionalFields.splice(index, 1);
  }

  toggleAddFieldSection() {
    this.showAddFieldSection = !this.showAddFieldSection;
    if (this.showAddFieldSection && this.additionalFields.length === 0) {
      this.addAdditionalField();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      
      // Crear el objeto additionalData con los campos dinámicos
      const additionalData: any = {};
      this.additionalFields.forEach(field => {
        if (field.key && field.value) {
          additionalData[field.key] = field.value;
        }
      });
      
      // Si no hay campos adicionales, usar estructura por defecto
      if (Object.keys(additionalData).length === 0) {
        additionalData.additionalProp1 = "string";
        additionalData.additionalProp2 = "string";
        additionalData.additionalProp3 = "string";
      }
      
      // Crear el objeto en el formato exacto que espera el backend
      const userData = {
        email: formValue.email,
        name: formValue.name,
        password: formValue.password,
        image: formValue.image || "string",
        phone: formValue.phone || "string",
        userTypeId: formValue.userTypeId,
        addres: formValue.address || "string",
        additionalData: additionalData
      };
      
      this.dialogRef.close(userData);
    }
  }
}

// Componente de diálogo para editar usuarios
@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>edit</mat-icon>
      Editar Usuario
    </h2>
    
    <mat-dialog-content>
      <form [formGroup]="userForm" class="user-form">
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nombre Completo</mat-label>
            <input matInput formControlName="name" required>
            <mat-icon matSuffix>badge</mat-icon>
            <mat-error *ngIf="userForm.get('name')?.hasError('required')">
              El nombre es requerido
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Correo Electrónico</mat-label>
            <input matInput type="email" formControlName="email" required>
            <mat-icon matSuffix>email</mat-icon>
            <mat-error *ngIf="userForm.get('email')?.hasError('required')">
              El email es requerido
            </mat-error>
            <mat-error *ngIf="userForm.get('email')?.hasError('email')">
              El formato del email es inválido
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="phone">
            <mat-icon matSuffix>phone</mat-icon>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Dirección</mat-label>
            <input matInput formControlName="address">
            <mat-icon matSuffix>location_on</mat-icon>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Tipo de Usuario</mat-label>
            <mat-select formControlName="userTypeId" required>
              <mat-option *ngFor="let userType of data.userTypes" [value]="userType.id">
                {{userType.name}}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="userForm.get('userTypeId')?.hasError('required')">
              El tipo de usuario es requerido
            </mat-error>
          </mat-form-field>
        </div>
      </form>

      <!-- Sección de Campos Adicionales -->
      <div class="additional-fields-section">
        <div class="section-header">
          <button mat-button type="button" (click)="toggleAddFieldSection()" class="add-field-toggle">
            <mat-icon>{{showAddFieldSection ? 'expand_less' : 'expand_more'}}</mat-icon>
            Campos Adicionales del Tipo de Usuario
          </button>
        </div>
        
        <div *ngIf="showAddFieldSection" class="additional-fields">
          <div *ngFor="let field of additionalFields; let i = index" class="additional-field-row">
            <mat-form-field appearance="outline" class="field-name">
              <mat-label>Nombre del Campo</mat-label>
              <input matInput [(ngModel)]="field.key" placeholder="ej: departamento">
              <mat-icon matSuffix>label</mat-icon>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="field-label">
              <mat-label>Etiqueta</mat-label>
              <input matInput [(ngModel)]="field.label" placeholder="ej: Departamento">
              <mat-icon matSuffix>text_fields</mat-icon>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="field-value">
              <mat-label>Valor</mat-label>
              <input matInput [(ngModel)]="field.value" placeholder="ej: Ventas">
              <mat-icon matSuffix>edit</mat-icon>
            </mat-form-field>
            
            <button mat-icon-button type="button" (click)="removeAdditionalField(i)" class="remove-field-btn">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
          
          <div class="add-field-actions">
            <button mat-stroked-button type="button" (click)="addAdditionalField()">
              <mat-icon>add</mat-icon>
              Agregar Campo
            </button>
          </div>
        </div>
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!userForm.valid">
        <mat-icon>save</mat-icon>
        Actualizar Usuario
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .user-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 16px;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .full-width {
      width: 100%;
    }
    mat-dialog-content {
      padding: 20px 0;
    }
    .additional-fields-section {
      margin-top: 24px;
      border-top: 1px solid #e0e0e0;
      padding-top: 16px;
    }
    .section-header {
      margin-bottom: 16px;
    }
    .add-field-toggle {
      color: #1976d2;
      font-weight: 500;
    }
    .additional-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .additional-field-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    .field-name {
      flex: 1;
    }
    .field-label {
      flex: 1;
    }
    .field-value {
      flex: 1.5;
    }
    .remove-field-btn {
      margin-top: 8px;
      color: #f44336;
    }
    .add-field-actions {
      display: flex;
      justify-content: center;
      margin-top: 8px;
    }
  `]
})
export class EditUserDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditUserDialogComponent>);
  public data = inject<ExtendedUserDto & {userTypes: any[]}>(MAT_DIALOG_DATA);

  userForm: FormGroup = this.fb.group({
    name: [this.data.name, [Validators.required, Validators.minLength(2)]],
    email: [this.data.email, [Validators.required, Validators.email]],
    phone: [this.data.phone],
    address: [this.data.address],
    userTypeId: [this.data.userTypeId, Validators.required]
  });

  // Campos adicionales dinámicos
  additionalFields: { key: string; value: string; label: string }[] = [];
  showAddFieldSection = false;

  constructor() {
    // Cargar campos adicionales existentes si los hay
    if (this.data.additionalData && typeof this.data.additionalData === 'object') {
      Object.entries(this.data.additionalData).forEach(([key, value]) => {
        if (key !== 'additionalProp1' && key !== 'additionalProp2' && key !== 'additionalProp3') {
          this.additionalFields.push({
            key: key,
            value: value as string,
            label: key.charAt(0).toUpperCase() + key.slice(1)
          });
        }
      });
      if (this.additionalFields.length > 0) {
        this.showAddFieldSection = true;
      }
    }

    // Buscar el ID real del tipo de usuario si userTypes están disponibles
    if (this.data.userTypes && this.data.userTypes.length > 0) {
      const currentUserType = this.data.userTypes.find(type => 
        type.name.toLowerCase() === this.data.userTypeId?.toLowerCase() || 
        type.id === this.data.userTypeId
      );
      
      if (currentUserType) {
        // Actualizar el FormControl con el ID correcto
        this.userForm.get('userTypeId')?.setValue(currentUserType.id);
      }
    }
  }

  // Métodos para campos adicionales
  addAdditionalField() {
    this.additionalFields.push({
      key: '',
      value: '',
      label: ''
    });
  }

  removeAdditionalField(index: number) {
    this.additionalFields.splice(index, 1);
  }

  toggleAddFieldSection() {
    this.showAddFieldSection = !this.showAddFieldSection;
    if (this.showAddFieldSection && this.additionalFields.length === 0) {
      this.addAdditionalField();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      
      // Crear el objeto additionalData con los campos dinámicos
      const additionalData: any = {};
      this.additionalFields.forEach(field => {
        if (field.key && field.value) {
          additionalData[field.key] = field.value;
        }
      });
      
      // Si no hay campos adicionales, usar estructura por defecto
      if (Object.keys(additionalData).length === 0) {
        additionalData.additionalProp1 = "string";
        additionalData.additionalProp2 = "string";
        additionalData.additionalProp3 = "string";
      }
      
      // Crear el objeto en el formato exacto que espera el backend
      const userData = {
        id: this.data.id, // Incluir el ID para la actualización
        email: formValue.email,
        name: formValue.name,
        image: this.data.image || "string",
        phone: formValue.phone || "string",
        userTypeId: formValue.userTypeId,
        addres: formValue.address || "string",
        additionalData: additionalData
      };
      
      this.dialogRef.close(userData);
    }
  }
}

// Componente de diálogo para ver usuarios
@Component({
  selector: 'app-view-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>visibility</mat-icon>
      Detalles del Usuario
    </h2>
    
    <mat-dialog-content>
      <div class="user-details">
        <div class="detail-section">
          <div class="user-avatar">
            <mat-icon>account_circle</mat-icon>
          </div>
          <h3>{{data.name}}</h3>
        </div>

        <div class="detail-row">
          <strong>Email:</strong>
          <span>{{data.email}}</span>
        </div>

        <div class="detail-row" *ngIf="data.phone">
          <strong>Teléfono:</strong>
          <span>{{data.phone}}</span>
        </div>

        <div class="detail-row">
          <strong>Tipo de Usuario:</strong>
          <mat-chip-set>
            <mat-chip [class]="getUserTypeClass(data.userTypeId || '')">
              <mat-icon matChipAvatar>{{getUserTypeIcon(data.userTypeId || '')}}</mat-icon>
              {{getUserTypeLabel(data.userTypeId || '')}}
            </mat-chip>
          </mat-chip-set>
        </div>

        <div class="detail-row">
          <strong>Estado:</strong>
          <mat-chip-set>
            <mat-chip [class]="data.isActive ? 'status-active' : 'status-inactive'">
              <mat-icon matChipAvatar>{{data.isActive ? 'check_circle' : 'cancel'}}</mat-icon>
              {{data.isActive ? 'Activo' : 'Inactivo'}}
            </mat-chip>
          </mat-chip-set>
        </div>

        <div class="detail-row" *ngIf="data.createdAt">
          <strong>Fecha de Registro:</strong>
          <span>{{formatDate(data.createdAt)}}</span>
        </div>

        <!-- Campos Adicionales -->
        <div class="additional-data-section" *ngIf="hasAdditionalData()">
          <h4 class="section-title">
            <mat-icon>extension</mat-icon>
            Información Adicional
          </h4>
          <div class="additional-fields-grid">
            <div *ngFor="let field of getAdditionalFields()" class="additional-field">
              <div class="field-label">{{field.label}}:</div>
              <div class="field-value">{{field.value}}</div>
            </div>
          </div>
        </div>

        <!-- Dirección -->
        <div class="detail-row" *ngIf="data.address">
          <strong>Dirección:</strong>
          <span>{{data.address}}</span>
        </div>
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" (click)="onClose()">
        <mat-icon>close</mat-icon>
        Cerrar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .user-details {
      padding: 16px 0;
    }
    .detail-section {
      text-align: center;
      margin-bottom: 24px;
    }
    .user-avatar mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #1976d2;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .detail-row strong {
      color: #666;
      min-width: 120px;
    }
    mat-dialog-content {
      padding: 20px 0;
    }
    .status-active {
      background-color: #e8f5e8 !important;
      color: #4caf50 !important;
    }
    .status-inactive {
      background-color: #ffebee !important;
      color: #f44336 !important;
    }
    .additional-data-section {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      color: #1976d2;
      font-weight: 500;
    }
    .additional-fields-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .additional-field {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 6px;
      border-left: 3px solid #1976d2;
    }
    .field-label {
      font-weight: 500;
      color: #666;
      font-size: 0.85em;
      margin-bottom: 4px;
    }
    .field-value {
      color: #333;
      font-weight: 400;
    }
  `]
})
export class ViewUserDialogComponent {
  private dialogRef = inject(MatDialogRef<ViewUserDialogComponent>);
  public data = inject<ExtendedUserDto & {userTypes: any[]}>(MAT_DIALOG_DATA);

  hasAdditionalData(): boolean {
    if (!this.data.additionalData || typeof this.data.additionalData !== 'object') {
      return false;
    }
    
    const fields = this.getAdditionalFields();
    return fields.length > 0;
  }

  getAdditionalFields(): {label: string, value: string}[] {
    const fields: {label: string, value: string}[] = [];
    
    if (this.data.additionalData && typeof this.data.additionalData === 'object') {
      Object.entries(this.data.additionalData).forEach(([key, value]) => {
        // Excluir campos por defecto del sistema
        if (key !== 'additionalProp1' && key !== 'additionalProp2' && key !== 'additionalProp3' && value !== 'string') {
          fields.push({
            label: this.formatFieldLabel(key),
            value: value as string
          });
        }
      });
    }
    
    return fields;
  }

  formatFieldLabel(key: string): string {
    // Convertir camelCase o snake_case a texto legible
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  getUserTypeLabel(userType: string): string {
    if (this.data.userTypes && this.data.userTypes.length > 0) {
      const matchedType = this.data.userTypes.find(type => 
        type.id === userType || type.name?.toLowerCase() === userType.toLowerCase()
      );
      if (matchedType) {
        return matchedType.name;
      }
    }
    
    // Fallback para tipos básicos
    const labels: { [key: string]: string } = {
      'admin': 'Administrador',
      'manager': 'Gerente', 
      'employee': 'Empleado',
      'viewer': 'Visualizador'
    };
    return labels[userType] || userType;
  }

  getUserTypeClass(userType: string): string {
    const classes: { [key: string]: string } = {
      'admin': 'type-admin',
      'manager': 'type-manager',
      'employee': 'type-employee',
      'viewer': 'type-viewer'
    };
    return classes[userType] || 'type-default';
  }

  getUserTypeIcon(userType: string): string {
    const icons: { [key: string]: string } = {
      'admin': 'admin_panel_settings',
      'manager': 'supervisor_account',
      'employee': 'person',
      'viewer': 'visibility'
    };
    return icons[userType] || 'person';
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

  onClose() {
    this.dialogRef.close();
  }
}
