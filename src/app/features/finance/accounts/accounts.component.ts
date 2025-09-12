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
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  status: string;
  createdAt: Date;
}

@Component({
  selector: 'app-accounts',
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
    ReactiveFormsModule
  ],
  template: `
    <div class="accounts-container">
      <mat-toolbar color="primary">
        <span>Gestión de Cuentas</span>
        <span class="spacer"></span>
        <button mat-raised-button color="accent" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          Nueva Cuenta
        </button>
      </mat-toolbar>

      <div class="content">
        <!-- Formulario de nueva cuenta -->
        <mat-card *ngIf="showAddForm" class="add-form-card">
          <mat-card-header>
            <mat-card-title>Nueva Cuenta</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="accountForm" (ngSubmit)="onSubmit()">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Nombre de la Cuenta</mat-label>
                  <input matInput formControlName="name" placeholder="Ej: Cuenta Corriente Principal">
                  <mat-error *ngIf="accountForm.get('name')?.hasError('required')">
                    El nombre es requerido
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Tipo de Cuenta</mat-label>
                  <mat-select formControlName="type">
                    <mat-option value="corriente">Cuenta Corriente</mat-option>
                    <mat-option value="ahorro">Cuenta de Ahorro</mat-option>
                    <mat-option value="credito">Línea de Crédito</mat-option>
                    <mat-option value="inversion">Cuenta de Inversión</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Balance Inicial</mat-label>
                  <input matInput type="number" formControlName="balance" placeholder="0.00">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Moneda</mat-label>
                  <mat-select formControlName="currency">
                    <mat-option value="USD">USD - Dólar Americano</mat-option>
                    <mat-option value="EUR">EUR - Euro</mat-option>
                    <mat-option value="MXN">MXN - Peso Mexicano</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-button type="button" (click)="cancelAdd()">Cancelar</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="accountForm.invalid">
                  Crear Cuenta
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Lista de cuentas -->
        <mat-card class="accounts-list-card">
          <mat-card-header>
            <mat-card-title>Cuentas Registradas</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="table-container">
              <table mat-table [dataSource]="accounts" class="accounts-table">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Nombre</th>
                  <td mat-cell *matCellDef="let account">{{account.name}}</td>
                </ng-container>

                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Tipo</th>
                  <td mat-cell *matCellDef="let account">
                    <span class="account-type">{{getAccountTypeLabel(account.type)}}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="balance">
                  <th mat-header-cell *matHeaderCellDef>Balance</th>
                  <td mat-cell *matCellDef="let account">
                    <span class="balance" [class.negative]="account.balance < 0">
                      {{account.currency}} {{account.balance | number:'1.2-2'}}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let account">
                    <span class="status" [class]="account.status">{{account.status}}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let account">
                    <button mat-icon-button color="primary" (click)="editAccount(account)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deleteAccount(account)">
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
    .accounts-container {
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

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .table-container {
      overflow-x: auto;
    }

    .accounts-table {
      width: 100%;
    }

    .account-type {
      padding: 4px 8px;
      border-radius: 4px;
      background-color: #e3f2fd;
      color: #1976d2;
      font-size: 12px;
      font-weight: 500;
    }

    .balance {
      font-weight: 500;
    }

    .balance.negative {
      color: #f44336;
    }

    .status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .status.activa {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status.inactiva {
      background-color: #ffebee;
      color: #c62828;
    }

    .accounts-list-card {
      flex: 1;
    }
  `]
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [
    {
      id: '1',
      name: 'Cuenta Corriente Principal',
      type: 'corriente',
      balance: 25000.50,
      currency: 'USD',
      status: 'activa',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Cuenta de Ahorros',
      type: 'ahorro',
      balance: 50000.00,
      currency: 'USD',
      status: 'activa',
      createdAt: new Date('2024-02-01')
    },
    {
      id: '3',
      name: 'Línea de Crédito Comercial',
      type: 'credito',
      balance: -15000.00,
      currency: 'USD',
      status: 'activa',
      createdAt: new Date('2024-03-10')
    }
  ];

  displayedColumns: string[] = ['name', 'type', 'balance', 'status', 'actions'];
  showAddForm = false;
  accountForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.accountForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      balance: [0, [Validators.required, Validators.min(0)]],
      currency: ['USD', Validators.required]
    });
  }

  ngOnInit(): void {
    // Inicialización del componente
  }

  openAddDialog(): void {
    this.showAddForm = true;
    this.accountForm.reset({
      name: '',
      type: '',
      balance: 0,
      currency: 'USD'
    });
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.accountForm.reset();
  }

  onSubmit(): void {
    if (this.accountForm.valid) {
      const newAccount: Account = {
        id: (this.accounts.length + 1).toString(),
        ...this.accountForm.value,
        status: 'activa',
        createdAt: new Date()
      };
      
      this.accounts.push(newAccount);
      this.showAddForm = false;
      this.accountForm.reset();
    }
  }

  editAccount(account: Account): void {
    console.log('Editando cuenta:', account);
    // Implementar lógica de edición
  }

  deleteAccount(account: Account): void {
    const index = this.accounts.findIndex(a => a.id === account.id);
    if (index > -1) {
      this.accounts.splice(index, 1);
    }
  }

  getAccountTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      'corriente': 'Cuenta Corriente',
      'ahorro': 'Cuenta de Ahorro',
      'credito': 'Línea de Crédito',
      'inversion': 'Cuenta de Inversión'
    };
    return types[type] || type;
  }
}