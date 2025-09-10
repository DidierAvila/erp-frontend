import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PermissionsComponent } from './permissions.component';

@Component({
  selector: 'app-permissions-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    PermissionsComponent
  ],
  template: `
    <div class="page-container">
      <!-- Header de la página -->
      <div class="page-header">
        <div class="header-title">
          <mat-icon>security</mat-icon>
          <h1>Gestión de Permisos</h1>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="createPermission()">
            <mat-icon>add</mat-icon> Nuevo Permiso
          </button>
        </div>
      </div>

      <!-- Componente de permisos -->
      <app-permissions #permissionsComponent></app-permissions>
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
  `]
})
export class PermissionsPageComponent {
  @ViewChild('permissionsComponent') permissionsComponent!: PermissionsComponent;
  
  createPermission() {
    this.permissionsComponent.createPermission();
  }
}
