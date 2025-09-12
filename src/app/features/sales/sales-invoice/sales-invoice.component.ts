import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  items: SalesInvoiceItem[];
  notes?: string;
  paymentTerms: string;
}

export interface SalesInvoiceItem {
  id: string;
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  totalAmount: number;
}

@Component({
  selector: 'app-sales-invoice',
  standalone: true,
  imports: [
    CommonModule,
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
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTabsModule
  ],
  template: `
    <div class="sales-invoice-container">
      <!-- Header -->
      <div class="header">
        <h1><mat-icon>receipt</mat-icon> Facturas de Venta</h1>
        <button mat-raised-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          Nueva Factura
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <mat-card class="summary-card">
          <mat-card-content>
            <div class="card-header">
              <mat-icon color="primary">receipt_long</mat-icon>
              <span class="card-title">Total Facturas</span>
            </div>
            <div class="card-value">{{ invoices.length }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="card-header">
              <mat-icon color="accent">schedule</mat-icon>
              <span class="card-title">Pendientes</span>
            </div>
            <div class="card-value">{{ getPendingInvoices() }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="card-header">
              <mat-icon color="warn">warning</mat-icon>
              <span class="card-title">Vencidas</span>
            </div>
            <div class="card-value">{{ getOverdueInvoices() }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="card-header">
              <mat-icon style="color: #4caf50;">attach_money</mat-icon>
              <span class="card-title">Ingresos Totales</span>
            </div>
            <div class="card-value">{{ getTotalRevenue() | currency:'USD':'symbol':'1.2-2' }}</div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-tab-group>
        <!-- Invoices List Tab -->
        <mat-tab label="Lista de Facturas">
          <div class="tab-content">
            <!-- Invoices Table -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>Facturas de Venta</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <table mat-table [dataSource]="invoices" class="invoices-table">
                  <ng-container matColumnDef="invoiceNumber">
                    <th mat-header-cell *matHeaderCellDef>Número</th>
                    <td mat-cell *matCellDef="let invoice">{{ invoice.invoiceNumber }}</td>
                  </ng-container>

                  <ng-container matColumnDef="customerName">
                    <th mat-header-cell *matHeaderCellDef>Cliente</th>
                    <td mat-cell *matCellDef="let invoice">{{ invoice.customerName }}</td>
                  </ng-container>

                  <ng-container matColumnDef="issueDate">
                    <th mat-header-cell *matHeaderCellDef>Fecha Emisión</th>
                    <td mat-cell *matCellDef="let invoice">{{ invoice.issueDate | date:'dd/MM/yyyy' }}</td>
                  </ng-container>

                  <ng-container matColumnDef="dueDate">
                    <th mat-header-cell *matHeaderCellDef>Fecha Vencimiento</th>
                    <td mat-cell *matCellDef="let invoice">{{ invoice.dueDate | date:'dd/MM/yyyy' }}</td>
                  </ng-container>

                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Estado</th>
                    <td mat-cell *matCellDef="let invoice">
                      <mat-chip [ngClass]="getStatusClass(invoice.status)">{{ getStatusLabel(invoice.status) }}</mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="totalAmount">
                    <th mat-header-cell *matHeaderCellDef>Total</th>
                    <td mat-cell *matCellDef="let invoice">{{ invoice.totalAmount | currency:'USD':'symbol':'1.2-2' }}</td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Acciones</th>
                    <td mat-cell *matCellDef="let invoice">
                      <button mat-icon-button color="primary" (click)="editInvoice(invoice)">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="accent" (click)="viewInvoice(invoice)">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="deleteInvoice(invoice.id)">
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
        </mat-tab>

        <!-- Add/Edit Invoice Tab -->
        <mat-tab label="Nueva Factura" *ngIf="showAddForm">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>{{ editingInvoice ? 'Editar Factura' : 'Nueva Factura' }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="invoiceForm" (ngSubmit)="onSubmit()">
                  <div class="form-row">
                    <mat-form-field>
                      <mat-label>Número de Factura</mat-label>
                      <input matInput formControlName="invoiceNumber" placeholder="INV-001">
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>Cliente</mat-label>
                      <mat-select formControlName="customerId">
                        <mat-option value="1">Empresa ABC S.A.</mat-option>
                        <mat-option value="2">Comercial XYZ Ltda.</mat-option>
                        <mat-option value="3">Distribuidora 123</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field>
                      <mat-label>Fecha de Emisión</mat-label>
                      <input matInput [matDatepicker]="issuePicker" formControlName="issueDate">
                      <mat-datepicker-toggle matSuffix [for]="issuePicker"></mat-datepicker-toggle>
                      <mat-datepicker #issuePicker></mat-datepicker>
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>Fecha de Vencimiento</mat-label>
                      <input matInput [matDatepicker]="duePicker" formControlName="dueDate">
                      <mat-datepicker-toggle matSuffix [for]="duePicker"></mat-datepicker-toggle>
                      <mat-datepicker #duePicker></mat-datepicker>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field>
                      <mat-label>Estado</mat-label>
                      <mat-select formControlName="status">
                        <mat-option value="draft">Borrador</mat-option>
                        <mat-option value="sent">Enviada</mat-option>
                        <mat-option value="paid">Pagada</mat-option>
                        <mat-option value="overdue">Vencida</mat-option>
                        <mat-option value="cancelled">Cancelada</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>Términos de Pago</mat-label>
                      <mat-select formControlName="paymentTerms">
                        <mat-option value="net15">Neto 15 días</mat-option>
                        <mat-option value="net30">Neto 30 días</mat-option>
                        <mat-option value="net60">Neto 60 días</mat-option>
                        <mat-option value="immediate">Inmediato</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <!-- Invoice Items -->
                  <mat-divider></mat-divider>
                  <h3>Artículos de la Factura</h3>
                  
                  <div formArrayName="items">
                    <div *ngFor="let item of invoiceItems.controls; let i = index" [formGroupName]="i" class="item-row">
                      <mat-form-field>
                        <mat-label>Producto</mat-label>
                        <mat-select formControlName="productId">
                          <mat-option value="1">Producto A</mat-option>
                          <mat-option value="2">Producto B</mat-option>
                          <mat-option value="3">Servicio C</mat-option>
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field>
                        <mat-label>Descripción</mat-label>
                        <input matInput formControlName="description">
                      </mat-form-field>

                      <mat-form-field>
                        <mat-label>Cantidad</mat-label>
                        <input matInput type="number" formControlName="quantity" (input)="calculateItemTotal(i)">
                      </mat-form-field>

                      <mat-form-field>
                        <mat-label>Precio Unitario</mat-label>
                        <input matInput type="number" formControlName="unitPrice" (input)="calculateItemTotal(i)">
                      </mat-form-field>

                      <mat-form-field>
                        <mat-label>% Impuesto</mat-label>
                        <input matInput type="number" formControlName="taxRate" (input)="calculateItemTotal(i)">
                      </mat-form-field>

                      <mat-form-field>
                        <mat-label>Total</mat-label>
                        <input matInput type="number" formControlName="totalAmount" readonly>
                      </mat-form-field>

                      <button mat-icon-button color="warn" type="button" (click)="removeItem(i)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>

                  <button mat-button type="button" (click)="addItem()">
                    <mat-icon>add</mat-icon>
                    Agregar Artículo
                  </button>

                  <mat-divider></mat-divider>

                  <!-- Totals -->
                  <div class="totals-section">
                    <div class="total-row">
                      <span>Subtotal:</span>
                      <span>{{ calculateSubtotal() | currency:'USD':'symbol':'1.2-2' }}</span>
                    </div>
                    <div class="total-row">
                      <span>Impuestos:</span>
                      <span>{{ calculateTaxAmount() | currency:'USD':'symbol':'1.2-2' }}</span>
                    </div>
                    <div class="total-row total-final">
                      <span>Total:</span>
                      <span>{{ calculateTotal() | currency:'USD':'symbol':'1.2-2' }}</span>
                    </div>
                  </div>

                  <mat-form-field class="full-width">
                    <mat-label>Notas</mat-label>
                    <textarea matInput formControlName="notes" rows="3"></textarea>
                  </mat-form-field>

                  <div class="form-actions">
                    <button mat-button type="button" (click)="cancelEdit()">Cancelar</button>
                    <button mat-raised-button color="primary" type="submit" [disabled]="invoiceForm.invalid">
                      {{ editingInvoice ? 'Actualizar' : 'Crear' }} Factura
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .sales-invoice-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .header h1 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
      color: #333;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .summary-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .card-title {
      font-weight: 500;
      color: #666;
    }

    .card-value {
      font-size: 2em;
      font-weight: bold;
      color: #333;
    }

    .tab-content {
      padding: 20px 0;
    }

    .invoices-table {
      width: 100%;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .item-row {
      display: grid;
      grid-template-columns: 1fr 2fr 80px 100px 80px 100px 50px;
      gap: 10px;
      align-items: center;
      margin-bottom: 15px;
      padding: 10px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }

    .totals-section {
      margin: 20px 0;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }

    .total-final {
      font-weight: bold;
      font-size: 1.1em;
      border-top: 1px solid #ddd;
      padding-top: 10px;
      margin-top: 10px;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .status-draft { background-color: #ffc107; color: white; }
    .status-sent { background-color: #17a2b8; color: white; }
    .status-paid { background-color: #28a745; color: white; }
    .status-overdue { background-color: #dc3545; color: white; }
    .status-cancelled { background-color: #6c757d; color: white; }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .item-row {
        grid-template-columns: 1fr;
      }
      
      .summary-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SalesInvoiceComponent implements OnInit {
  invoices: SalesInvoice[] = [];
  invoiceForm: FormGroup;
  displayedColumns: string[] = ['invoiceNumber', 'customerName', 'issueDate', 'dueDate', 'status', 'totalAmount', 'actions'];
  editingInvoice: SalesInvoice | null = null;
  showAddForm = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.invoiceForm = this.createInvoiceForm();
  }

  ngOnInit() {
    this.loadSampleData();
  }

  createInvoiceForm(): FormGroup {
    return this.fb.group({
      invoiceNumber: ['', Validators.required],
      customerId: ['', Validators.required],
      issueDate: [new Date(), Validators.required],
      dueDate: [new Date(), Validators.required],
      status: ['draft', Validators.required],
      paymentTerms: ['net30', Validators.required],
      notes: [''],
      items: this.fb.array([])
    });
  }

  get invoiceItems() {
    return this.invoiceForm.get('items') as FormArray;
  }

  addItem() {
    const itemForm = this.fb.group({
      productId: ['', Validators.required],
      productName: [''],
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      taxRate: [0, [Validators.min(0), Validators.max(100)]],
      totalAmount: [0]
    });
    this.invoiceItems.push(itemForm);
  }

  removeItem(index: number) {
    this.invoiceItems.removeAt(index);
  }

  calculateItemTotal(index: number) {
    const item = this.invoiceItems.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unitPrice')?.value || 0;
    const taxRate = item.get('taxRate')?.value || 0;
    
    const subtotal = quantity * unitPrice;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    item.get('totalAmount')?.setValue(total);
  }

  calculateSubtotal(): number {
    return this.invoiceItems.controls.reduce((sum, item) => {
      const quantity = item.get('quantity')?.value || 0;
      const unitPrice = item.get('unitPrice')?.value || 0;
      return sum + (quantity * unitPrice);
    }, 0);
  }

  calculateTaxAmount(): number {
    return this.invoiceItems.controls.reduce((sum, item) => {
      const quantity = item.get('quantity')?.value || 0;
      const unitPrice = item.get('unitPrice')?.value || 0;
      const taxRate = item.get('taxRate')?.value || 0;
      const subtotal = quantity * unitPrice;
      return sum + (subtotal * (taxRate / 100));
    }, 0);
  }

  calculateTotal(): number {
    return this.calculateSubtotal() + this.calculateTaxAmount();
  }

  openAddDialog() {
    this.showAddForm = true;
    this.editingInvoice = null;
    this.invoiceForm.reset();
    this.invoiceForm.patchValue({
      issueDate: new Date(),
      dueDate: new Date(),
      status: 'draft',
      paymentTerms: 'net30'
    });
    this.invoiceItems.clear();
    this.addItem();
  }

  editInvoice(invoice: SalesInvoice) {
    this.showAddForm = true;
    this.editingInvoice = invoice;
    this.invoiceForm.patchValue({
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      status: invoice.status,
      paymentTerms: invoice.paymentTerms,
      notes: invoice.notes
    });
    
    this.invoiceItems.clear();
    invoice.items.forEach(item => {
      const itemForm = this.fb.group({
        productId: [item.productId],
        productName: [item.productName],
        description: [item.description],
        quantity: [item.quantity],
        unitPrice: [item.unitPrice],
        taxRate: [item.taxRate],
        totalAmount: [item.totalAmount]
      });
      this.invoiceItems.push(itemForm);
    });
  }

  viewInvoice(invoice: SalesInvoice) {
    this.snackBar.open(`Visualizando factura ${invoice.invoiceNumber}`, 'Cerrar', {
      duration: 3000
    });
  }

  deleteInvoice(invoiceId: string) {
    const index = this.invoices.findIndex(inv => inv.id === invoiceId);
    if (index > -1) {
      this.invoices.splice(index, 1);
      this.snackBar.open('Factura eliminada exitosamente', 'Cerrar', {
        duration: 3000
      });
    }
  }

  onSubmit() {
    if (this.invoiceForm.valid) {
      const formValue = this.invoiceForm.value;
      const customerName = this.getCustomerName(formValue.customerId);
      
      const invoice: SalesInvoice = {
        id: this.editingInvoice?.id || Date.now().toString(),
        invoiceNumber: formValue.invoiceNumber,
        customerId: formValue.customerId,
        customerName: customerName,
        issueDate: formValue.issueDate,
        dueDate: formValue.dueDate,
        status: formValue.status,
        paymentTerms: formValue.paymentTerms,
        subtotal: this.calculateSubtotal(),
        taxAmount: this.calculateTaxAmount(),
        totalAmount: this.calculateTotal(),
        items: formValue.items.map((item: any) => ({
          id: Date.now().toString() + Math.random(),
          productId: item.productId,
          productName: this.getProductName(item.productId),
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          totalAmount: item.totalAmount
        })),
        notes: formValue.notes
      };

      if (this.editingInvoice) {
        const index = this.invoices.findIndex(inv => inv.id === this.editingInvoice!.id);
        this.invoices[index] = invoice;
        this.snackBar.open('Factura actualizada exitosamente', 'Cerrar', { duration: 3000 });
      } else {
        this.invoices.push(invoice);
        this.snackBar.open('Factura creada exitosamente', 'Cerrar', { duration: 3000 });
      }

      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.showAddForm = false;
    this.editingInvoice = null;
    this.invoiceForm.reset();
    this.invoiceItems.clear();
  }

  getCustomerName(customerId: string): string {
    const customers: { [key: string]: string } = {
      '1': 'Empresa ABC S.A.',
      '2': 'Comercial XYZ Ltda.',
      '3': 'Distribuidora 123'
    };
    return customers[customerId] || 'Cliente Desconocido';
  }

  getProductName(productId: string): string {
    const products: { [key: string]: string } = {
      '1': 'Producto A',
      '2': 'Producto B',
      '3': 'Servicio C'
    };
    return products[productId] || 'Producto Desconocido';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'draft': 'Borrador',
      'sent': 'Enviada',
      'paid': 'Pagada',
      'overdue': 'Vencida',
      'cancelled': 'Cancelada'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getPendingInvoices(): number {
    return this.invoices.filter(inv => inv.status === 'sent' || inv.status === 'draft').length;
  }

  getOverdueInvoices(): number {
    return this.invoices.filter(inv => inv.status === 'overdue').length;
  }

  getTotalRevenue(): number {
    return this.invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
  }

  private loadSampleData() {
    this.invoices = [
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        customerId: '1',
        customerName: 'Empresa ABC S.A.',
        issueDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-15'),
        status: 'paid',
        paymentTerms: 'net30',
        subtotal: 1000,
        taxAmount: 190,
        totalAmount: 1190,
        items: [
          {
            id: '1',
            productId: '1',
            productName: 'Producto A',
            description: 'Descripción del producto A',
            quantity: 10,
            unitPrice: 100,
            taxRate: 19,
            totalAmount: 1190
          }
        ],
        notes: 'Factura de ejemplo'
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        customerId: '2',
        customerName: 'Comercial XYZ Ltda.',
        issueDate: new Date('2024-01-20'),
        dueDate: new Date('2024-02-20'),
        status: 'sent',
        paymentTerms: 'net30',
        subtotal: 750,
        taxAmount: 142.5,
        totalAmount: 892.5,
        items: [
          {
            id: '2',
            productId: '2',
            productName: 'Producto B',
            description: 'Descripción del producto B',
            quantity: 5,
            unitPrice: 150,
            taxRate: 19,
            totalAmount: 892.5
          }
        ]
      },
      {
        id: '3',
        invoiceNumber: 'INV-2024-003',
        customerId: '3',
        customerName: 'Distribuidora 123',
        issueDate: new Date('2024-01-10'),
        dueDate: new Date('2024-01-25'),
        status: 'overdue',
        paymentTerms: 'net15',
        subtotal: 500,
        taxAmount: 95,
        totalAmount: 595,
        items: [
          {
            id: '3',
            productId: '3',
            productName: 'Servicio C',
            description: 'Descripción del servicio C',
            quantity: 1,
            unitPrice: 500,
            taxRate: 19,
            totalAmount: 595
          }
        ]
      }
    ];
  }
}