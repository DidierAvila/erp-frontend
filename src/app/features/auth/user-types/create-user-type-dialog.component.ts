import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

interface UserType {
  id?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-create-user-type-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>Crear Nuevo Tipo de Usuario</h2>
    <mat-dialog-content>
      <form [formGroup]="userTypeForm" class="user-type-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="name" placeholder="Ej: Administrador">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="description" 
                   placeholder="Descripción del tipo de usuario" rows="3"></textarea>
        </mat-form-field>

        <mat-checkbox formControlName="isActive" class="active-checkbox">
          Tipo de usuario activo
        </mat-checkbox>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" 
              [disabled]="!userTypeForm.valid"
              (click)="onSave()">
        Crear Tipo de Usuario
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .user-type-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
    }

    .full-width {
      width: 100%;
    }

    .active-checkbox {
      margin-top: 8px;
    }

    mat-dialog-content {
      padding: 20px 0;
    }
  `]
})
export class CreateUserTypeDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateUserTypeDialogComponent>);

  userTypeForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    isActive: [true]
  });

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.userTypeForm.valid) {
      this.dialogRef.close(this.userTypeForm.value);
    }
  }
}
