# 🏢 ERP Frontend - Sistema de Gestión Empresarial

[![Angular](https://img.shields.io/badge/Angular-20.1.0-red.svg)](https://angular.io/)
[![Angular Material](https://img.shields.io/badge/Angular%20Material-20.2.2-blue.svg)](https://material.angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)](https://www.typescriptlang.org/)
[![RxJS](https://img.shields.io/badge/RxJS-7.8.0-purple.svg)](https://rxjs.dev/)

Frontend moderno y responsivo para el sistema ERP (Enterprise Resource Planning) desarrollado con Angular 20 y Angular Material Design. Este sistema proporciona una interfaz de usuario intuitiva y eficiente para la gestión integral de recursos empresariales.

Usuario admin:
User: superadmin@erp.com
Passw:Admin123

## 🚀 Características Principales

- **🎨 Interfaz Moderna**: Diseño Material Design con tema personalizable
- **📱 Responsive**: Optimizado para dispositivos móviles, tablets y desktop
- **🔐 Autenticación Segura**: Sistema de login con JWT y gestión de permisos
- **📊 Dashboard Interactivo**: Métricas en tiempo real y visualización de datos
- **🛠️ CRUD Completo**: Gestión completa de entidades con validaciones
- **🌐 Arquitectura Modular**: Estructura escalable y mantenible
- **⚡ Performance**: Lazy loading y optimizaciones de rendimiento

## 🛠️ Tecnologías Utilizadas

### Frontend Core
- **Angular 20.1.0** - Framework principal
- **Angular Material 20.2.2** - Componentes UI y tema
- **Angular CDK** - Herramientas de desarrollo
- **TypeScript 5.8.2** - Lenguaje de programación
- **RxJS 7.8.0** - Programación reactiva

### Herramientas de Desarrollo
- **Angular CLI 20.1.4** - Herramientas de línea de comandos
- **Karma + Jasmine** - Testing framework
- **Prettier** - Formateo de código
- **Proxy Configuration** - Integración con backend

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18.19.0 o superior)
- **npm** (versión 10.0.0 o superior)
- **Angular CLI** (versión 20.1.4 o superior)

```bash
# Verificar versiones instaladas
node --version
npm --version
ng version
```

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd erp-frontend
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno

Edita los archivos de configuración según tu entorno:

**src/environments/environment.ts** (Desarrollo)
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7271/api'
};
```

**src/environments/environment.prod.ts** (Producción)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api'
};
```

### 4. Configurar Proxy (Opcional)

El archivo `proxy.conf.json` está configurado para desarrollo local:
```json
{
  "/api/*": {
    "target": "https://localhost:7271",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

## 🏃‍♂️ Ejecutar la Aplicación

### Servidor de Desarrollo
```bash
npm start
# o
ng serve --proxy-config proxy.conf.json
```

La aplicación estará disponible en `http://localhost:4200/`

### Construcción para Producción
```bash
npm run build
# o
ng build --configuration production
```

Los archivos compilados se generarán en el directorio `dist/`

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── core/                    # Servicios centrales y modelos
│   │   ├── models/              # Interfaces TypeScript
│   │   │   ├── auth.models.ts   # Modelos de autenticación
│   │   │   ├── common.models.ts # Modelos comunes (API responses)
│   │   │   ├── finance.models.ts
│   │   │   ├── inventory.models.ts
│   │   │   ├── purchases.models.ts
│   │   │   └── sales.models.ts
│   │   ├── services/            # Servicios HTTP
│   │   │   ├── auth.service.ts
│   │   │   ├── permissions.service.ts
│   │   │   ├── finance.service.ts
│   │   │   ├── inventory.service.ts
│   │   │   ├── purchases.service.ts
│   │   │   └── sales.service.ts
│   │   └── interceptors/        # HTTP interceptors
│   ├── shared/                  # Componentes compartidos
│   │   ├── components/          # Componentes reutilizables
│   │   ├── directives/          # Directivas personalizadas
│   │   └── pipes/               # Pipes personalizados
│   ├── features/                # Módulos funcionales
│   │   ├── auth/                # Autenticación y gestión de usuarios
│   │   │   ├── login/           # Componente de login
│   │   │   ├── users/           # Gestión de usuarios
│   │   │   ├── roles/           # Gestión de roles
│   │   │   ├── permissions/     # Gestión de permisos
│   │   │   └── user-types/      # Tipos de usuario
│   │   ├── dashboard/           # Dashboard principal
│   │   ├── finance/             # Módulo financiero
│   │   │   ├── transactions/    # Transacciones
│   │   │   ├── accounts/        # Cuentas contables
│   │   │   └── reports/         # Reportes financieros
│   │   ├── inventory/           # Gestión de inventario
│   │   │   ├── products/        # Gestión de productos
│   │   │   ├── categories/      # Categorías
│   │   │   └── stock/           # Control de stock
│   │   ├── purchases/           # Gestión de compras
│   │   │   ├── orders/          # Órdenes de compra
│   │   │   ├── suppliers/       # Proveedores
│   │   │   └── receipts/        # Recepción de mercancía
│   │   └── sales/               # Gestión de ventas
│   │       ├── orders/          # Órdenes de venta
│   │       ├── customers/       # Clientes
│   │       └── invoices/        # Facturación
│   ├── app.ts                   # Componente raíz
│   ├── app.routes.ts            # Configuración de rutas
│   ├── app.config.ts            # Configuración de la aplicación
│   └── app.html                 # Template principal
├── environments/                # Configuración de entornos
├── assets/                      # Recursos estáticos
└── styles.css                   # Estilos globales
```

## 🎯 Funcionalidades Implementadas

### ✅ Módulo de Autenticación
- [x] **Login seguro** con validación de credenciales
- [x] **Gestión de usuarios** (CRUD completo)
- [x] **Gestión de roles** y permisos
- [x] **Tipos de usuario** personalizables
- [x] **Protección de rutas** basada en permisos

### ✅ Dashboard
- [x] **Métricas en tiempo real** del negocio
- [x] **Gráficos interactivos** de ventas y finanzas
- [x] **Resumen de inventario** y productos
- [x] **Notificaciones** y alertas del sistema

### ✅ Gestión de Inventario
- [x] **Catálogo de productos** con imágenes
- [x] **Categorías** y subcategorías
- [x] **Control de stock** en tiempo real
- [x] **Alertas de stock mínimo**

### ✅ Gestión Financiera
- [x] **Registro de transacciones**
- [x] **Cuentas contables**
- [x] **Reportes financieros**
- [x] **Balance y estado de resultados**

### ✅ Gestión de Ventas
- [x] **Órdenes de venta**
- [x] **Gestión de clientes**
- [x] **Facturación electrónica**
- [x] **Seguimiento de pagos**

### ✅ Gestión de Compras
- [x] **Órdenes de compra**
- [x] **Gestión de proveedores**
- [x] **Recepción de mercancía**
- [x] **Control de pagos a proveedores**

## 🏗️ Arquitectura y Patrones

### Patrones Implementados
- **Component-Service Pattern**: Separación clara entre lógica de presentación y negocio
- **Reactive Programming**: Uso extensivo de RxJS para manejo de estado asíncrono
- **Lazy Loading**: Carga diferida de módulos para optimizar rendimiento
- **Dependency Injection**: Inyección de dependencias nativa de Angular
- **Observer Pattern**: Para comunicación entre componentes

### Arquitectura de Servicios
- **HTTP Interceptors**: Para manejo centralizado de autenticación y errores
- **Guards**: Protección de rutas basada en autenticación y permisos
- **Resolvers**: Pre-carga de datos necesarios para las rutas
- **State Management**: Gestión de estado reactivo con BehaviorSubjects

## 🧪 Testing

### Ejecutar Tests Unitarios
```bash
npm test
# o
ng test
```

### Ejecutar Tests E2E
```bash
npm run e2e
# o
ng e2e
```

### Cobertura de Código
```bash
ng test --code-coverage
```

## 📦 Scripts Disponibles

```bash
npm start          # Servidor de desarrollo con proxy
npm run build      # Construcción para producción
npm test           # Ejecutar tests unitarios
npm run watch      # Construcción en modo watch
npm run lint       # Linting del código
```

## 🔧 Configuración Adicional

### Personalización del Tema
Edita `src/styles.css` para personalizar el tema de Material Design:

```css
@import '@angular/material/theming';

/* Definir paleta de colores personalizada */
$custom-primary: mat-palette($mat-blue);
$custom-accent: mat-palette($mat-pink, A200, A100, A400);
```

### Configuración de Proxy Avanzada
Para configuraciones más complejas, edita `proxy.conf.json`:

```json
{
  "/api/*": {
    "target": "https://localhost:7271",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    "headers": {
      "Access-Control-Allow-Origin": "*"
    }
  }
}
```

## 🚀 Despliegue

### Construcción para Producción
```bash
ng build --configuration production
```

### Variables de Entorno para Producción
Asegúrate de configurar correctamente:
- `apiUrl`: URL del backend en producción
- `production`: true
- Certificados SSL si es necesario

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- 📧 Email: support@erp-system.com
- 📖 Documentación: [Wiki del Proyecto](wiki-url)
- 🐛 Reportar Bugs: [Issues](issues-url)

## 🔗 Enlaces Útiles

- [Documentación de Angular](https://angular.dev/)
- [Angular Material](https://material.angular.io/)
- [RxJS Documentation](https://rxjs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Desarrollado con ❤️ para la gestión empresarial moderna**
