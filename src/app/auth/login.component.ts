import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../core/services/auth.service';
import { ContentService } from '../core/services/content.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>business</mat-icon>
            Sistema ERP
          </mat-card-title>
          <mat-card-subtitle>Iniciar Sesión</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form (ngSubmit)="onLogin()" #loginForm="ngForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input 
                matInput 
                type="email" 
                [(ngModel)]="email"
                name="email"
                required
                placeholder="admin@erp.com">
              <mat-icon matSuffix>email</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input 
                matInput 
                [type]="hidePassword ? 'password' : 'text'"
                [(ngModel)]="password"
                name="password" 
                required
                placeholder="admin123">
              <button 
                mat-icon-button 
                matSuffix 
                type="button"
                (click)="hidePassword = !hidePassword">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
            </mat-form-field>

            <button 
              mat-raised-button 
              color="primary" 
              type="submit"
              class="full-width login-btn"
              [disabled]="!loginForm.form.valid || loading">
              <mat-icon>login</mat-icon>
              {{ loading ? 'Iniciando...' : 'Iniciar Sesión' }}
            </button>
          </form>

          <div class="demo-info">
            <p><strong>Credenciales de prueba:</strong></p>
            <button mat-button (click)="fillDemo()">admin@erp.com / admin123</button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 20px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .login-btn {
      height: 48px;
      font-size: 16px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .demo-info {
      margin-top: 16px;
      text-align: center;
      font-size: 14px;
    }

    .demo-info button {
      font-size: 12px;
      color: #1976d2;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private contentService = inject(ContentService);

  email = '';
  password = '';
  hidePassword = true;
  loading = false;

  fillDemo() {
    this.email = 'admin@erp.com';
    this.password = 'admin123';
  }

  onLogin() {
    if (!this.email || !this.password) return;

    this.loading = true;
    
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.contentService.clearContent();
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        alert('Error: ' + (error?.error?.message || 'Credenciales inválidas'));
      }
    });
  }
}
