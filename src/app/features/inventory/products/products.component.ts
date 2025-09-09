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

import { InventoryService } from '../../../core/services';
import { ProductDto, CreateProductDto, UpdateProductDto } from '../../../core/models';

@Component({
  selector: 'app-products',
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
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule
  ],
  template: `
    <div class="products-container">
      <!-- Header Section -->
      <div class="products-header">
        <div class="header-title">
          <mat-icon>inventory</mat-icon>
          <h2>Gestión de Productos</h2>
        </div>
        <button mat-raised-button color="primary" (click)="openProductDialog()">
          <mat-icon>add</mat-icon>
          Nuevo Producto
        </button>
      </div>
      <!-- Formulario de Producto -->
      <mat-card class="product-form-card" *ngIf="showForm()">
        <mat-card-header>
          <mat-card-title>
            {{editingProduct() ? 'Editar Producto' : 'Nuevo Producto'}}
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="productForm" class="product-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nombre del Producto</mat-label>
                <input 
                  matInput 
                  formControlName="productName"
                  placeholder="Ej: Laptop Dell Inspiron"
                  required>
                <mat-error *ngIf="productForm.get('productName')?.hasError('required')">
                  El nombre es requerido
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>SKU</mat-label>
                <input 
                  matInput 
                  formControlName="sku"
                  placeholder="Ej: LAP-DELL-001"
                  required>
                <mat-error *ngIf="productForm.get('sku')?.hasError('required')">
                  El SKU es requerido
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción</mat-label>
              <textarea 
                matInput 
                formControlName="description"
                rows="3"
                placeholder="Descripción detallada del producto">
              </textarea>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Unidad de Medida</mat-label>
                <input 
                  matInput 
                  formControlName="unitOfMeasure"
                  placeholder="Ej: Pieza, Kg, Litro">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Stock Actual</mat-label>
                <input 
                  matInput 
                  type="number"
                  formControlName="currentStock"
                  min="0"
                  required>
                <mat-error *ngIf="productForm.get('currentStock')?.hasError('required')">
                  El stock actual es requerido
                </mat-error>
                <mat-error *ngIf="productForm.get('currentStock')?.hasError('min')">
                  El stock no puede ser negativo
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Stock Mínimo</mat-label>
                <input 
                  matInput 
                  type="number"
                  formControlName="minimumStock"
                  min="0"
                  required>
                <mat-error *ngIf="productForm.get('minimumStock')?.hasError('required')">
                  El stock mínimo es requerido
                </mat-error>
              </mat-form-field>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions class="form-actions">
          <button mat-button (click)="cancelForm()">
            Cancelar
          </button>
          <button 
            mat-raised-button 
            color="primary" 
            (click)="saveProduct()"
            [disabled]="!productForm.valid || isLoading()">
            {{editingProduct() ? 'Actualizar' : 'Guardar'}}
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- Lista de Productos -->
      <mat-card class="products-list-card">
        <mat-card-header>
          <mat-card-title>Lista de Productos</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" class="products-table">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let product">{{product.id}}</td>
              </ng-container>

              <ng-container matColumnDef="productName">
                <th mat-header-cell *matHeaderCellDef>Nombre</th>
                <td mat-cell *matCellDef="let product">{{product.productName}}</td>
              </ng-container>

              <ng-container matColumnDef="sku">
                <th mat-header-cell *matHeaderCellDef>SKU</th>
                <td mat-cell *matCellDef="let product">{{product.sku}}</td>
              </ng-container>

              <ng-container matColumnDef="currentStock">
                <th mat-header-cell *matHeaderCellDef>Stock</th>
                <td mat-cell *matCellDef="let product">
                  <mat-chip 
                    [color]="getStockColor(product)" 
                    selected>
                    {{product.currentStock}} {{product.unitOfMeasure || 'und'}}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="minimumStock">
                <th mat-header-cell *matHeaderCellDef>Stock Mín.</th>
                <td mat-cell *matCellDef="let product">{{product.minimumStock}}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let product">
                  <button mat-icon-button (click)="editProduct(product)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteProduct(product)">
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
    .products-container {
      padding: 20px;
      background-color: #f5f5f5;
      min-height: calc(100vh - 64px);
    }

    .product-form-card {
      margin-bottom: 20px;
    }

    .product-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 20px;
    }

    .form-row {
      display: flex;
      gap: 20px;
    }

    .form-row .mat-form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding-top: 20px;
    }

    .products-list-card {
      width: 100%;
    }

    .table-container {
      width: 100%;
      overflow: auto;
    }

    .products-table {
      width: 100%;
    }

    mat-chip {
      font-size: 12px;
    }

    @media (max-width: 768px) {
      .products-container {
        padding: 10px;
      }

      .form-row {
        flex-direction: column;
        gap: 10px;
      }
    }

    .products-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 16px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-title mat-icon {
      font-size: 24px;
      color: #1976d2;
    }

    .header-title h2 {
      margin: 0;
      color: #333;
      font-weight: 500;
    }
  `]
})
export class ProductsComponent implements OnInit {
  productForm: FormGroup;
  showForm = signal(false);
  editingProduct = signal<ProductDto | null>(null);
  isLoading = signal(false);
  
  displayedColumns: string[] = ['id', 'productName', 'sku', 'currentStock', 'minimumStock', 'actions'];
  dataSource = new MatTableDataSource<ProductDto>([]);

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      sku: ['', Validators.required],
      description: [''],
      unitOfMeasure: [''],
      currentStock: [0, [Validators.required, Validators.min(0)]],
      minimumStock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  openProductDialog(): void {
    this.showForm.set(true);
    this.editingProduct.set(null);
    this.productForm.reset();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.inventoryService.getProducts().subscribe({
      next: (products) => {
        this.dataSource.data = products;
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.snackBar.open('Error al cargar productos', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  saveProduct(): void {
    if (this.productForm.valid) {
      this.isLoading.set(true);
      
      if (this.editingProduct()) {
        // Actualizar producto existente
        const updateData: UpdateProductDto = this.productForm.value;
        this.inventoryService.updateProduct(this.editingProduct()!.id, updateData).subscribe({
          next: (response) => {
            this.isLoading.set(false);
            this.showForm.set(false);
            this.loadProducts();
            this.snackBar.open('Producto actualizado correctamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            this.isLoading.set(false);
            this.snackBar.open('Error al actualizar producto', 'Cerrar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      } else {
        // Crear nuevo producto
        const createData: CreateProductDto = this.productForm.value;
        this.inventoryService.createProduct(createData).subscribe({
          next: (response) => {
            this.isLoading.set(false);
            this.showForm.set(false);
            this.loadProducts();
            this.snackBar.open('Producto creado correctamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            this.isLoading.set(false);
            this.snackBar.open('Error al crear producto', 'Cerrar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    }
  }

  editProduct(product: ProductDto): void {
    this.editingProduct.set(product);
    this.productForm.patchValue(product);
    this.showForm.set(true);
  }

  deleteProduct(product: ProductDto): void {
    if (confirm(`¿Está seguro de eliminar el producto "${product.productName}"?`)) {
      this.inventoryService.deleteProduct(product.id).subscribe({
        next: () => {
          this.loadProducts();
          this.snackBar.open('Producto eliminado correctamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.snackBar.open('Error al eliminar producto', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingProduct.set(null);
    this.productForm.reset();
  }

  getStockColor(product: ProductDto): string {
    if (product.currentStock === 0) {
      return 'warn';
    } else if (product.currentStock <= product.minimumStock) {
      return 'accent';
    }
    return 'primary';
  }
}
