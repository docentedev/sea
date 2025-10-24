# NAS Cloud - Single Executable Application

Una aplicación completa de NAS (Network Attached Storage) construida como una Single Executable Application con frontend React 19 y backend Fastify.

## 📖 ¿Qué es Single Executable Applications (SEA)?

Single Executable Applications es una característica experimental de Node.js que permite crear ejecutables standalone que no requieren que Node.js esté instalado en el sistema de destino. El ejecutable contiene:

- El runtime completo de Node.js
- Tu código JavaScript compilado
- Todas las dependencias necesarias
- Base de datos SQLite embebida
- Frontend React compilado

Esto significa que puedes distribuir tu aplicación como un solo archivo ejecutable que funciona en Windows, macOS y Linux sin requerir instalaciones adicionales.

## 🚀 Características

- ✅ **Full-Stack Application**: Frontend React 19 + Backend Fastify
- ✅ **Base de datos SQLite**: Gestión de usuarios y roles para NAS
- ✅ **Sistema de autenticación**: JWT con roles y permisos
- ✅ **Gestión de usuarios**: CRUD completo con autorización de admin
- ✅ **File Browser**: Navegador de archivos con vista de lista y navegación por directorios
- ✅ **File Upload**: Subida de archivos con drag-and-drop y barra de progreso
- ✅ **Folder Management**: Crear y eliminar directorios virtuales
- ✅ **Breadcrumb Navigation**: Navegación intuitiva con iconos y mejor UX
- ✅ **Tailwind CSS**: Framework de estilos moderno y responsivo
- ✅ **Single Executable**: Aplicación standalone (110.24 MB)
- ✅ **Arquitectura limpia**: Servicios, repositorios y controladores
- ✅ **SPA Routing**: React Router con Wouter
- ✅ **API REST**: Endpoints bajo `/api` prefix
- ✅ **Health Monitoring**: Estadísticas del sistema y base de datos
- ✅ **Desarrollo concurrente**: Backend + Frontend simultáneos
- ✅ **TypeScript**: Type safety en todo el stack
- ✅ **Context API**: Manejo de estado en React sin librerías externas

## 📦 Endpoints Disponibles

### API Endpoints
- `GET /api/health` - Estado del sistema y base de datos
- `GET /api/info` - Información del sistema y proceso
- `GET /api/time` - Timestamp actual
- `POST /api/login` - Autenticación de usuario (JWT)
- `POST /api/users` - Crear usuario (requiere admin)
- `GET /api/users` - Listar usuarios con paginación (requiere admin)
- `GET /api/users/:id` - Obtener usuario específico (requiere admin)
- `PUT /api/users/:id` - Actualizar usuario (requiere admin)
- `DELETE /api/users/:id` - Eliminar usuario (requiere admin)

### Frontend Routes
- `GET /` - Página de inicio
- `GET /health` - Dashboard de health del sistema
- `GET /browser` - Navegador de archivos y directorios
- `GET /users` - Gestión de usuarios (requiere admin)

## 🛠️ Instalación y Configuración

### Requisitos

- Node.js 20.x o superior (para desarrollo)
- npm o yarn
- Git

### Instalación

```bash
# Clonar el repositorio
git clone git@github.com:docentedev/sea.git
cd sea

# Instalar dependencias del backend
npm install

# Instalar dependencias del frontend
cd frontend
npm install
cd ..
```

## 🚀 Guía de Inicio Rápido

### 1. Desarrollo
```bash
# Modo desarrollo completo (backend + frontend simultáneos)
npm run dev:full

# Solo backend en desarrollo
npm run dev:backend

# Solo frontend en desarrollo (desde directorio frontend)
cd frontend && npm run dev

# Compilar TypeScript
npm run build

# Ejecutar versión compilada (modo normal)
npm start
```

### 2. Crear Ejecutable Standalone (SEA)
```bash
# Un solo comando para crear el ejecutable
npm run build:sea
```

### 3. Ejecutar el Ejecutable
```bash
# En macOS/Linux
./sea-server

# En Windows
./sea-server.exe

# Con configuración personalizada
PORT=8080 HOST=127.0.0.1 ./sea-server
```

## 🔧 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev:full` | Ejecuta backend y frontend simultáneamente |
| `npm run dev:backend` | Solo backend en modo desarrollo |
| `npm run dev:frontend` | Solo frontend en modo desarrollo |
| `npm run build` | Compila TypeScript |
| `npm run build:sea` | Crea ejecutable standalone |
| `npm start` | Ejecuta versión compilada |
|---------|-------------|
| `npm run dev` | Ejecuta en modo desarrollo con TypeScript |
| `npm run build` | Compila TypeScript a JavaScript |
| `npm start` | Ejecuta la versión compilada (modo normal) |
| `npm run build:sea` | Crea el ejecutable standalone completo |
| `npm run sea:prep` | Genera el blob SEA |
| `npm run sea:inject` | Inyecta el blob en el binario Node.js |

## 🔍 Proceso de Creación SEA

El proceso de creación del Single Executable Application incluye varios pasos automatizados:

### 1. Compilación TypeScript
```bash
npm run build  # tsc
```

### 2. Generación del Blob SEA
```bash
npm run sea:prep  # node --experimental-sea-config sea-config.json
```

### 3. Inyección en el Binario
```bash
npm run sea:inject  # Proceso completo de inyección
```

#### El proceso de inyección incluye:

1. **Copia del binario Node.js**: Se crea una copia del ejecutable de Node.js
2. **Remoción de firma** (macOS/Windows): Se remueve la firma digital del binario
3. **Inyección con Postject**: Se inyecta el blob preparado usando la herramienta `postject`
4. **Firma del binario** (macOS/Windows): Se vuelve a firmar el binario para que sea ejecutable

### Configuración SEA (`sea-config.json`)

```json
{
  "main": "dist/index.js",           // Punto de entrada
  "output": "sea-prep.blob",         // Archivo blob generado
  "disableExperimentalSEAWarning": true,
  "useCodeCache": true,              // Mejora la velocidad de inicio
  "useSnapshot": false,              // Deshabilitado para compatibilidad
  "execArgv": ["--no-warnings"]     // Argumentos de Node.js
}
```

## 📋 Diferencias entre Modo Normal y SEA

| Aspecto | Modo Normal | Modo SEA |
|---------|-------------|----------|
| **Requisitos** | Node.js instalado | Ninguno |
| **Tamaño** | ~1-2MB (código) | ~100MB (runtime incluido) |
| **Startup** | Rápido | Ligeramente más lento |
| **Distribución** | Requiere Node.js | Un solo archivo |
| **Detección** | `isSEA: false` | `isSEA: true` |
| **Portabilidad** | Media | Alta |

## 🧪 Probando la Aplicación

Una vez que el servidor esté ejecutándose (en cualquier modo):

### Interfaz Web
Abre http://localhost:3000 en tu navegador para ver:
- Estado del modo SEA
- Lista de endpoints disponibles
- Ejemplos de uso
- Información del sistema

### API REST con curl

```bash
# Estado del servidor
curl http://localhost:3000/health

# Información detallada del sistema
curl http://localhost:3000/info

# Obtener timestamp actual
curl http://localhost:3000/api/time

# Echo de datos JSON
curl -X POST -H "Content-Type: application/json" \
  -d '{"message":"Hola desde SEA!", "timestamp":"2023-10-23"}' \
  http://localhost:3000/api/echo
```

### Ejemplo de respuesta `/health`:
```json
{
  "status": "healthy",
  "timestamp": "2023-10-23T04:06:22.036Z",
  "uptime": 12.345,
  "isSEA": true,
  "version": "1.0.0"
}
```

## 🔧 Configuración

### Archivo de Configuración Externa

La aplicación lee su configuración desde un archivo `nas-cloud-config.json` ubicado al lado del ejecutable. Si no existe, usa configuración por defecto.

#### Ubicación del Archivo de Configuración

- **Desarrollo**: `./nas-cloud-config.json` (directorio del proyecto)
- **SEA**: `nas-cloud-config.json` (al lado del ejecutable)

#### Estructura del Archivo de Configuración

```json
{
  "server": {
    "port": 3000,
    "host": "0.0.0.0",
    "trustProxy": false,
    "logger": true
  },
  "database": {
    "path": "./data/nas-cloud.db"
  },
  "users": {
    "forceCreateInitial": false,
    "initialUsers": [
      {
        "username": "admin",
        "email": "admin@nas-cloud.local",
        "password": "admin123",
        "role": "admin",
        "storageQuotaGb": 1000,
        "forceUpdate": false
      }
    ]
  },
  "app": {
    "name": "NAS Cloud",
    "version": "2.0.0",
    "description": "Personal Cloud Storage Solution"
  }
}
```

#### Configuración de Usuarios Iniciales

- **`forceCreateInitial`**: Si es `true`, fuerza la creación/actualización de todos los usuarios iniciales
- **`initialUsers`**: Array de usuarios a crear/actualizar al iniciar la aplicación
- **`forceUpdate`**: Si es `true`, actualiza la contraseña del usuario aunque ya exista

##### Recuperación de Contraseña

Para resetear una contraseña olvidada:

1. Edita `nas-cloud-config.json`
2. Cambia `"forceCreateInitial": true`
3. Actualiza la contraseña del usuario deseado
4. Establece `"forceUpdate": true` para ese usuario
5. Reinicia la aplicación
6. La aplicación actualizará la contraseña y mostrará logs de confirmación

#### Variables de Entorno

También puedes usar variables de entorno (tienen prioridad sobre el archivo):

- `PORT` - Puerto del servidor (default: 3000)
- `HOST` - Host del servidor (default: 0.0.0.0)

```bash
PORT=8080 HOST=127.0.0.1 ./sea-server
```

## 📋 Notas Técnicas y Limitaciones

### Single Executable Applications (SEA)

**Ventajas:**
- ✅ No requiere Node.js instalado en el sistema de destino
- ✅ Distribución simple (un solo archivo)
- ✅ Mejor seguridad (código empaquetado)
- ✅ Compatible con Windows, macOS y Linux

**Limitaciones:**
- ⚠️  Tamaño del ejecutable mayor (~100MB vs ~1MB)
- ⚠️  Tiempo de inicio ligeramente mayor
- ⚠️  No soporta `import()` dinámico cuando `useCodeCache` está habilitado
- ⚠️  Requiere Node.js 20.x+ para el desarrollo
- ⚠️  Funcionalidad experimental (puede cambiar)

### Compatibilidad de Plataformas

✅ **Soportado y probado:**
- macOS (Intel x64, Apple Silicon arm64)
- Linux (x64, arm64)
- Windows (x64, x86)

⚠️  **Limitaciones de cross-compilation:**
- No se pueden generar ejecutables para otras plataformas
- Cada plataforma debe compilar su propio ejecutable
- `useCodeCache` y `useSnapshot` deben estar en `false` para cross-platform

## � Deploy y Distribución

### Distribución del Ejecutable

Una vez generado el ejecutable SEA, puedes distribuirlo de varias formas:

```bash
# El ejecutable generado es standalone
./sea-server          # macOS/Linux
./sea-server.exe       # Windows

# No requiere Node.js en el sistema de destino
# Tamaño aproximado: ~100MB (incluye runtime de Node.js)
```

### GitHub Releases

Para crear un release en GitHub con el ejecutable:

```bash
# Crear tag de versión
git tag -a v1.0.0 -m "Primera versión del SEA Server"
git push origin v1.0.0

# El ejecutable se puede subir como asset del release
```

## �📁 Estructura del Proyecto

```
sea-test/
├── 📁 src/
│   └── 📄 index.ts              # Código principal del servidor TypeScript
├── 📁 scripts/
│   ├── 📄 remove-signature.js   # Script para remover firma (macOS/Windows)
│   ├── 📄 postject.js          # Script para inyectar blob con postject
│   └── 📄 sign.js              # Script para firmar binario (macOS/Windows)
├── 📁 dist/                    # TypeScript compilado (generado)
│   └── 📄 index.js             # JavaScript compilado
├── 📄 sea-config.json          # Configuración para SEA
├── 📄 sea-prep.blob            # Blob SEA generado (temporal)
├── 📄 sea-server(.exe)         # Ejecutable final SEA
├── 📄 package.json             # Configuración npm y scripts
├── 📄 tsconfig.json            # Configuración TypeScript
├── 📄 .gitignore              # Archivos ignorados por Git
└── 📄 README.md               # Este archivo
```

## 🔗 Referencias y Documentación

- [Node.js Single Executable Applications](https://nodejs.org/docs/latest-v22.x/api/single-executable-applications.html)
- [Postject - Binary injection tool](https://github.com/nodejs/postject)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Node.js HTTP Module](https://nodejs.org/api/http.html)

## 🤝 Contribuir

1. Fork el proyecto desde [GitHub](https://github.com/docentedev/sea)
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🏷️ Versiones

- **v2.0.0** - Sistema de configuración externa y gestión de usuarios
  - Sistema de configuración externa via `nas-cloud-config.json`
  - Gestión de usuarios iniciales desde archivo de configuración
  - Flags `forceCreateInitial` y `forceUpdate` para recuperación de contraseñas
  - Configuración personalizable de puerto, host y base de datos
  - Arquitectura limpia con servicios, repositorios y modelos
  - Frontend React 19 con dashboard de health monitoring
  - API REST bajo `/api` prefix para evitar conflictos de routing
  - Base de datos SQLite embebida con esquema NAS completo
  - Single Executable Application de 110.21 MB completamente funcional

- **v1.0.0** - Primera versión estable con servidor HTTP y generación SEA
  - Servidor HTTP básico con endpoints de ejemplo
  - Generación automática de Single Executable Application
  - Soporte para Windows, macOS y Linux
  - Detección automática del modo SEA

## 📝 Changelog

### [4.2.0] - 2025-10-24
#### ✨ Added
- **Validación mejorada de archivos**: Sistema de bloqueo de extensiones de archivo junto con validación de tipos MIME
- **Soporte para archivos Guitar Pro**: Tipo MIME `application/x-guitar-pro` para archivos .gp
- **Panel de configuración**: Nuevo componente frontend para gestión de configuraciones del sistema
- **Funcionalidad de mover archivos**: Capacidad de mover archivos entre carpetas virtuales con soporte drag-and-drop
- **Componente MoveFilesModal**: Diálogo modal para seleccionar carpeta destino al mover archivos
- **Hooks de configuración**: Hook `useConfiguration` para gestión de configuraciones del sistema
- **Hooks de movimiento de archivos**: Hook `useFileMove` para operaciones de reubicación de archivos
- **Página de configuración**: Nueva página de administración para gestión de configuración del sistema

#### 🔧 Changed
- **Validación FileService**: Método `isFileTypeAllowed()` mejorado para verificar tanto tipos MIME como extensiones bloqueadas
- **Inicialización de base de datos**: Configuraciones predeterminadas agregadas para `allowed_file_types` y `blocked_file_extensions`
- **Endpoint de subida**: Actualizado `/api/files/upload/config` para retornar información de extensiones bloqueadas
- **Subida de archivos frontend**: Retroalimentación de validación mejorada mostrando extensiones bloqueadas específicas

#### 🛡️ Security
- **Bloqueo de extensiones**: Prevención de subida de archivos ejecutables y scripts (.exe, .bat, .cmd, .py, etc.)
- **Validación mejorada**: Validación de dos capas combinando listas de permisos de tipos MIME con listas de bloqueo de extensiones

#### 🐛 Fixed
- **Validación de tipos de archivo**: Resuelto problema donde archivos .py podían subirse a pesar de la lista de permisos text/*
- **Persistencia de configuración**: Asegurado que las extensiones de archivo bloqueadas se inicialicen correctamente en la base de datos

### [2.1.2] - 2025-10-23
#### ✨ Added
- **Correcciones menores**: Ajustes en la configuración de estilos y dependencias.

### [2.1.1] - 2025-10-23
#### ✨ Added
- **Correcciones en TailwindCSS**: Ajustes en la configuración y estilos de TailwindCSS.
- **Mejoras en la integración de AuthController y UserController**: Optimización de la lógica de autenticación y gestión de usuarios.
- **Actualización de dependencias**: Últimas versiones de dependencias para mejorar estabilidad y rendimiento.
- **Optimización del build**: Proceso de construcción más eficiente y rápido.

#### 🔧 Changed
- **Configuración de TailwindCSS**: Cambios en `tailwind.config.js` para mejorar la generación de estilos.
- **Scripts de construcción**: Actualizados para reflejar cambios en dependencias y configuración.
- **Documentación**: Actualizados ejemplos y guías para configuración y uso.

#### 🐛 Fixed
- **Errores menores**: Corrección de errores y advertencias en la consola.
- **Problemas de rendimiento**: Optimización de consultas y carga de datos.

### [2.1.0] - 2025-10-23
#### ✨ Added
- **Sistema de autenticación JWT**: Endpoint `/api/login` con tokens JWT
- **UserController completo**: CRUD operations para gestión de usuarios
- **Autorización basada en roles**: Middleware de admin para operaciones de usuario
- **AuthService**: Servicio de autenticación con generación y validación de tokens
- **UserService y UserRepository**: Lógica de negocio para gestión de usuarios
- **Roles y permisos**: Sistema de roles (admin, user, guest) con permisos granulares
- **Endpoints de usuario**: 
  - `POST /api/users` - Crear usuario (admin only)
  - `GET /api/users` - Listar usuarios con paginación (admin only)
  - `GET /api/users/:id` - Obtener usuario específico (admin only)
  - `PUT /api/users/:id` - Actualizar usuario (admin only)
  - `DELETE /api/users/:id` - Eliminar usuario (admin only)
- **Middleware de seguridad**: Verificación de autenticación y permisos de admin
- **Validación de datos**: Validación completa de entrada en todos los endpoints
- **Gestión de cuotas**: Cuotas de almacenamiento por rol de usuario

#### 🔧 Changed
- **Configuración de usuarios**: Integración con sistema de configuración externa
- **Base de datos**: Nuevas tablas y relaciones para roles y permisos
- **API Endpoints**: Actualización de lista de endpoints disponibles
- **Tipos TypeScript**: Nuevos tipos para autenticación y gestión de usuarios

#### 🛡️ Security
- **Autenticación JWT**: Implementación segura con expiración de tokens
- **Autorización por roles**: Control de acceso basado en permisos
- **Validación de entrada**: Prevención de datos maliciosos
- **Protección de rutas**: Solo administradores pueden gestionar usuarios

### [2.1.0] - 2025-10-23
#### ✨ Added
- **Tailwind CSS Framework**: Integración completa de Tailwind CSS en el frontend React
- **PostCSS Configuration**: Configuración automática de PostCSS para procesamiento de Tailwind
- **Frontend Styling**: Sistema de estilos moderno y responsivo con Tailwind CSS
- **Build Process**: Actualización del proceso de build para incluir Tailwind CSS
- **SEA Compatibility**: Mantenimiento de funcionalidad completa en Single Executable Application

#### 🔧 Changed
- **Frontend Dependencies**: Nuevas dependencias de desarrollo para Tailwind CSS
- **CSS Architecture**: Migración de estilos personalizados a sistema de utilidades Tailwind
- **Build Output**: Archivos compilados actualizados con estilos de Tailwind
- **Package Version**: Actualización de versión a 2.1.0

#### 🎨 Frontend
- **Modern UI Framework**: Tailwind CSS para desarrollo de interfaces moderno
- **Utility-First CSS**: Sistema de clases utilitarias para desarrollo rápido
- **Responsive Design**: Capacidades de diseño responsivo integradas
- **Customizable Styling**: Fácil personalización y extensión de estilos

### [2.0.0] - 2025-10-23
#### ✨ Added
- **Sistema de configuración externa**: Archivo `nas-cloud-config.json` para configuración completa
- **Gestión de usuarios externa**: Usuarios iniciales definidos en archivo de configuración
- **Flags de recuperación**: `forceCreateInitial` y `forceUpdate` para gestión de usuarios
- **Configuración flexible**: Puerto, host, base de datos y usuarios personalizables
- **Arquitectura limpia**: Servicios, repositorios y modelos separados
- **Frontend React 19**: Dashboard completo de monitoreo de salud
- **API REST organizada**: Endpoints bajo `/api` prefix
- **Base de datos NAS**: Esquema completo con roles y usuarios
- **SPA routing**: React Router con Wouter para navegación cliente
- **Health monitoring**: Estadísticas del sistema y base de datos en tiempo real

#### 🔧 Changed
- **Configuración**: Movida de variables de entorno a archivo JSON externo
- **Usuarios**: Eliminados usuarios hardcodeados, ahora desde configuración
- **API routes**: Movidas de `/health`, `/info` a `/api/health`, `/api/info`
- **Base de datos**: Ruta configurable en lugar de hardcodeada
- **Arquitectura**: Separación clara entre servicios, repositorios y modelos

#### 🐛 Fixed
- **Static files**: Detección correcta de modo SEA vs desarrollo vs bundle
- **SPA routing**: Funcionamiento correcto en modo SEA
- **API conflicts**: Resueltos conflictos entre API y frontend routing

#### 📚 Documentation
- **README completo**: Guía de instalación, configuración y uso
- **Ejemplos de configuración**: Archivo `nas-cloud-config.example.json`
- **Recuperación de contraseñas**: Documentación de flags de fuerza
- **Proceso SEA**: Detalles completos del proceso de creación

### [1.0.0] - 2025-10-22
#### ✨ Added
- **Single Executable Application**: Generación automática de binarios standalone
- **Servidor HTTP básico**: Endpoints de ejemplo con Fastify
- **Detección de modo SEA**: Diferenciación entre desarrollo y producción
- **Soporte multiplataforma**: Windows, macOS y Linux
- **Scripts automatizados**: Proceso completo de inyección y firma

#### 📚 Documentation
- **README inicial**: Documentación básica de instalación y uso