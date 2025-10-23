# SEA Server - Single Executable Application

Una aplicación de servidor HTTP simple construida con TypeScript y Node.js que puede compilarse como una aplicación ejecutable standalone usando las Single Executable Applications (SEA) de Node.js.

## 📖 ¿Qué es Single Executable Applications (SEA)?

Single Executable Applications es una característica experimental de Node.js que permite crear ejecutables standalone que no requieren que Node.js esté instalado en el sistema de destino. El ejecutable contiene:

- El runtime completo de Node.js
- Tu código JavaScript compilado
- Todas las dependencias necesarias

Esto significa que puedes distribuir tu aplicación como un solo archivo ejecutable que funciona en Windows, macOS y Linux sin requerir instalaciones adicionales.

## 🚀 Características

- ✅ Servidor HTTP simple con múltiples endpoints
- ✅ Construido con TypeScript
- ✅ Compatible con Windows, macOS y Linux
- ✅ Se puede ejecutar como aplicación standalone (no requiere Node.js instalado)
- ✅ Detección automática del modo SEA
- ✅ Interfaz web simple para probar la funcionalidad
- ✅ API REST con endpoints de ejemplo

## 📦 Endpoints Disponibles

- `GET /` - Página de inicio con interfaz web
- `GET /health` - Estado del servidor
- `GET /info` - Información del sistema y proceso
- `GET /api/time` - Timestamp actual
- `POST /api/echo` - Echo del contenido enviado

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

# Instalar dependencias
npm install
```

## 🚀 Guía de Inicio Rápido

### 1. Desarrollo
```bash
# Modo desarrollo con recarga automática
npm run dev

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

La aplicación acepta las siguientes variables de entorno:

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

- **v1.0.0** - Primera versión estable con servidor HTTP y generación SEA
  - Servidor HTTP básico con endpoints de ejemplo
  - Generación automática de Single Executable Application
  - Soporte para Windows, macOS y Linux
  - Detección automática del modo SEA