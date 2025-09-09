import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { UsersComponent } from './users/users.component';
import { RolesComponent } from './roles/roles.component';

@Component({
  selector: 'app-auth-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    UsersComponent,
    RolesComponent
  ],
  template: `
    <div class="auth-management-container">
      <mat-tab-group>
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>people</mat-icon>
            <span>Usuarios</span>
          </ng-template>
          <app-users></app-users>
        </mat-tab>
        
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>admin_panel_settings</mat-icon>
            <span>Roles</span>
          </ng-template>
          <app-roles></app-roles>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .auth-management-container {
      height: 100%;
      padding: 20px;
    }

    ::ng-deep .mat-mdc-tab-group {
      height: 100%;
    }

    ::ng-deep .mat-mdc-tab-body-wrapper {
      flex-grow: 1;
      height: calc(100% - 48px);
    }

    ::ng-deep .mat-mdc-tab-body-content {
      height: 100%;
      overflow: auto;
      padding: 20px 0;
    }

    ::ng-deep .mat-mdc-tab-label {
      gap: 8px;
    }
  `]
})
export class AuthManagementComponent {
}
