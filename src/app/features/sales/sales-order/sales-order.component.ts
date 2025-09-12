import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';

interface SalesOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  orderDate: Date;
  deliveryDate: Date;
  status: 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: SalesOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes: string;
}

@Component({
  selector: 'app-sales-order',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatToolbarModule,
    MatChipsModule
  ],
  template: `
    <div class="sales-order-container">
      <!-- Header -->
      <mat-toolbar class="header-toolbar">
        <span class="title">Gestión de Órdenes de Venta</span>
        <span class="spacer"></span>
        <button mat-raised-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          Nueva Orden
        </button>
      </mat-toolbar>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon class="summary-icon orders">shopping_cart</mat-icon>
              <div class="summary-text">
                <h3>{{ totalOrders }}</h3>
                <p>Órdenes Totales</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon class="summary-icon pending">schedule</mat-icon>
              <div class="summary-text">
                <h3>{{ pendingOrders }}</h3>
                <p>Órdenes Pendientes</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon class="summary-icon revenue">attach_money</mat-icon>
              <div class="summary-text">
                <h3>{{ totalRevenue | currency:'USD':'symbol':'1.2-2' }}</h3>
                <p>Ingresos del Mes</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon class="summary-icon delivered">local_shipping</mat-icon>
              <div class="summary-text">
                <h3>{{ deliveredOrders }}</h3>
                <p>Órdenes Entregadas</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Add Order Form -->
      <mat-card *ngIf="showAddForm" class="add-form-card">
        <mat-card-header>
          <mat-card-title>Nueva Orden de Venta</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="orderForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Número de Orden</mat-label>
                <input matInput formControlName="orderNumber" required>
                <mat-error *ngIf="orderForm.get('orderNumber')?.hasError('required')">
                  El número de orden es requerido
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Cliente</mat-label>
                <mat-select formControlName="customerId" required>
                  <mat-option value="1">Empresa ABC S.A.</mat-option>
                  <mat-option value="2">Comercial XYZ Ltda.</mat-option>
                  <mat-option value="3">Distribuidora 123</mat-option>
                </mat-select>
                <mat-error *ngIf="orderForm.get('customerId')?.hasError('required')">
                  El cliente es requerido
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Fecha de Orden</mat-label>
                <input matInput [matDatepicker]="orderPicker" formControlName="orderDate" required>
                <mat-datepicker-toggle matSuffix [for]="orderPicker"></mat-datepicker-toggle>
                <mat-datepicker #orderPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Fecha de Entrega</mat-label>
                <input matInput [matDatepicker]="deliveryPicker" formControlName="deliveryDate" required>
                <mat-datepicker-toggle matSuffix [for]="deliveryPicker"></mat-datepicker-toggle>
                <mat-datepicker #deliveryPicker></mat-datepicker>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Estado</mat-label>
                <mat-select formControlName="status" required>
                  <mat-option value="draft">Borrador</mat-option>
                  <mat-option value="confirmed">Confirmada</mat-option>
                  <mat-option value="processing">En Proceso</mat-option>
                  <mat-option value="shipped">Enviada</mat-option>
                  <mat-option value="delivered">Entregada</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Total</mat-label>
                <input matInput type="number" formControlName="total" required>
                <span matPrefix>$</span>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notas</mat-label>
              <textarea matInput formControlName="notes" rows="3"></textarea>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" (click)="cancelAdd()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="orderForm.invalid">
                Crear Orden
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Orders Table -->
      <mat-card class="table-card">
        <mat-card-header>
          <mat-card-title>Órdenes de Venta</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="salesOrders" class="orders-table">
            <ng-container matColumnDef="orderNumber">
              <th mat-header-cell *matHeaderCellDef>Número</th>
              <td mat-cell *matCellDef="let order">{{ order.orderNumber }}</td>
            </ng-container>

            <ng-container matColumnDef="customerName">
              <th mat-header-cell *matHeaderCellDef>Cliente</th>
              <td mat-cell *matCellDef="let order">{{ order.customerName }}</td>
            </ng-container>

            <ng-container matColumnDef="orderDate">
              <th mat-header-cell *matHeaderCellDef>Fecha Orden</th>
              <td mat-cell *matCellDef="let order">{{ order.orderDate | date:'dd/MM/yyyy' }}</td>
            </ng-container>

            <ng-container matColumnDef="deliveryDate">
              <th mat-header-cell *matHeaderCellDef>Fecha Entrega</th>
              <td mat-cell *matCellDef="let order">{{ order.deliveryDate | date:'dd/MM/yyyy' }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let order">
                <mat-chip-set>
                  <mat-chip [class]="'status-' + order.status">{{ getStatusLabel(order.status) }}</mat-chip>
                </mat-chip-set>
              </td>
            </ng-container>

            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let order">{{ order.total | currency:'USD':'symbol':'1.2-2' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let order">
                <button mat-icon-button color="primary" (click)="editOrder(order)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteOrder(order.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .sales-order-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-toolbar {
      background: #1976d2;
      color: white;
      margin-bottom: 20px;
      border-radius: 8px;
    }

    .title {
      font-size: 1.5rem;
      font-weight: 500;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .summary-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .summary-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .summary-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
    }

    .summary-icon.orders { color: #4CAF50; }
    .summary-icon.pending { color: #FF9800; }
    .summary-icon.revenue { color: #2196F3; }
    .summary-icon.delivered { color: #9C27B0; }

    .summary-text h3 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: bold;
    }

    .summary-text p {
      margin: 4px 0 0 0;
      opacity: 0.9;
      font-size: 0.9rem;
    }

    .add-form-card, .table-card {
      margin-bottom: 20px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .orders-table {
      width: 100%;
    }

    .status-draft { background-color: #9E9E9E; color: white; }
    .status-confirmed { background-color: #2196F3; color: white; }
    .status-processing { background-color: #FF9800; color: white; }
    .status-shipped { background-color: #9C27B0; color: white; }
    .status-delivered { background-color: #4CAF50; color: white; }
    .status-cancelled { background-color: #F44336; color: white; }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
      }
      
      .summary-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SalesOrderComponent implements OnInit {
  showAddForm = false;
  orderForm: FormGroup;
  displayedColumns: string[] = ['orderNumber', 'customerName', 'orderDate', 'deliveryDate', 'status', 'total', 'actions'];
  
  // Sample data
  salesOrders: SalesOrder[] = [
    {
      id: '1',
      orderNumber: 'SO-2024-001',
      customerId: '1',
      customerName: 'Empresa ABC S.A.',
      orderDate: new Date('2024-01-15'),
      deliveryDate: new Date('2024-01-25'),
      status: 'confirmed',
      items: [],
      subtotal: 15000,
      tax: 2250,
      discount: 0,
      total: 17250,
      notes: 'Orden urgente para cliente premium'
    },
    {
      id: '2',
      orderNumber: 'SO-2024-002',
      customerId: '2',
      customerName: 'Comercial XYZ Ltda.',
      orderDate: new Date('2024-01-16'),
      deliveryDate: new Date('2024-01-30'),
      status: 'processing',
      items: [],
      subtotal: 8500,
      tax: 1275,
      discount: 500,
      total: 9275,
      notes: 'Descuento por volumen aplicado'
    },
    {
      id: '3',
      orderNumber: 'SO-2024-003',
      customerId: '3',
      customerName: 'Distribuidora 123',
      orderDate: new Date('2024-01-17'),
      deliveryDate: new Date('2024-02-05'),
      status: 'draft',
      items: [],
      subtotal: 12000,
      tax: 1800,
      discount: 0,
      total: 13800,
      notes: 'Pendiente de confirmación del cliente'
    },
    {
      id: '4',
      orderNumber: 'SO-2024-004',
      customerId: '1',
      customerName: 'Empresa ABC S.A.',
      orderDate: new Date('2024-01-18'),
      deliveryDate: new Date('2024-01-28'),
      status: 'delivered',
      items: [],
      subtotal: 22000,
      tax: 3300,
      discount: 1000,
      total: 24300,
      notes: 'Entregado satisfactoriamente'
    }
  ];

  // Summary data
  totalOrders = 4;
  pendingOrders = 2;
  totalRevenue = 64625;
  deliveredOrders = 1;

  constructor(private fb: FormBuilder) {
    this.orderForm = this.fb.group({
      orderNumber: ['', Validators.required],
      customerId: ['', Validators.required],
      orderDate: [new Date(), Validators.required],
      deliveryDate: ['', Validators.required],
      status: ['draft', Validators.required],
      total: [0, [Validators.required, Validators.min(0)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Initialize component
  }

  openAddDialog(): void {
    this.showAddForm = true;
    this.orderForm.reset({
      orderNumber: this.generateOrderNumber(),
      customerId: '',
      orderDate: new Date(),
      deliveryDate: '',
      status: 'draft',
      total: 0,
      notes: ''
    });
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.orderForm.reset();
  }

  onSubmit(): void {
    if (this.orderForm.valid) {
      const formValue = this.orderForm.value;
      const newOrder: SalesOrder = {
        id: Date.now().toString(),
        orderNumber: formValue.orderNumber,
        customerId: formValue.customerId,
        customerName: this.getCustomerName(formValue.customerId),
        orderDate: formValue.orderDate,
        deliveryDate: formValue.deliveryDate,
        status: formValue.status,
        items: [],
        subtotal: formValue.total * 0.85,
        tax: formValue.total * 0.15,
        discount: 0,
        total: formValue.total,
        notes: formValue.notes
      };

      this.salesOrders.unshift(newOrder);
      this.updateSummaryData();
      this.cancelAdd();
      console.log('Nueva orden creada:', newOrder);
    }
  }

  editOrder(order: SalesOrder): void {
    console.log('Editando orden:', order);
    // Implement edit functionality
  }

  deleteOrder(orderId: string): void {
    const index = this.salesOrders.findIndex(order => order.id === orderId);
    if (index > -1) {
      this.salesOrders.splice(index, 1);
      this.updateSummaryData();
      console.log('Orden eliminada:', orderId);
    }
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'draft': 'Borrador',
      'confirmed': 'Confirmada',
      'processing': 'En Proceso',
      'shipped': 'Enviada',
      'delivered': 'Entregada',
      'cancelled': 'Cancelada'
    };
    return statusLabels[status] || status;
  }

  private generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const nextNumber = this.salesOrders.length + 1;
    return `SO-${year}-${nextNumber.toString().padStart(3, '0')}`;
  }

  private getCustomerName(customerId: string): string {
    const customers: { [key: string]: string } = {
      '1': 'Empresa ABC S.A.',
      '2': 'Comercial XYZ Ltda.',
      '3': 'Distribuidora 123'
    };
    return customers[customerId] || 'Cliente Desconocido';
  }

  private updateSummaryData(): void {
    this.totalOrders = this.salesOrders.length;
    this.pendingOrders = this.salesOrders.filter(order => 
      ['draft', 'confirmed', 'processing'].includes(order.status)
    ).length;
    this.deliveredOrders = this.salesOrders.filter(order => 
      order.status === 'delivered'
    ).length;
    this.totalRevenue = this.salesOrders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0);
  }
}