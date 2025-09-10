import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserTypesComponent } from './user-types.component';

@Component({
  selector: 'app-user-types-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    UserTypesComponent
  ],
  template: `
    <div class="page-container">
      <!-- Header de la página -->
      <div class="page-header">
        <div class="header-title">
          <mat-icon>category</mat-icon>
          <h1>Tipos de Usuario</h1>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="createUserType()">
            <mat-icon>add</mat-icon> Nuevo Tipo
          </button>
        </div>
      </div>

      <!-- Componente de tipos de usuario -->
      <app-user-types #userTypesComponent></app-user-types>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 16px 24px;
      background-color: #f8fafc;
      width: 100%;
      height: 100vh;
      box-sizing: border-box;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-title h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
      color: #1976d2;
    }

    .header-title mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #1976d2;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    app-user-types {
      flex: 1;
      overflow: hidden;
    }
  `]
})
export class UserTypesPageComponent {
  @ViewChild('userTypesComponent') userTypesComponent!: UserTypesComponent;
  
  createUserType() {
    if (this.userTypesComponent) {
      this.userTypesComponent.createUserType();
    }
  }
}
