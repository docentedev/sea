# NAS Cloud - Documentación Unificada

## Descripción General
NAS Cloud es una solución de almacenamiento personal tipo NAS, con backend Node.js/Fastify, frontend React 19, base de datos SQLite embebida y arquitectura Single Executable Application (SEA). Permite gestión granular de usuarios, roles, permisos, archivos, carpetas y configuraciones, con enfoque en seguridad, modularidad y portabilidad.

---

## Features Implementados

### Backend
- **Roles y permisos granulares**: Relación N:M, gestión desde servicios y repositorios, tabla intermedia `role_permissions`.
- **Gestión de usuarios**: CRUD completo, roles, cuotas, activación/desactivación, recuperación vía config.
- **Autenticación JWT**: Middleware robusto, protección de rutas, recuperación de contraseñas.
- **Configuración flexible**: `nas-cloud-config.json` con usuarios iniciales, flags de recuperación, rutas, cuotas, tipos/extensiones permitidas/bloqueadas.
- **Logging persistente**: Servicio y repositorio de logs, filtrado y auditoría.
- **Gestión de archivos y carpetas**: CRUD, triggers de timestamps, validación de tipos/extensiones, carpetas virtuales.
- **Health endpoints**: `/api/health`, `/api/info` con métricas y estado.
- **Migración y seeding robusto**: Inicialización automática de estructura y datos, sin migraciones destructivas.
- **Backup/exportación de datos**: Scripts y comandos para exportar y restaurar datos clave.

### Frontend
- **SPA con React 19 y Tailwind**: Navegador de archivos, paneles de administración, vistas responsivas.
- **UI modular**: Componentes reutilizables, modal de roles, selección de permisos, UX moderna.
- **Gestión visual de roles y permisos**: Listado, edición, creación, selección granular de permisos.
- **Panel de configuración**: Gestión visual de configuraciones y cuotas.
- **Vista de logs y auditoría**: Backend listo, falta UI dedicada.

---

## Roadmap y Features Pendientes
- **Compartición de archivos/carpetas**: Enlaces públicos temporales, permisos granulares, expiración y revocación.
- **Búsqueda y filtros avanzados**: Full-text search, filtros por tipo/tamaño/fecha, indexación automática.
- **Vista previa multimedia**: Thumbnails, reproducción integrada, previews de PDF/Office.
- **Cuotas avanzadas**: Dashboard, alertas automáticas, bloqueo de uploads.
- **Notificaciones**: Email, webhook, push, integración con Slack/Discord.
- **API REST completa**: Documentación Swagger, rate limiting, OAuth2, logs de auditoría, webhooks.
- **Backups automáticos**: Programados, incrementales, encriptados, restauración granular.
- **Versionado de archivos**: Historial, restauración point-in-time, retención configurable.
- **Sincronización multi-dispositivo**: Clientes desktop/mobile, bidireccional, resolución de conflictos.
- **Optimización y compresión**: Compresión automática, optimización de imágenes, limpieza de temporales.

---

## Endpoints y Comandos Clave

### API REST
- `GET /api/health` - Estado del sistema y base de datos
- `GET /api/info` - Información del sistema y proceso
- `POST /api/login` - Autenticación de usuario (JWT)
- `POST /api/users` - Crear usuario (admin)
- `GET /api/users` - Listar usuarios (admin)
- `GET /api/users/:id` - Obtener usuario específico (admin)
- `PUT /api/users/:id` - Actualizar usuario (admin)
- `DELETE /api/users/:id` - Eliminar usuario (admin)
- ... (endpoints para roles, permisos, archivos, carpetas, configuraciones)

### Comandos de uso
- `npm run dev:full` - Backend y frontend simultáneos
- `npm run build` - Compila TypeScript
- `npm run build:sea` - Crea ejecutable standalone
- `npm start` - Ejecuta versión compilada
- Scripts de backup/exportación/restauración en `scripts/`

---

## Configuración y Recuperación
- Configuración en `nas-cloud-config.json` (usuarios iniciales, flags de recuperación, rutas, cuotas, tipos/extensiones).
- Recuperación de contraseñas: Edita config, activa flags, reinicia y se actualiza el usuario.
- Variables de entorno: `PORT`, `HOST`, `NODE_ENV`.

---

## Estructura del Proyecto
```
sea-test/
├── src/                # Backend TypeScript
├── frontend/           # Frontend React
├── scripts/            # Scripts de build y backup
├── data/               # Base de datos y backups
├── dist/               # JS compilado
├── sea-config.json     # Configuración SEA
├── nas-cloud-config.json # Configuración principal
├── README.md           # Documentación
├── ROADMAP.md          # Roadmap técnico
├── CHANGELOG.md        # Cambios y fixes
├── COMMANDS.md         # Comandos y tips
└── ...
```

---

## Changelog Resumido
- **v4.5.0**: Dark mode, componentes reutilizables, fixes de markdown y UI, migración robusta, backup/exportación.
- **v4.4.0**: Mejoras en visores, migración y configuración.
- **v4.3.0**: Modos de vista de archivos, cuadrícula y lista.
- **v4.2.0**: Validación avanzada de archivos, panel de configuración, mover archivos.
- **v2.1.0**: Autenticación JWT, roles y permisos, configuración externa.
- **v2.0.0**: SPA React, health monitoring, base de datos NAS, SEA.
- **v1.0.0**: Primer release estable, generación SEA, endpoints básicos.

---

## Próximos Pasos Recomendados
1. Integrar UI completa para gestión de permisos por rol.
2. Implementar dashboard de cuotas y alertas.
3. Añadir vista de logs y auditoría en frontend.
4. Comenzar con sistema de compartición de archivos.
5. Documentar y automatizar backup/exportación/restauración.

---

## Contribuir y Contacto
- Fork en GitHub: https://github.com/docentedev/sea
- Licencia MIT
- Contacto y soporte: issues en GitHub

---

> Esta documentación unifica y resume todo el estado técnico, funcional y de desarrollo del proyecto NAS Cloud. Para detalles específicos, consulta los archivos individuales o el código fuente.
