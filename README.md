# Frontend ERP - Angular con Material Design

Este es el frontend del sistema ERP desarrollado con Angular 20 y Angular Material.

## Estructura del Proyecto

```
src/
├── app/
│   ├── core/                    # Servicios, modelos, interceptors
│   │   ├── models/              # Interfaces y tipos TypeScript
│   │   │   ├── auth.models.ts
│   │   │   ├── finance.models.ts
│   │   │   ├── inventory.models.ts
│   │   │   ├── purchases.models.ts
│   │   │   ├── sales.models.ts
│   │   │   └── common.models.ts
│   │   └── services/            # Servicios HTTP para cada módulo
│   │       ├── auth.service.ts
│   │       ├── finance.service.ts
│   │       ├── inventory.service.ts
│   │       ├── purchases.service.ts
│   │       └── sales.service.ts
│   ├── shared/                  # Componentes compartidos
│   ├── features/                # Módulos de funcionalidad
│   │   ├── auth/                # Autenticación y usuarios
│   │   │   └── login/
│   │   ├── dashboard/           # Dashboard principal
│   │   ├── finance/             # Gestión financiera
│   │   ├── inventory/           # Gestión de inventario
│   │   │   └── products/        # Gestión de productos
│   │   ├── purchases/           # Gestión de compras
│   │   └── sales/               # Gestión de ventas
│   ├── app.ts                   # Componente principal
│   ├── app.routes.ts            # Configuración de rutas
│   └── app.config.ts            # Configuración de la aplicación
└── environments/                # Configuración de entornos
    ├── environment.ts
    └── environment.prod.ts
```

## Funcionalidades Implementadas

### ✅ Completado
- **Configuración base** con Angular Material y tema
- **Modelos TypeScript** basados en la API Swagger
- **Servicios HTTP** para todos los microservicios
- **Componente de Login** funcional con validaciones
- **Dashboard** con resumen de métricas
- **Gestión de Productos** con CRUD completo
- **Navegación** entre módulos
- **Responsive design** para dispositivos móviles

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
