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
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../core/services';
import { RoleDto, CreateRoleDto, UpdateRoleDto } from '../../../core/models';

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
    MatChipsModule
  ],
  template: `
    <div class="roles-container">
      <!-- Header -->
      <div class="section-header">
        <div class="header-info">
          <mat-icon class="section-icon">admin_panel_settings</mat-icon>
          <h2>Gestión de Roles</h2>
        </div>
        <button mat-raised-button color="primary" (click)="openRoleForm()">
          <mat-icon>add</mat-icon>
          Nuevo Rol
        </button>
      </div>

      <!-- Formulario de Rol -->
      <mat-card class="form-card" *ngIf="showForm()">
        <mat-card-header>
          <mat-card-title>
            {{editingRole() ? 'Editar Rol' : 'Nuevo Rol'}}
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="roleForm" class="role-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nombre del Rol</mat-label>
                <input matInput formControlName="name" placeholder="Administrador" required>
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
              </mat-form-field>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button (click)="cancelForm()">
            Cancelar
          </button>
          <button 
            mat-raised-button 
            color="primary" 
            (click)="saveRole()"
            [disabled]="!roleForm.valid || isLoading()">
            {{editingRole() ? 'Actualizar' : 'Guardar'}}
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- Lista de Roles -->
      <mat-card class="table-card">
        <mat-card-header>
          <mat-card-title>Lista de Roles</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" class="roles-table">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let role">{{role.id}}</td>
              </ng-container>

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Nombre</th>
                <td mat-cell *matCellDef="let role">{{role.name}}</td>
              </ng-container>

              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Descripción</th>
                <td mat-cell *matCellDef="let role">{{role.description || 'Sin descripción'}}</td>
              </ng-container>

              <ng-container matColumnDef="permissions">
                <th mat-header-cell *matHeaderCellDef>Permisos</th>
                <td mat-cell *matCellDef="let role">
                  <div class="permissions-container">
                    <mat-chip-listbox>
                      <mat-chip *ngFor="let permission of role.permissions?.slice(0, 3)" 
                               class="permission-chip">
                        {{permission.name}}
                      </mat-chip>
                    </mat-chip-listbox>
                    <span *ngIf="(role.permissions?.length || 0) > 3" class="more-permissions">
                      +{{(role.permissions?.length || 0) - 3}} más
                    </span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let role">
                  <button mat-icon-button (click)="editRole(role)" matTooltip="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteRole(role)" matTooltip="Eliminar">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .roles-container {
      padding: 0;
      height: 100%;
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

    .form-card {
      margin-bottom: 24px;
    }

    .role-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .table-card {
      width: 100%;
    }

    .table-container {
      width: 100%;
      overflow: auto;
    }

    .roles-table {
      width: 100%;
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
export class RolesComponent implements OnInit {
  roleForm: FormGroup;
  showForm = signal(false);
  editingRole = signal<RoleDto | null>(null);
  isLoading = signal(false);
  
  displayedColumns: string[] = ['id', 'name', 'description', 'permissions', 'actions'];
  dataSource = new MatTableDataSource<RoleDto>([]);

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
    this.authService.getRoles().subscribe({
      next: (roles) => {
        this.dataSource.data = roles;
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.snackBar.open('Error al cargar roles', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  openRoleForm(): void {
    this.showForm.set(true);
    this.editingRole.set(null);
    this.roleForm.reset();
  }

  editRole(role: RoleDto): void {
    this.editingRole.set(role);
    this.roleForm.patchValue({
      name: role.name,
      description: role.description
    });
    this.showForm.set(true);
  }

  saveRole(): void {
    if (this.roleForm.valid) {
      this.isLoading.set(true);
      
      if (this.editingRole()) {
        const updateData: UpdateRoleDto = this.roleForm.value;
        this.authService.updateRole(this.editingRole()!.id, updateData).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.showForm.set(false);
            this.loadRoles();
            this.snackBar.open('Rol actualizado correctamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: () => {
            this.isLoading.set(false);
            this.snackBar.open('Error al actualizar rol', 'Cerrar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      } else {
        const createData: CreateRoleDto = this.roleForm.value;
        this.authService.createRole(createData).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.showForm.set(false);
            this.loadRoles();
            this.snackBar.open('Rol creado correctamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: () => {
            this.isLoading.set(false);
            this.snackBar.open('Error al crear rol', 'Cerrar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    }
  }

  deleteRole(role: RoleDto): void {
    if (confirm(`¿Está seguro de eliminar el rol "${role.name}"?`)) {
      this.authService.deleteRole(role.id).subscribe({
        next: () => {
          this.loadRoles();
          this.snackBar.open('Rol eliminado correctamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: () => {
          this.snackBar.open('Error al eliminar rol', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingRole.set(null);
    this.roleForm.reset();
  }
}
