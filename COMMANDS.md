# 🚀 Comandos de Uso - SEA Server

## Instalación Inicial

```bash
# Clonar el repositorio
git clone git@github.com:docentedev/sea.git
cd sea

# Instalar dependencias
npm install
```

## Desarrollo

```bash
# 🔧 Modo desarrollo (con hot reload)
npm run dev

# 🏗️ Compilar TypeScript
npm run build

# ▶️ Ejecutar modo normal (requiere Node.js)
npm start
```

## Crear Ejecutable Standalone (SEA)

```bash
# 🚀 Un comando para todo (recomendado)
npm run build:sea

# 📋 O paso a paso:
npm run build          # Compilar TS → JS
npm run sea:prep        # Generar blob SEA
npm run sea:inject      # Crear ejecutable
```

## Ejecutar Ejecutable

```bash
# 🖥️ macOS/Linux
./sea-server

# 🪟 Windows
./sea-server.exe

# ⚙️ Con configuración personalizada
PORT=8080 HOST=127.0.0.1 ./sea-server
```

## Probar Endpoints

```bash
# 🏥 Health check
curl http://localhost:3000/health

# ℹ️ Información del sistema
curl http://localhost:3000/info

# 🌐 Interfaz web
open http://localhost:3000  # macOS
# o visita http://localhost:3000 en tu navegador
```

## Git Workflow

```bash
# 📥 Clonar y configurar
git clone git@github.com:docentedev/sea.git
cd sea

# 🔀 Crear nueva feature
git checkout -b feature/nueva-funcionalidad

# 💾 Commit cambios
git add .
git commit -m "feat: descripción del cambio"

# 📤 Push y PR
git push origin feature/nueva-funcionalidad
# Crear Pull Request en GitHub
```

## Estructura de Archivos

```
sea/
├── src/index.ts           # 📝 Código principal TypeScript
├── dist/index.js          # 🔄 JavaScript compilado
├── scripts/               # 🛠️ Scripts de build SEA
├── sea-config.json        # ⚙️ Configuración SEA
├── package.json           # 📦 Configuración npm
└── README.md              # 📖 Documentación completa
```

## Solución de Problemas

```bash
# 🧹 Limpiar archivos generados
rm -rf dist/ sea-prep.blob sea-server sea-server.exe

# 🔄 Reinstalar dependencias
rm -rf node_modules/ package-lock.json
npm install

# 🏗️ Rebuild completo
npm run build:sea
```

## Variables de Entorno

```bash
# 🌐 Puerto personalizado
PORT=8080 ./sea-server

# 🔒 Host específico
HOST=127.0.0.1 ./sea-server

# 🔧 Modo debug
NODE_ENV=development ./sea-server
```

---

💡 **Tip**: El ejecutable SEA incluye todo el runtime de Node.js (~100MB) pero no requiere Node.js instalado en el sistema de destino.

🏷️ **Versión actual**: v1.0.0