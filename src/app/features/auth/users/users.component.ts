import { Component, OnInit, AfterViewInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services';
import { UserDto, CreateUserDto, UpdateUserDto } from '../../../core/models';

// Interfaz extendida para la tabla
interface ExtendedUserDto extends UserDto {
  isActive?: boolean;
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
      <!-- Formulario de Usuario (Solo visible cuando showForm es true) -->
      <mat-card class="form-card" *ngIf="showForm()">
        <mat-card-header>
          <mat-card-title>
            <div class="form-header">
              <mat-icon>{{isViewingUser() ? 'visibility' : (editingUser() ? 'edit' : 'person_add')}}</mat-icon>
              <span>{{isViewingUser() ? 'Ver Usuario' : (editingUser() ? 'Editar Usuario' : 'Crear Nuevo Usuario')}}</span>
            </div>
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="userForm" class="user-form">
            <!-- Información Personal -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>person</mat-icon>
                Información Personal
              </h3>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width" >
                  <mat-label>Nombre Completo</mat-label>
                  <input matInput formControlName="name" placeholder="Juan Pérez García" required>
                  <mat-icon matSuffix>badge</mat-icon>
                  <mat-error *ngIf="userForm.get('name')?.hasError('required')">
                    El nombre es requerido
                  </mat-error>
                </mat-form-field>
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
                  <mat-label>Número de Teléfono</mat-label>
                  <input matInput formControlName="phone" placeholder="+57 300 123 4567">
                  <mat-icon matSuffix>phone</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Tipo de Usuario</mat-label>
                  <mat-select formControlName="userTypeId" required>
                    <mat-option value="admin">
                      <mat-icon>admin_panel_settings</mat-icon>
                      Administrador
                    </mat-option>
                    <mat-option value="manager">
                      <mat-icon>supervisor_account</mat-icon>
                      Gerente
                    </mat-option>
                    <mat-option value="employee">
                      <mat-icon>person</mat-icon>
                      Empleado
                    </mat-option>
                    <mat-option value="viewer">
                      <mat-icon>visibility</mat-icon>
                      Visualizador
                    </mat-option>
                  </mat-select>
                  <mat-icon matSuffix>security</mat-icon>
                  <mat-error *ngIf="userForm.get('userTypeId')?.hasError('required')">
                    El tipo de usuario es requerido
                  </mat-error>
                </mat-form-field>
              </div>
            </div>

            <!-- Credenciales (solo para nuevos usuarios) -->
            <div class="form-section" *ngIf="!editingUser() && !isViewingUser()">
              <h3 class="section-title">
                <mat-icon>lock</mat-icon>
                Credenciales de Acceso
              </h3>
              
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
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions align="end" class="form-actions">
          <button mat-button (click)="cancelForm()" [disabled]="isLoading()">
            <mat-icon>{{isViewingUser() ? 'arrow_back' : 'cancel'}}</mat-icon>
            {{isViewingUser() ? 'Volver' : 'Cancelar'}}
          </button>
          <button 
            *ngIf="!isViewingUser()"
            mat-raised-button 
            color="primary" 
            (click)="saveUser()"
            [disabled]="!userForm.valid || isLoading()">
            <mat-icon>{{editingUser() ? 'save' : 'person_add'}}</mat-icon>
            {{editingUser() ? 'Actualizar Usuario' : 'Crear Usuario'}}
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- Filtros y Tabla -->
      <div class="content-section" *ngIf="!showForm()">
        <!-- Botón Crear Usuario -->
        <div class="create-user-section">
          <button mat-raised-button class="create-user-btn" (click)="openUserForm()" [disabled]="isLoading()">
            <mat-icon>person_add</mat-icon>
            Crear Usuario
          </button>
        </div>

        <!-- Barra de Herramientas y Filtros -->
        <mat-card class="filters-card">
          <mat-card-content>
            <div class="filters-row">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Buscar usuarios</mat-label>
                <input matInput (keyup)="applyFilter($event)" placeholder="Nombre, email, teléfono...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Filtrar por tipo</mat-label>
                <mat-select (selectionChange)="filterByUserType($event.value)">
                  <mat-option value="">Todos los tipos</mat-option>
                  <mat-option value="admin">Administradores</mat-option>
                  <mat-option value="manager">Gerentes</mat-option>
                  <mat-option value="employee">Empleados</mat-option>
                  <mat-option value="viewer">Visualizadores</mat-option>
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

  // Formulario y estado
  userForm: FormGroup;
  editingUser = signal<ExtendedUserDto | null>(null);
  isLoading = signal(false);
  showForm = signal(false);
  isViewingUser = signal(false);

  // Datos y configuración de tabla
  displayedColumns: string[] = ['id', 'name', 'email', 'phone', 'userTypeId', 'status', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<ExtendedUserDto>([]);

  // Datos simulados
  mockUsers: ExtendedUserDto[] = [
    {
      id: '1',
      name: 'Juan Pérez García',
      email: 'juan.perez@empresa.com',
      phone: '+57 300 123 4567',
      userTypeId: 'admin',
      isActive: true,
      createdAt: '2025-01-15T10:30:00'
    },
    {
      id: '2',
      name: 'María González López',
      email: 'maria.gonzalez@empresa.com',
      phone: '+57 301 234 5678',
      userTypeId: 'manager',
      isActive: true,
      createdAt: '2025-02-20T14:45:00'
    },
    {
      id: '3',
      name: 'Carlos Rodríguez Mora',
      email: 'carlos.rodriguez@empresa.com',
      phone: '+57 302 345 6789',
      userTypeId: 'employee',
      isActive: false,
      createdAt: '2025-03-10T09:15:00'
    },
    {
      id: '4',
      name: 'Ana Martínez Silva',
      email: 'ana.martinez@empresa.com',
      phone: undefined,
      userTypeId: 'employee',
      isActive: true,
      createdAt: '2025-04-05T16:20:00'
    },
    {
      id: '5',
      name: 'Luis Fernando Castro',
      email: 'luis.castro@empresa.com',
      phone: '+57 304 567 8901',
      userTypeId: 'viewer',
      isActive: true,
      createdAt: '2025-05-12T11:00:00'
    },
    {
      id: '6',
      name: 'Carmen Elena Vargas',
      email: 'carmen.vargas@empresa.com',
      phone: '+57 305 678 9012',
      userTypeId: 'manager',
      isActive: true,
      createdAt: '2025-06-18T13:30:00'
    },
    {
      id: '7',
      name: 'Roberto Sánchez Luna',
      email: 'roberto.sanchez@empresa.com',
      phone: '+57 306 789 0123',
      userTypeId: 'employee',
      isActive: false,
      createdAt: '2025-07-22T08:45:00'
    },
    {
      id: '8',
      name: 'Patricia Jiménez Cruz',
      email: 'patricia.jimenez@empresa.com',
      phone: undefined,
      userTypeId: 'viewer',
      isActive: true,
      createdAt: '2025-08-30T15:10:00'
    },
    {
      id: '9',
      name: 'Diego Morales Ruiz',
      email: 'diego.morales@empresa.com',
      phone: '+57 307 890 1234',
      userTypeId: 'employee',
      isActive: true,
      createdAt: '2025-09-05T12:25:00'
    },
    {
      id: '10',
      name: 'Sofia Valencia Torres',
      email: 'sofia.valencia@empresa.com',
      phone: '+57 308 901 2345',
      userTypeId: 'manager',
      isActive: true,
      createdAt: '2025-09-08T09:40:00'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      userTypeId: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = this.customFilterPredicate.bind(this);
  }

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

  // Métodos de datos y estadísticas
  getTotalUsers(): number {
    return this.dataSource.data.length;
  }

  getActiveUsers(): number {
    return this.dataSource.data.filter(user => user.isActive).length;
  }

  // Métodos de carga de datos
  loadUsers(): void {
    this.isLoading.set(true);
    
    // Simular carga desde API
    setTimeout(() => {
      this.dataSource.data = [...this.mockUsers];
      this.isLoading.set(false);
    }, 1000);
  }

  refreshUsers(): void {
    this.loadUsers();
    this.snackBar.open('Lista de usuarios actualizada', 'Cerrar', { duration: 2000 });
  }

  // Métodos de filtrado y búsqueda
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  customFilterPredicate(user: ExtendedUserDto, filter: string): boolean {
    const searchStr = filter.toLowerCase();
    return (user.name && user.name.toLowerCase().includes(searchStr)) ||
           (user.email && user.email.toLowerCase().includes(searchStr)) ||
           (user.phone && user.phone.toLowerCase().includes(searchStr)) ||
           this.getUserTypeLabel(user.userTypeId).toLowerCase().includes(searchStr);
  }

  filterByUserType(userType: string): void {
    if (!userType) {
      this.dataSource.filter = '';
    } else {
      this.dataSource.filterPredicate = (user: ExtendedUserDto) => user.userTypeId === userType;
      this.dataSource.filter = 'userTypeFilter';
    }
  }

  // Métodos de formulario
  openUserForm(): void {
    this.showForm.set(true);
    this.editingUser.set(null);
    this.isViewingUser.set(false);
    this.userForm.reset();
    this.userForm.enable();
  }

  saveUser(): void {
    if (this.userForm.valid) {
      this.isLoading.set(true);
      
      setTimeout(() => {
        if (this.editingUser()) {
          // Actualizar usuario
          const index = this.mockUsers.findIndex(u => u.id === this.editingUser()?.id);
          if (index !== -1) {
            this.mockUsers[index] = {
              ...this.mockUsers[index],
              ...this.userForm.value,
              id: this.editingUser()!.id
            };
          }
          this.snackBar.open('Usuario actualizado correctamente', 'Cerrar', { duration: 3000 });
        } else {
          // Crear nuevo usuario
          const maxId = Math.max(...this.mockUsers.map(u => parseInt(u.id)));
          const newUser: ExtendedUserDto = {
            id: (maxId + 1).toString(),
            ...this.userForm.value,
            isActive: true,
            createdAt: new Date().toISOString()
          };
          this.mockUsers.push(newUser);
          this.snackBar.open('Usuario creado correctamente', 'Cerrar', { duration: 3000 });
        }
        
        this.dataSource.data = [...this.mockUsers];
        this.isLoading.set(false);
        this.showForm.set(false);
      }, 1500);
    }
  }

  editUser(user: ExtendedUserDto): void {
    this.editingUser.set(user);
    this.isViewingUser.set(false);
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      userTypeId: user.userTypeId
    });
    // Habilitar todos los campos del formulario para modo de edición
    this.userForm.enable();
    this.showForm.set(true);
  }

  viewUser(user: ExtendedUserDto): void {
    this.editingUser.set(user);
    this.isViewingUser.set(true);
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      userTypeId: user.userTypeId
    });
    // Deshabilitar todos los campos del formulario para modo de solo lectura
    this.userForm.disable();
    this.showForm.set(true);
    this.snackBar.open(`Visualizando detalles de ${user.name}`, 'Cerrar', { duration: 2000 });
  }

  deleteUser(user: ExtendedUserDto): void {
    if (confirm(`¿Está seguro de eliminar al usuario "${user.name}"?`)) {
      const index = this.mockUsers.findIndex(u => u.id === user.id);
      if (index !== -1) {
        this.mockUsers.splice(index, 1);
        this.dataSource.data = [...this.mockUsers];
        this.snackBar.open('Usuario eliminado correctamente', 'Cerrar', { duration: 3000 });
      }
    }
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingUser.set(null);
    this.isViewingUser.set(false);
    this.userForm.reset();
    this.userForm.enable();
  }

  // Métodos de estado y utilidades
  toggleUserStatus(user: ExtendedUserDto): void {
    const index = this.mockUsers.findIndex(u => u.id === user.id);
    if (index !== -1) {
      this.mockUsers[index].isActive = !this.mockUsers[index].isActive;
      this.dataSource.data = [...this.mockUsers];
      const status = this.mockUsers[index].isActive ? 'activado' : 'desactivado';
      this.snackBar.open(`Usuario ${status} correctamente`, 'Cerrar', { duration: 2000 });
    }
  }

  resetPassword(user: ExtendedUserDto): void {
    if (confirm(`¿Desea restablecer la contraseña de ${user.name}?`)) {
      this.snackBar.open('Contraseña restablecida. Se ha enviado un email al usuario.', 'Cerrar', { duration: 3000 });
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
