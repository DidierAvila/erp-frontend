import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Transaction {
  id: string;
  type: 'ingreso' | 'egreso' | 'transferencia';
  amount: number;
  currency: string;
  description: string;
  category: string;
  account: string;
  date: Date;
  status: 'pendiente' | 'completada' | 'cancelada';
  reference?: string;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatToolbarModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="transactions-container">
      <mat-toolbar color="primary">
        <span>Gestión de Transacciones</span>
        <span class="spacer"></span>
        <button mat-raised-button color="accent" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          Nueva Transacción
        </button>
      </mat-toolbar>

      <div class="content">
        <!-- Resumen de transacciones -->
        <div class="summary-cards">
          <mat-card class="summary-card income">
            <mat-card-content>
              <div class="summary-content">
                <mat-icon>trending_up</mat-icon>
                <div class="summary-info">
                  <h3>Ingresos</h3>
                  <p class="amount">{{getTotalByType('ingreso') | number:'1.2-2'}} USD</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card expense">
            <mat-card-content>
              <div class="summary-content">
                <mat-icon>trending_down</mat-icon>
                <div class="summary-info">
                  <h3>Egresos</h3>
                  <p class="amount">{{getTotalByType('egreso') | number:'1.2-2'}} USD</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card balance">
            <mat-card-content>
              <div class="summary-content">
                <mat-icon>account_balance</mat-icon>
                <div class="summary-info">
                  <h3>Balance Neto</h3>
                  <p class="amount" [class.negative]="getNetBalance() < 0">
                    {{getNetBalance() | number:'1.2-2'}} USD
                  </p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Formulario de nueva transacción -->
        <mat-card *ngIf="showAddForm" class="add-form-card">
          <mat-card-header>
            <mat-card-title>Nueva Transacción</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Tipo de Transacción</mat-label>
                  <mat-select formControlName="type">
                    <mat-option value="ingreso">Ingreso</mat-option>
                    <mat-option value="egreso">Egreso</mat-option>
                    <mat-option value="transferencia">Transferencia</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Monto</mat-label>
                  <input matInput type="number" formControlName="amount" placeholder="0.00">
                  <mat-error *ngIf="transactionForm.get('amount')?.hasError('required')">
                    El monto es requerido
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Cuenta</mat-label>
                  <mat-select formControlName="account">
                    <mat-option value="cuenta-corriente">Cuenta Corriente Principal</mat-option>
                    <mat-option value="cuenta-ahorros">Cuenta de Ahorros</mat-option>
                    <mat-option value="linea-credito">Línea de Crédito</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Categoría</mat-label>
                  <mat-select formControlName="category">
                    <mat-option value="ventas">Ventas</mat-option>
                    <mat-option value="compras">Compras</mat-option>
                    <mat-option value="gastos-operativos">Gastos Operativos</mat-option>
                    <mat-option value="nomina">Nómina</mat-option>
                    <mat-option value="impuestos">Impuestos</mat-option>
                    <mat-option value="otros">Otros</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Descripción</mat-label>
                  <input matInput formControlName="description" placeholder="Descripción de la transacción">
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Fecha</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="date">
                  <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Referencia (Opcional)</mat-label>
                  <input matInput formControlName="reference" placeholder="Número de referencia">
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-button type="button" (click)="cancelAdd()">Cancelar</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="transactionForm.invalid">
                  Crear Transacción
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Lista de transacciones -->
        <mat-card class="transactions-list-card">
          <mat-card-header>
            <mat-card-title>Historial de Transacciones</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="table-container">
              <table mat-table [dataSource]="transactions" class="transactions-table">
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Fecha</th>
                  <td mat-cell *matCellDef="let transaction">
                    {{transaction.date | date:'dd/MM/yyyy'}}
                  </td>
                </ng-container>

                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Tipo</th>
                  <td mat-cell *matCellDef="let transaction">
                    <mat-chip [class]="'type-' + transaction.type">
                      <mat-icon>{{getTypeIcon(transaction.type)}}</mat-icon>
                      {{getTypeLabel(transaction.type)}}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>Descripción</th>
                  <td mat-cell *matCellDef="let transaction">
                    <div class="description">
                      <strong>{{transaction.description}}</strong>
                      <small>{{transaction.category}}</small>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="account">
                  <th mat-header-cell *matHeaderCellDef>Cuenta</th>
                  <td mat-cell *matCellDef="let transaction">
                    {{getAccountLabel(transaction.account)}}
                  </td>
                </ng-container>

                <ng-container matColumnDef="amount">
                  <th mat-header-cell *matHeaderCellDef>Monto</th>
                  <td mat-cell *matCellDef="let transaction">
                    <span class="amount" [class]="'amount-' + transaction.type">
                      {{transaction.type === 'egreso' ? '-' : '+'}}{{transaction.amount | number:'1.2-2'}} {{transaction.currency}}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let transaction">
                    <span class="status" [class]="'status-' + transaction.status">
                      {{getStatusLabel(transaction.status)}}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let transaction">
                    <button mat-icon-button color="primary" (click)="editTransaction(transaction)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deleteTransaction(transaction)">
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
    </div>
  `,
  styles: [`
    .transactions-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .summary-card {
      min-height: 100px;
    }

    .summary-card.income {
      border-left: 4px solid #4caf50;
    }

    .summary-card.expense {
      border-left: 4px solid #f44336;
    }

    .summary-card.balance {
      border-left: 4px solid #2196f3;
    }

    .summary-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .summary-content mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .summary-info h3 {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .summary-info .amount {
      margin: 4px 0 0 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .summary-info .amount.negative {
      color: #f44336;
    }

    .add-form-card {
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

    .form-row mat-form-field.full-width {
      flex: 1;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .table-container {
      overflow-x: auto;
    }

    .transactions-table {
      width: 100%;
    }

    .type-ingreso {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .type-egreso {
      background-color: #ffebee;
      color: #c62828;
    }

    .type-transferencia {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .description strong {
      display: block;
      font-size: 14px;
    }

    .description small {
      display: block;
      font-size: 12px;
      color: #666;
      margin-top: 2px;
    }

    .amount-ingreso {
      color: #2e7d32;
      font-weight: 600;
    }

    .amount-egreso {
      color: #c62828;
      font-weight: 600;
    }

    .amount-transferencia {
      color: #1976d2;
      font-weight: 600;
    }

    .status-completada {
      background-color: #e8f5e8;
      color: #2e7d32;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-pendiente {
      background-color: #fff3e0;
      color: #f57c00;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-cancelada {
      background-color: #ffebee;
      color: #c62828;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .transactions-list-card {
      flex: 1;
    }
  `]
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [
    {
      id: '1',
      type: 'ingreso',
      amount: 5000.00,
      currency: 'USD',
      description: 'Venta de productos - Cliente ABC',
      category: 'ventas',
      account: 'cuenta-corriente',
      date: new Date('2024-01-15'),
      status: 'completada',
      reference: 'VTA-001'
    },
    {
      id: '2',
      type: 'egreso',
      amount: 1200.00,
      currency: 'USD',
      description: 'Compra de materiales',
      category: 'compras',
      account: 'cuenta-corriente',
      date: new Date('2024-01-14'),
      status: 'completada',
      reference: 'CMP-001'
    },
    {
      id: '3',
      type: 'egreso',
      amount: 800.00,
      currency: 'USD',
      description: 'Pago de nómina - Enero',
      category: 'nomina',
      account: 'cuenta-corriente',
      date: new Date('2024-01-31'),
      status: 'pendiente'
    },
    {
      id: '4',
      type: 'transferencia',
      amount: 2000.00,
      currency: 'USD',
      description: 'Transferencia a cuenta de ahorros',
      category: 'otros',
      account: 'cuenta-ahorros',
      date: new Date('2024-01-10'),
      status: 'completada'
    }
  ];

  displayedColumns: string[] = ['date', 'type', 'description', 'account', 'amount', 'status', 'actions'];
  showAddForm = false;
  transactionForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.transactionForm = this.fb.group({
      type: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required],
      category: ['', Validators.required],
      account: ['', Validators.required],
      date: [new Date(), Validators.required],
      reference: ['']
    });
  }

  ngOnInit(): void {
    // Inicialización del componente
  }

  openAddDialog(): void {
    this.showAddForm = true;
    this.transactionForm.reset({
      type: '',
      amount: 0,
      description: '',
      category: '',
      account: '',
      date: new Date(),
      reference: ''
    });
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.transactionForm.reset();
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      const newTransaction: Transaction = {
        id: (this.transactions.length + 1).toString(),
        ...this.transactionForm.value,
        currency: 'USD',
        status: 'completada'
      };
      
      this.transactions.unshift(newTransaction);
      this.showAddForm = false;
      this.transactionForm.reset();
    }
  }

  editTransaction(transaction: Transaction): void {
    console.log('Editando transacción:', transaction);
    // Implementar lógica de edición
  }

  deleteTransaction(transaction: Transaction): void {
    const index = this.transactions.findIndex(t => t.id === transaction.id);
    if (index > -1) {
      this.transactions.splice(index, 1);
    }
  }

  getTotalByType(type: string): number {
    return this.transactions
      .filter(t => t.type === type && t.status === 'completada')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getNetBalance(): number {
    const ingresos = this.getTotalByType('ingreso');
    const egresos = this.getTotalByType('egreso');
    return ingresos - egresos;
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'ingreso': 'arrow_upward',
      'egreso': 'arrow_downward',
      'transferencia': 'swap_horiz'
    };
    return icons[type] || 'help';
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'ingreso': 'Ingreso',
      'egreso': 'Egreso',
      'transferencia': 'Transferencia'
    };
    return labels[type] || type;
  }

  getAccountLabel(account: string): string {
    const accounts: { [key: string]: string } = {
      'cuenta-corriente': 'Cuenta Corriente',
      'cuenta-ahorros': 'Cuenta de Ahorros',
      'linea-credito': 'Línea de Crédito'
    };
    return accounts[account] || account;
  }

  getStatusLabel(status: string): string {
    const statuses: { [key: string]: string } = {
      'completada': 'Completada',
      'pendiente': 'Pendiente',
      'cancelada': 'Cancelada'
    };
    return statuses[status] || status;
  }
}