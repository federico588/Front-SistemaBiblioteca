# Sistema de Gestión de Biblioteca - Frontend

Aplicación web desarrollada con Angular 17 para la gestión de una biblioteca. Interfaz de usuario moderna y responsive para administrar libros, revistas, periódicos, préstamos, multas y usuarios.

## Instalación y Compilación

### Requisitos Previos

- Node.js 18 o superior
- npm (incluido con Node.js)

### Paso 1: Instalar Node.js

Descarga e instala Node.js desde [nodejs.org](https://nodejs.org/). Verifica la instalación:

```bash
node --version
npm --version
```

### Paso 2: Instalar Dependencias

Navega a la carpeta del proyecto e instala las dependencias:

```bash
cd Frontend-Biblioteca
npm install
```

Si hay problemas con las dependencias, intenta:

```bash
npm install --legacy-peer-deps
```

### Paso 3: Configurar Variables de Entorno

Edita `src/environments/environment.ts` para configurar la URL del backend:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  appName: 'Sistema de Gestión de Biblioteca',
  version: '1.0.0'
};
```

Para producción, edita `src/environments/environment.prod.ts`.

### Paso 4: Iniciar Servidor de Desarrollo

Inicia el servidor de desarrollo:

```bash
npm run start:simple
```

O usando la ruta directa del ejecutable:

```bash
.\node_modules\.bin\ng.cmd serve --host 0.0.0.0 --port 4200
```

La aplicación estará disponible en:
- **Aplicación**: http://localhost:4200

### Paso 5: Compilar para Producción

Para compilar la aplicación para producción:

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/frontend-biblioteca`.

## Tecnologías

- **Angular 17** - Framework frontend
- **TypeScript** - Lenguaje de programación
- **RxJS** - Programación reactiva
- **SCSS** - Estilos
- **Angular Animations** - Animaciones

## Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo usando start-dev.js
- `npm run start:simple` - Inicia el servidor de desarrollo directamente
- `npm run build` - Compila la aplicación para producción
- `npm run watch` - Compila en modo watch
- `npm test` - Ejecuta las pruebas unitarias
- `npm run lint` - Ejecuta el linter

## Estructura del Proyecto

```
Frontend-Biblioteca/
├── src/
│   ├── app/
│   │   ├── core/              # Funcionalidades core
│   │   │   ├── guards/        # Guards de autenticación
│   │   │   ├── interceptors/  # Interceptores HTTP
│   │   │   ├── models/        # Modelos de datos
│   │   │   └── services/      # Servicios compartidos
│   │   ├── features/          # Módulos de funcionalidades
│   │   │   ├── auth/          # Autenticación
│   │   │   ├── dashboard/     # Dashboard
│   │   │   ├── usuario/       # Gestión de usuarios
│   │   │   ├── libro/         # Gestión de libros
│   │   │   ├── revista/       # Gestión de revistas
│   │   │   ├── periodico/     # Gestión de periódicos
│   │   │   ├── item/          # Gestión de items
│   │   │   ├── prestamo/      # Gestión de préstamos
│   │   │   ├── multa/         # Gestión de multas
│   │   │   ├── autor/         # Gestión de autores
│   │   │   ├── editorial/     # Gestión de editoriales
│   │   │   └── categoria/     # Gestión de categorías
│   │   └── shared/            # Componentes compartidos
│   │       └── components/
│   │           ├── sidebar/   # Barra lateral
│   │           └── notifications/ # Notificaciones
│   ├── environments/           # Configuración de entornos
│   ├── index.html
│   ├── main.ts                # Punto de entrada
│   └── styles.scss            # Estilos globales
├── angular.json               # Configuración de Angular
├── package.json               # Dependencias
└── tsconfig.json             # Configuración de TypeScript
```

## Características

### Autenticación
- Login con nombre de usuario/email y contraseña
- Gestión de tokens JWT
- Guards para proteger rutas
- Interceptores para agregar tokens a las peticiones

### Notificaciones
- Sistema de notificaciones visual (toast)
- Notificaciones de éxito, error, información y advertencia
- Auto-dismiss configurable

### Gestión de Datos
- CRUD completo para todas las entidades
- Paginación
- Búsqueda y filtrado
- Validación de formularios
- Modales para crear/editar

### Roles y Permisos
- Administrador: acceso completo a todas las funcionalidades
- Consumidor: acceso limitado a préstamos, multas e items

## Componentes Principales

### Core Services
- `ApiService` - Servicio base para peticiones HTTP
- `AuthService` - Gestión de autenticación
- `NotificationService` - Sistema de notificaciones
- Servicios específicos por entidad (LibroService, UsuarioService, etc.)

### Guards
- `AuthGuard` - Protege rutas que requieren autenticación
- `LoginGuard` - Redirige usuarios autenticados desde el login

### Interceptors
- `authInterceptor` - Agrega token JWT a las peticiones
- `errorInterceptor` - Manejo centralizado de errores HTTP

## Estilos

El proyecto utiliza SCSS con variables CSS personalizadas. Los estilos globales están en `src/styles.scss`.

### Variables de Color
- `--primary-color`: #722F37
- `--success-color`: #10b981
- `--warning-color`: #f59e0b
- `--danger-color`: #ef4444
- `--info-color`: #06b6d4

## Desarrollo

### Crear un nuevo componente

```bash
ng generate component features/nombre-modulo/nombre-componente
```

### Crear un nuevo servicio

```bash
ng generate service core/services/nombre-servicio
```

## Solución de Problemas

### Error: "ng no se reconoce como comando"
Usa la ruta directa del ejecutable:
```bash
.\node_modules\.bin\ng.cmd serve --host 0.0.0.0 --port 4200
```

### Error de compilación TypeScript
Verifica que todas las dependencias estén instaladas:
```bash
npm install
```

### Problemas con el backend
Verifica que el backend esté corriendo en `http://localhost:8000` y que la URL en `environment.ts` sea correcta.

## Notas

- El frontend se conecta automáticamente al backend en `http://localhost:8000/api`
- Asegúrate de que el backend esté corriendo antes de iniciar el frontend
- Las notificaciones se muestran en la esquina superior derecha
- El sistema es completamente responsive

## Credenciales de Acceso

- **Usuario**: `admin`
- **Contraseña**: `Admin123!`
