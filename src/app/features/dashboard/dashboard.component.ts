import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';

import { Router } from '@angular/router';
import { AuthService, ContentService } from '../../core/services';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatChipsModule,
    MatGridListModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header del Dashboard -->
      <div class="dashboard-header">
        <div class="header-info">
          <h1>Dashboard Ejecutivo</h1>
          <p>{{ getCurrentDateTime() }} | Usuario: {{ (authService.currentUser$ | async)?.name || 'Admin' }}</p>
        </div>
          <mat-chip-set>
            <mat-chip>{{ getDaysToEndOfMonth() }} días restantes del mes</mat-chip>
            <mat-chip color="primary" selected>Q4 2025</mat-chip>
          </mat-chip-set>
        </div>

        <!-- KPIs Principales -->
        <div class="kpi-grid">
          <mat-card class="kpi-card sales">
            <mat-card-content>
              <div class="kpi-header">
                <mat-icon>trending_up</mat-icon>
                <span class="kpi-title">Ventas del Mes</span>
              </div>
              <div class="kpi-value">$2,847,350</div>
              <div class="kpi-change positive">
                <mat-icon>arrow_upward</mat-icon>
                <span>+12.5% vs mes anterior</span>
              </div>
              <mat-progress-bar mode="determinate" value="75" class="kpi-progress"></mat-progress-bar>
            </mat-card-content>
          </mat-card>

          <mat-card class="kpi-card inventory">
            <mat-card-content>
              <div class="kpi-header">
                <mat-icon>inventory</mat-icon>
                <span class="kpi-title">Productos en Stock</span>
              </div>
              <div class="kpi-value">1,234</div>
              <div class="kpi-change neutral">
                <mat-icon>remove</mat-icon>
                <span>45 productos con stock bajo</span>
              </div>
              <mat-progress-bar mode="determinate" value="68" class="kpi-progress warning"></mat-progress-bar>
            </mat-card-content>
          </mat-card>

          <mat-card class="kpi-card orders">
            <mat-card-content>
              <div class="kpi-header">
                <mat-icon>shopping_cart</mat-icon>
                <span class="kpi-title">Órdenes Pendientes</span>
              </div>
              <div class="kpi-value">89</div>
              <div class="kpi-change negative">
                <mat-icon>arrow_downward</mat-icon>
                <span>23 órdenes vencidas</span>
              </div>
              <mat-progress-bar mode="determinate" value="35" class="kpi-progress danger"></mat-progress-bar>
            </mat-card-content>
          </mat-card>

          <mat-card class="kpi-card revenue">
            <mat-card-content>
              <div class="kpi-header">
                <mat-icon>account_balance</mat-icon>
                <span class="kpi-title">Ingresos Netos</span>
              </div>
              <div class="kpi-value">$485,920</div>
              <div class="kpi-change positive">
                <mat-icon>arrow_upward</mat-icon>
                <span>+8.3% margen de ganancia</span>
              </div>
              <mat-progress-bar mode="determinate" value="83" class="kpi-progress success"></mat-progress-bar>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Gráficos y Estadísticas -->
        <div class="charts-section">
          <div class="charts-row">
            <mat-card class="chart-card large">
              <mat-card-header>
                <mat-card-title>Tendencia de Ventas (Últimos 6 meses)</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="chart-placeholder">
                  <mat-icon class="chart-icon">show_chart</mat-icon>
                  <div class="chart-data">
                    <div class="data-point">Mayo: $2.1M</div>
                    <div class="data-point">Junio: $2.3M</div>
                    <div class="data-point">Julio: $2.5M</div>
                    <div class="data-point">Agosto: $2.7M</div>
                    <div class="data-point current">Septiembre: $2.8M</div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="chart-card small">
              <mat-card-header>
                <mat-card-title>Top Productos</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="top-products">
                  <div class="product-item">
                    <span class="product-name">Laptop Dell XPS 13</span>
                    <div class="product-sales">
                      <span class="sales-amount">$156,780</span>
                      <mat-progress-bar value="85" mode="determinate"></mat-progress-bar>
                    </div>
                  </div>
                  <div class="product-item">
                    <span class="product-name">iPhone 15 Pro</span>
                    <div class="product-sales">
                      <span class="sales-amount">$134,520</span>
                      <mat-progress-bar value="72" mode="determinate"></mat-progress-bar>
                    </div>
                  </div>
                  <div class="product-item">
                    <span class="product-name">Samsung Galaxy S24</span>
                    <div class="product-sales">
                      <span class="sales-amount">$98,340</span>
                      <mat-progress-bar value="53" mode="determinate"></mat-progress-bar>
                    </div>
                  </div>
                  <div class="product-item">
                    <span class="product-name">MacBook Pro M3</span>
                    <div class="product-sales">
                      <span class="sales-amount">$87,650</span>
                      <mat-progress-bar value="47" mode="determinate"></mat-progress-bar>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <div class="charts-row">
            <mat-card class="chart-card medium">
              <mat-card-header>
                <mat-card-title>Alertas y Notificaciones</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="alerts-list">
                  <div class="alert-item critical">
                    <mat-icon>error</mat-icon>
                    <div class="alert-content">
                      <div class="alert-title">Stock Crítico</div>
                      <div class="alert-desc">15 productos sin stock disponible</div>
                    </div>
                  </div>
                  <div class="alert-item warning">
                    <mat-icon>warning</mat-icon>
                    <div class="alert-content">
                      <div class="alert-title">Órdenes Vencidas</div>
                      <div class="alert-desc">23 órdenes requieren atención inmediata</div>
                    </div>
                  </div>
                  <div class="alert-item info">
                    <mat-icon>info</mat-icon>
                    <div class="alert-content">
                      <div class="alert-title">Nuevo Proveedor</div>
                      <div class="alert-desc">3 solicitudes de registro pendientes</div>
                    </div>
                  </div>
                  <div class="alert-item success">
                    <mat-icon>check_circle</mat-icon>
                    <div class="alert-content">
                      <div class="alert-title">Meta Alcanzada</div>
                      <div class="alert-desc">Objetivo mensual de ventas cumplido</div>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="chart-card medium">
              <mat-card-header>
                <mat-card-title>Resumen Financiero</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="financial-summary">
                  <div class="financial-item">
                    <div class="financial-label">Ingresos Totales</div>
                    <div class="financial-value positive">$2,847,350</div>
                  </div>
                  <div class="financial-item">
                    <div class="financial-label">Gastos Operativos</div>
                    <div class="financial-value negative">$1,652,480</div>
                  </div>
                  <div class="financial-item">
                    <div class="financial-label">Margen Bruto</div>
                    <div class="financial-value neutral">$1,194,870</div>
                  </div>
                  <div class="financial-item">
                    <div class="financial-label">Ganancia Neta</div>
                    <div class="financial-value positive">$485,920</div>
                  </div>
                  <div class="financial-item total">
                    <div class="financial-label">ROI Mensual</div>
                    <div class="financial-value">17.2%</div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <!-- Accesos Rápidos -->
        <mat-card class="quick-actions-card">
          <mat-card-header>
            <mat-card-title>Acciones Rápidas</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="quick-actions">
              <button mat-raised-button color="primary" class="action-btn">
                <mat-icon>add_shopping_cart</mat-icon>
                Nueva Orden
              </button>
              <button mat-raised-button color="accent" class="action-btn">
                <mat-icon>inventory_2</mat-icon>
                Agregar Producto
              </button>
              <button mat-raised-button class="action-btn">
                <mat-icon>receipt_long</mat-icon>
                Generar Reporte
              </button>
              <button mat-raised-button class="action-btn">
                <mat-icon>people</mat-icon>
                Gestionar Usuarios
              </button>
              <button mat-raised-button class="action-btn">
                <mat-icon>analytics</mat-icon>
                Ver Analytics
              </button>
            </div>
          </mat-card-content>
        </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 16px 24px;
      background-color: #f8fafc;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      overflow-y: auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding: 24px;
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      border-radius: 16px;
      color: white;
      width: 100%;
      box-sizing: border-box;
    }

    .dynamic-content-wrapper {
      width: 100%;
      height: 100%;
    }

    .dynamic-header {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      padding: 16px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .dynamic-header .header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .dynamic-header .page-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .dynamic-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .dynamic-content {
      width: 100%;
    }

    .header-info h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
    }

    .header-info p {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
      width: 100%;
      max-width: none;
    }

    .kpi-card {
      border-radius: 12px;
      transition: transform 0.2s, box-shadow 0.2s;
      border: none;
      overflow: hidden;
    }

    .kpi-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .kpi-card.sales {
      border-top: 4px solid #10b981;
    }

    .kpi-card.inventory {
      border-top: 4px solid #f59e0b;
    }

    .kpi-card.orders {
      border-top: 4px solid #ef4444;
    }

    .kpi-card.revenue {
      border-top: 4px solid #8b5cf6;
    }

    .kpi-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .kpi-header mat-icon {
      color: #6b7280;
      font-size: 24px;
    }

    .kpi-title {
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
    }

    .kpi-value {
      font-size: 32px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 8px;
    }

    .kpi-change {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      margin-bottom: 16px;
    }

    .kpi-change.positive {
      color: #10b981;
    }

    .kpi-change.negative {
      color: #ef4444;
    }

    .kpi-change.neutral {
      color: #f59e0b;
    }

    .kpi-change mat-icon {
      font-size: 18px !important;
    }

    .kpi-progress {
      height: 8px;
      border-radius: 4px;
    }

    .kpi-progress.success .mat-progress-bar-fill::after {
      background: #10b981;
    }

    .kpi-progress.warning .mat-progress-bar-fill::after {
      background: #f59e0b;
    }

    .kpi-progress.danger .mat-progress-bar-fill::after {
      background: #ef4444;
    }

    .charts-section {
      margin-bottom: 32px;
    }

    .charts-row {
      display: grid;
      gap: 20px;
      margin-bottom: 20px;
    }

    .charts-row:first-child {
      grid-template-columns: 2fr 1fr;
    }

    .charts-row:last-child {
      grid-template-columns: 1fr 1fr;
    }

    .chart-card {
      border-radius: 12px;
      border: none;
    }

    .chart-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      border-radius: 8px;
      text-align: center;
    }

    .chart-icon {
      font-size: 48px !important;
      width: 48px !important;
      height: 48px !important;
      color: #6b7280;
      margin-bottom: 16px;
    }

    .chart-data {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      justify-content: center;
    }

    .data-point {
      padding: 8px 16px;
      background: rgba(59, 130, 246, 0.1);
      border-radius: 20px;
      font-size: 14px;
      color: #3b82f6;
      font-weight: 500;
    }

    .data-point.current {
      background: #3b82f6;
      color: white;
    }

    .top-products {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .product-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .product-name {
      font-weight: 500;
      color: #111827;
      font-size: 14px;
    }

    .product-sales {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .sales-amount {
      font-size: 16px;
      font-weight: 600;
      color: #059669;
      min-width: 80px;
    }

    .product-sales mat-progress-bar {
      flex: 1;
      height: 8px;
      border-radius: 4px;
    }

    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .alert-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid;
    }

    .alert-item.critical {
      background: #fef2f2;
      border-left-color: #ef4444;
    }

    .alert-item.warning {
      background: #fffbeb;
      border-left-color: #f59e0b;
    }

    .alert-item.info {
      background: #eff6ff;
      border-left-color: #3b82f6;
    }

    .alert-item.success {
      background: #ecfdf5;
      border-left-color: #10b981;
    }

    .alert-item mat-icon {
      font-size: 20px !important;
      margin-top: 2px;
    }

    .alert-item.critical mat-icon {
      color: #ef4444;
    }

    .alert-item.warning mat-icon {
      color: #f59e0b;
    }

    .alert-item.info mat-icon {
      color: #3b82f6;
    }

    .alert-item.success mat-icon {
      color: #10b981;
    }

    .alert-content {
      flex: 1;
    }

    .alert-title {
      font-weight: 600;
      color: #111827;
      margin-bottom: 4px;
    }

    .alert-desc {
      font-size: 14px;
      color: #6b7280;
    }

    .financial-summary {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .financial-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .financial-item:last-child {
      border-bottom: none;
    }

    .financial-item.total {
      border-top: 2px solid #e5e7eb;
      padding-top: 16px;
      margin-top: 8px;
      font-weight: 600;
    }

    .financial-label {
      font-size: 14px;
      color: #6b7280;
    }

    .financial-value {
      font-size: 16px;
      font-weight: 600;
    }

    .financial-value.positive {
      color: #059669;
    }

    .financial-value.negative {
      color: #dc2626;
    }

    .financial-value.neutral {
      color: #111827;
    }

    .quick-actions-card {
      border-radius: 12px;
      border: none;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .action-btn {
      height: 56px;
      border-radius: 12px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: transform 0.2s;
    }

    .action-btn:hover {
      transform: translateY(-2px);
    }

    .action-btn mat-icon {
      font-size: 20px !important;
    }

    @media (max-width: 1200px) {
      .charts-row:first-child {
        grid-template-columns: 1fr;
      }
      
      .charts-row:last-child {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .dashboard-header {
        flex-direction: column;
        text-align: center;
        gap: 16px;
      }

      .kpi-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {

  constructor(
    private router: Router,
    public authService: AuthService
  ) {
    console.log('DashboardComponent - Inicializado correctamente');
  }

  ngOnInit(): void {
    // Dashboard inicializado correctamente
  }

  getCurrentDateTime(): string {
    return new Date().toLocaleString('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  }

  getDaysToEndOfMonth(): number {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysLeft = lastDay.getDate() - today.getDate();
    return daysLeft;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }


}
