import { Component, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../core/services/auth.service';
import { ContentService } from '../core/services/content.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
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
                placeholder="usuario@empresa.com">
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
                placeholder="Ingrese su contraseña">
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
            <p><small>Ingrese sus credenciales para acceder al sistema</small></p>
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

    :host ::ng-deep .error-snackbar {
      background-color: #f44336;
      color: white;
    }
    

  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private contentService = inject(ContentService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  hidePassword = true;
  loading = false;





  onLogin() {
    if (!this.email || !this.password) {
      this.snackBar.open('Por favor complete todos los campos', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    this.loading = true;
    this.cdr.detectChanges(); // Forzar detección de cambios inmediatamente
    
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {

        
        this.snackBar.open('¡Bienvenido al sistema!', 'Cerrar', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        
        // Diferir todos los cambios para evitar problemas de detección
        setTimeout(() => {
          this.loading = false;
          this.cdr.detectChanges();
          this.contentService.clearContent();
          // Usar replace para evitar que el usuario vuelva al login con el botón atrás
          this.router.navigate(['/dashboard'], { replaceUrl: true });
        }, 200);
      },
      error: (error) => {
        setTimeout(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }, 100);

        
        let errorMessage = 'Error de conexión';
        
        if (error.status === 400) {
          errorMessage = 'Credenciales inválidas';
        } else if (error.status === 401) {
          errorMessage = 'Email o contraseña incorrectos';
        } else if (error.status === 404) {
          errorMessage = 'Usuario no encontrado';
        } else if (error.status === 0) {
          errorMessage = 'No se puede conectar al servidor';
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }


}
