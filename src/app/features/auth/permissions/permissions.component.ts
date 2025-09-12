import { Component, OnInit, ViewChild, signal, inject, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { PermissionDto } from '../../../core/models/auth.models';
import { ViewRolesDialogComponent } from './view-roles-dialog.component';
import { ViewPermissionDialogComponent } from './view-permission-dialog.component';

interface ExtendedPermission extends PermissionDto {
  isSelected?: boolean;
}

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatDividerModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="permissions-container">
      <!-- Filters and Search -->
      <div class="filters-section">
        <div class="filter-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar permisos</mat-label>
            <input matInput 
                   [value]="searchTerm()" 
                   (input)="onSearch($event)"
                   placeholder="Nombre, descripción...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="category-filter">
            <mat-label>Filtrar por categoría</mat-label>
            <mat-select [value]="selectedCategory()" (selectionChange)="filterByCategory($event.value)">
              <mat-option value="all">Todas las categorías</mat-option>
              <mat-option value="users">Usuarios</mat-option>
              <mat-option value="roles">Roles</mat-option>
              <mat-option value="inventory">Inventario</mat-option>
              <mat-option value="products">Productos</mat-option>
              <mat-option value="sales">Ventas</mat-option>
              <mat-option value="purchases">Compras</mat-option>
              <mat-option value="finance">Finanzas</mat-option>
              <mat-option value="reports">Reportes</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-icon-button (click)="refreshPermissions()" matTooltip="Actualizar">
            <mat-icon>refresh</mat-icon>
          </button>

          <button mat-icon-button [matMenuTriggerFor]="exportMenu" matTooltip="Exportar">
            <mat-icon>download</mat-icon>
          </button>
          <mat-menu #exportMenu="matMenu">
            <button mat-menu-item (click)="exportToPDF()">
              <mat-icon>picture_as_pdf</mat-icon> Exportar PDF
            </button>
            <button mat-menu-item (click)="exportToExcel()">
              <mat-icon>table_chart</mat-icon> Exportar Excel
            </button>
            <button mat-menu-item (click)="exportToCSV()">
              <mat-icon>description</mat-icon> Exportar CSV
            </button>
          </mat-menu>
        </div>
      </div>

      <!-- Results Summary -->
      <div class="results-summary" *ngIf="!isLoading()">
        <span class="result-count">
          Mostrando {{ dataSource.data.length }} de {{ totalCount }} permisos
        </span>
      </div>

      <!-- Loading -->
      <div class="loading-container" *ngIf="isLoading()">
        <mat-spinner></mat-spinner>
        <p>Cargando permisos...</p>
      </div>

      <!-- Permissions Table -->
      <div class="table-container" *ngIf="!isLoading()">
        <table mat-table [dataSource]="dataSource" matSort class="permissions-table">
          
          <!-- Icon Column -->
          <ng-container matColumnDef="icon">
            <th mat-header-cell *matHeaderCellDef>Icono</th>
            <td mat-cell *matCellDef="let permission">
              <div class="permission-info">
                <div class="permission-icon">
                  <mat-icon>{{ getPermissionIcon(permission.name) }}</mat-icon>
                </div>
              </div>
            </td>
          </ng-container>

          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th>
            <td mat-cell *matCellDef="let permission">
              <div class="permission-details">
                <div class="permission-name">{{ permission.name }}</div>
                <div class="permission-id">ID: {{ permission.id }}</div>
              </div>
            </td>
          </ng-container>

          <!-- Description Column -->
          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Descripción</th>
            <td mat-cell *matCellDef="let permission">
              <div class="permission-description">
                {{ permission.description }}
              </div>
            </td>
          </ng-container>

          <!-- Category Column -->
          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Categoría</th>
            <td mat-cell *matCellDef="let permission">
              <span [class]="getCategoryClass(permission.name)" class="permission-category-badge">
                <mat-icon>{{ getCategoryIcon(permission.name) }}</mat-icon>
                {{ getPermissionCategory(permission.name) }}
              </span>
            </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let permission">
              <span [class]="permission.status ? 'user-status-badge status-active' : 'user-status-badge status-inactive'">
                <mat-icon>{{ permission.status ? 'check_circle' : 'cancel' }}</mat-icon>
                {{ permission.status ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-header">Acciones</th>
            <td mat-cell *matCellDef="let permission" class="actions-cell">
              <!-- Botones directos -->
              <div class="direct-actions">
                <button mat-icon-button 
                        (click)="viewPermission(permission)"
                        class="action-button view-button"
                        matTooltip="Ver detalles"
                        [attr.aria-label]="'Ver detalles de ' + permission.name">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button 
                        (click)="editPermission(permission)"
                        class="action-button edit-button"
                        matTooltip="Editar permiso"
                        [attr.aria-label]="'Editar ' + permission.name">
                  <mat-icon>edit</mat-icon>
                </button>
              </div>
              
              <!-- Menú para acciones secundarias -->
              <button mat-icon-button 
                      [matMenuTriggerFor]="actionMenu" 
                      class="action-button menu-button"
                      matTooltip="Más opciones"
                      [attr.aria-label]="'Más acciones para ' + permission.name">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #actionMenu="matMenu" class="permission-actions-menu">
                <button mat-menu-item (click)="duplicatePermission(permission)">
                  <mat-icon>content_copy</mat-icon>
                  <span>Duplicar</span>
                </button>
                <button mat-menu-item (click)="viewRolesWithPermission(permission)">
                  <mat-icon>group</mat-icon>
                  <span>Ver roles</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="deletePermission(permission)" class="delete-option">
                  <mat-icon>delete</mat-icon>
                  <span>Eliminar</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;">
          </tr>
        </table>

        <mat-paginator 
          [length]="totalCount"
          [pageIndex]="pageIndex"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25, 100]" 
          showFirstLastButtons
          class="permissions-paginator">
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
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
    .permissions-container {
      padding: 0;
      background-color: transparent;
      min-height: 100vh;
    }

    .filters-section {
      background: white;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .filter-row {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 250px;
    }

    .category-filter {
      min-width: 200px;
    }

    .results-summary {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
      padding: 0 8px;
      font-size: 14px;
      color: #6c757d;
    }

    .result-count {
      font-weight: 500;
    }

    .selected-count {
      color: #1976d2;
      font-weight: 500;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .loading-container p {
      margin-top: 16px;
      color: #6c757d;
    }

    .table-container {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .permissions-table {
      width: 100%;
    }

    .permissions-table th {
      background-color: #f8f9fa;
      color: #495057;
      font-weight: 600;
    }

    .permissions-table tr.selected {
      background-color: #e3f2fd;
    }

    .permissions-table tr:hover {
      background-color: #f5f5f5;
    }

    .permission-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .permission-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: #e3f2fd;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .permission-icon mat-icon {
      color: #1976d2;
      font-size: 20px;
    }

    .permission-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .permission-name {
      font-weight: 500;
      color: #1a1a1a;
    }

    .permission-id {
      font-size: 12px;
      color: #6c757d;
      font-family: monospace;
    }

    .permission-description {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #495057;
    }

    .permission-category-badge {
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-transform: capitalize;
    }

    .category-users { background-color: #e3f2fd; color: #1976d2; }
    .category-roles { background-color: #f3e5f5; color: #7b1fa2; }
    .category-inventory { background-color: #e8f5e8; color: #2e7d32; }
    .category-products { background-color: #fff3e0; color: #f57c00; }
    .category-sales { background-color: #ffebee; color: #c62828; }
    .category-purchases { background-color: #e0f2f1; color: #00695c; }
    .category-finance { background-color: #fce4ec; color: #ad1457; }
    .category-reports { background-color: #f1f8e9; color: #558b2f; }
    .category-default { background-color: #f5f5f5; color: #666; }

    .permissions-paginator {
      border-top: 1px solid #e0e0e0;
    }

    .delete-option {
      color: #d32f2f;
    }

    .delete-option mat-icon {
      color: #d32f2f;
    }

    mat-chip-set {
      display: flex;
    }

    /* Estilos para la columna de acciones */
    .mat-column-actions {
      width: 130px;
      text-align: center;
      padding: 8px 12px !important;
    }

    .actions-header {
      text-align: center;
      font-weight: 600;
    }

    .actions-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
      padding: 4px 0;
    }

    .direct-actions {
      display: flex;
      gap: 2px;
      margin-right: 2px;
    }

    .action-button {
      width: 36px;
      height: 36px;
      background-color: transparent;
      border: none;
      border-radius: 8px;
      transition: all 0.2s ease;
      min-width: unset;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .action-button mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #666;
    }

    /* Estilos específicos para cada botón */
    .view-button mat-icon {
      color: #333;
    }

    .view-button:hover {
      background-color: #f5f5f5;
    }

    .view-button:hover mat-icon {
      color: #000;
    }

    .edit-button mat-icon {
      color: #333;
    }

    .edit-button:hover {
      background-color: #f5f5f5;
    }

    .edit-button:hover mat-icon {
      color: #000;
    }

    .menu-button mat-icon {
      color: #9e9e9e;
    }

    .menu-button:hover {
      background-color: #f5f5f5;
    }

    .menu-button:hover mat-icon {
      color: #1976d2;
    }

    .permission-actions-menu {
      margin-top: 8px;
    }
  `]
})
export class PermissionsComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  // Signals
  permissions = signal<ExtendedPermission[]>([]);
  filteredPermissions = signal<ExtendedPermission[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  selectedCategory = signal('all');

  // Table configuration
  displayedColumns: string[] = ['icon', 'name', 'description', 'category', 'status', 'actions'];
  dataSource = new MatTableDataSource<ExtendedPermission>();

  // Pagination state
  pageIndex = 0;
  pageSize = 10;
  totalCount = 0;

  // ViewChild references
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.loadPermissions();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    if (this.paginator) {
      this.paginator.page.subscribe((event) => {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadPermissions();
      });
    }
  }

  async loadPermissions() {
    try {
      this.isLoading.set(true);
      // Backend expects 1-based page, paginator is 0-based
      const response = await this.authService.getPermissions(this.pageIndex + 1, this.pageSize).toPromise();
      if (response && response.data) {
        const permissionsData = response.data.map((permission: any) => ({
          ...permission,
          isSelected: false
        }));
        this.permissions.set(permissionsData);
        this.dataSource.data = permissionsData;
  this.totalCount = response.totalRecords || response.totalCount || response.total || 0;
        if (this.paginator) {
          this.paginator.length = this.totalCount;
        }
        // Forzar actualización de vista para el paginador
        this.cdr.detectChanges();
      }
    } catch (error) {
      
      this.snackBar.open('Error al cargar permisos', 'Cerrar', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this.applyFilters();
  }

  filterByCategory(category: string) {
    this.selectedCategory.set(category);
    this.applyFilters();
  }

  // Filtering is now only for current page data (optional: could be removed or kept for local search)
  applyFilters() {
    let filtered = [...this.permissions()];
    // Optionally, keep search/category filter for current page
    const searchValue = this.searchTerm().toLowerCase();
    if (searchValue) {
      filtered = filtered.filter(permission =>
        permission.name?.toLowerCase().includes(searchValue) ||
        permission.description?.toLowerCase().includes(searchValue)
      );
    }
    const category = this.selectedCategory();
    if (category !== 'all') {
      filtered = filtered.filter(permission => 
        this.getPermissionCategory(permission.name || '').toLowerCase() === category.toLowerCase()
      );
    }
    this.filteredPermissions.set(filtered);
    this.dataSource.data = filtered;
  }

  refreshPermissions() {
    this.loadPermissions();
  }

  createPermission() {
    const dialogRef = this.dialog.open(CreatePermissionDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.savePermission(result);
      }
    });
  }

  private async savePermission(permissionData: any) {
    try {
      this.isLoading.set(true);
      await this.authService.createPermission(permissionData).toPromise();
      this.snackBar.open('Permiso creado correctamente', 'Cerrar', { duration: 3000 });
      this.loadPermissions();
    } catch (error) {

      this.snackBar.open('Error al crear permiso', 'Cerrar', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  viewPermission(permission: ExtendedPermission) {
    const dialogRef = this.dialog.open(ViewPermissionDialogComponent, {
      width: '600px',
      data: { permission }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'edit') {
        this.editPermission(result.permission);
      }
    });
  }

  editPermission(permission: ExtendedPermission) {
    const dialogRef = this.dialog.open(EditPermissionDialogComponent, {
      width: '600px',
      data: { permission }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updatePermission(permission.id!, result);
      }
    });
  }

  private async updatePermission(id: string, permissionData: any) {
    try {
      this.isLoading.set(true);
      await this.authService.updatePermission(id, permissionData).toPromise();
      this.snackBar.open('Permiso actualizado correctamente', 'Cerrar', { duration: 3000 });
      this.loadPermissions();
    } catch (error) {

      this.snackBar.open('Error al actualizar permiso', 'Cerrar', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  duplicatePermission(permission: ExtendedPermission) {

  }

  viewRolesWithPermission(permission: ExtendedPermission) {
    const dialogRef = this.dialog.open(ViewRolesDialogComponent, {
      width: '500px',
      data: { permission }
    });
  }

  async deletePermission(permission: ExtendedPermission) {
    try {
      await this.authService.deletePermission(permission.id!).toPromise();
      this.snackBar.open('Permiso eliminado correctamente', 'Cerrar', { duration: 3000 });
      this.loadPermissions();
    } catch (error) {

      this.snackBar.open('Error al eliminar permiso', 'Cerrar', { duration: 3000 });
    }
  }



  // Helper methods
  getPermissionIcon(permissionName: string): string {
    if (!permissionName) return 'security';
    const name = permissionName.toLowerCase();
    if (name.includes('user') || name.includes('usuario')) return 'person';
    if (name.includes('role') || name.includes('rol')) return 'group';
    if (name.includes('product') || name.includes('producto')) return 'inventory';
    if (name.includes('sale') || name.includes('venta')) return 'point_of_sale';
    if (name.includes('purchase') || name.includes('compra')) return 'shopping_cart';
    if (name.includes('finance') || name.includes('finanza')) return 'account_balance';
    if (name.includes('report') || name.includes('reporte')) return 'assessment';
    return 'security';
  }

  getCategoryClass(permissionName: string): string {
    const category = this.getPermissionCategory(permissionName).toLowerCase();
    return `category-${category}`;
  }

  getCategoryIcon(permissionName: string): string {
    const category = this.getPermissionCategory(permissionName).toLowerCase();
    const iconMap: {[key: string]: string} = {
      'users': 'person',
      'roles': 'group',
      'inventory': 'inventory_2',
      'products': 'shopping_bag',
      'sales': 'point_of_sale',
      'purchases': 'shopping_cart',
      'finance': 'account_balance',
      'reports': 'assessment'
    };
    return iconMap[category] || 'folder';
  }

  getPermissionCategory(permissionName: string): string {
    if (!permissionName) return 'General';
    const name = permissionName.toLowerCase();
    if (name.includes('user') || name.includes('usuario')) return 'Users';
    if (name.includes('role') || name.includes('rol')) return 'Roles';
    if (name.includes('product') || name.includes('producto')) return 'Products';
    if (name.includes('sale') || name.includes('venta')) return 'Sales';
    if (name.includes('purchase') || name.includes('compra')) return 'Purchases';
    if (name.includes('finance') || name.includes('finanza')) return 'Finance';
    if (name.includes('report') || name.includes('reporte')) return 'Reports';
    if (name.includes('inventory') || name.includes('inventario')) return 'Inventory';
    return 'General';
  }

  // Export methods
  exportToCSV() {
    const csvData = this.filteredPermissions().map(permission => ({
      'ID': permission.id,
      'Nombre': permission.name,
      'Descripción': permission.description,
      'Categoría': this.getPermissionCategory(permission.name || ''),
      'Estado': 'Activo'
    }));

    const csvRows = csvData.map(row => Object.values(row).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      ['ID,Nombre,Descripción,Categoría,Estado', ...csvRows].join('\n');
    
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'permisos.csv');
    link.click();
  }

  exportToExcel() {

  }

  exportToPDF() {

  }
}

// Componente de diálogo para crear permisos
@Component({
  selector: 'app-create-permission-dialog',
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
    <h2 mat-dialog-title>Crear Nuevo Permiso</h2>
    <mat-dialog-content>
      <form [formGroup]="permissionForm" class="permission-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre del Permiso</mat-label>
          <input matInput formControlName="name" placeholder="Ej: users.create">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="description" 
                   placeholder="Descripción del permiso" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Categoría</mat-label>
          <mat-select formControlName="category">
            <mat-option value="usuarios">Usuarios</mat-option>
            <mat-option value="roles">Roles</mat-option>
            <mat-option value="productos">Productos</mat-option>
            <mat-option value="ventas">Ventas</mat-option>
            <mat-option value="compras">Compras</mat-option>
            <mat-option value="finanzas">Finanzas</mat-option>
            <mat-option value="sistema">Sistema</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" 
              [disabled]="!permissionForm.valid"
              (click)="onSave()">
        Crear Permiso
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .permission-form {
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
export class CreatePermissionDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreatePermissionDialogComponent>);

  permissionForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    category: ['', Validators.required]
  });

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.permissionForm.valid) {
      this.dialogRef.close(this.permissionForm.value);
    }
  }
}

// Componente de diálogo para editar permisos
@Component({
  selector: 'app-edit-permission-dialog',
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
    <h2 mat-dialog-title>Editar Permiso</h2>
    <mat-dialog-content>
      <form [formGroup]="permissionForm" class="permission-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre del Permiso</mat-label>
          <input matInput formControlName="name" placeholder="Ej: users.create">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="description" 
                   placeholder="Descripción del permiso" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Categoría</mat-label>
          <mat-select formControlName="category">
            <mat-option value="usuarios">Usuarios</mat-option>
            <mat-option value="roles">Roles</mat-option>
            <mat-option value="productos">Productos</mat-option>
            <mat-option value="ventas">Ventas</mat-option>
            <mat-option value="compras">Compras</mat-option>
            <mat-option value="finanzas">Finanzas</mat-option>
            <mat-option value="sistema">Sistema</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" 
              [disabled]="!permissionForm.valid"
              (click)="onSave()">
        Actualizar Permiso
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .permission-form {
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
export class EditPermissionDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditPermissionDialogComponent>);
  private data = inject(MAT_DIALOG_DATA) as { permission: ExtendedPermission };
  
  permissionForm: FormGroup;

  constructor() {
    const permission = this.data?.permission;
    
    this.permissionForm = this.fb.group({
      name: [permission?.name || '', [Validators.required, Validators.minLength(3)]],
      description: [permission?.description || '', [Validators.required, Validators.minLength(10)]],
      category: [this.getPermissionCategory(permission?.name || ''), Validators.required]
    });
  }

  private getPermissionCategory(permissionName: string): string {
    if (!permissionName) return '';
    const name = permissionName.toLowerCase();
    if (name.includes('user') || name.includes('usuario')) return 'usuarios';
    if (name.includes('role') || name.includes('rol')) return 'roles';
    if (name.includes('product') || name.includes('producto')) return 'productos';
    if (name.includes('sale') || name.includes('venta')) return 'ventas';
    if (name.includes('purchase') || name.includes('compra')) return 'compras';
    if (name.includes('finance') || name.includes('finanza')) return 'finanzas';
    return 'sistema';
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.permissionForm.valid) {
      this.dialogRef.close(this.permissionForm.value);
    }
  }
}
