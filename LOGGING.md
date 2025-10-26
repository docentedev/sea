# Sistema de Logging

Este proyecto implementa un sistema de logging robusto y reutilizable que registra eventos tanto localmente como en un servidor de logs dedicado.

## Arquitectura

### LoggingService
Servicio principal que maneja el envío de logs:
- **Singleton pattern** para consistencia
- **Envío dual**: logs locales (consola) + servidor de logs
- **Métodos especializados** para diferentes tipos de eventos

### Utilidades de Logging
Funciones helper en `src/utils/logging.ts`:
- `extractRequestContext()`: Extrae información del contexto HTTP
- `logSuccess()` / `logError()`: Logging consistente para operaciones
- `logUserOperation()`: Logging especializado para operaciones de usuario

## Uso en Rutas

### Importaciones necesarias
```typescript
import { loggingService } from '../../services/index.js';
import { extractRequestContext, logSuccess, logError, logUserOperation } from '../../utils/logging.js';
```

### Patrón de implementación
```typescript
export const myHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const context = extractRequestContext(request);

  try {
    // Log inicio de operación
    await loggingService.info('service', 'Operation started', { ...context });

    // Lógica de negocio...

    // Log éxito
    await logSuccess('service', 'operation name', context, { additionalData });
  } catch (error) {
    // Log error
    await logError('service', 'operation name', error, context, { additionalData });
  }
};
```

## Tipos de Logs

### Niveles disponibles
- `info`: Información general y operaciones exitosas
- `warn`: Advertencias y operaciones fallidas no críticas
- `error`: Errores que requieren atención
- `debug`: Información detallada para debugging

### Servicios registrados
- `users`: Operaciones de gestión de usuarios
- `auth`: Autenticación y autorización
- `files`: Gestión de archivos
- `system`: Eventos del sistema

## Logs de Usuarios Implementados

Se ha implementado logging completo en todas las operaciones CRUD de usuarios:

### Create User (`POST /api/users`)
- Inicio de creación
- Éxito con detalles del usuario creado
- Errores de validación

### List Users (`GET /api/users`)
- Solicitudes de listado con filtros
- Resultados exitosos con estadísticas

### Get User (`GET /api/users/:id`)
- Solicitudes de obtención
- Usuario no encontrado
- Éxito con detalles

### Update User (`PUT /api/users/:id`)
- Solicitudes de actualización
- Usuario no encontrado
- Éxito con cambios realizados

### Delete User (`DELETE /api/users/:id`)
- Solicitudes de eliminación
- Intentos de auto-eliminación
- Usuario no encontrado
- Éxito con detalles del usuario eliminado

## Configuración

El logging se controla mediante `nas-cloud-config.json`:
```json
{
  "server": {
    "loggingEnabled": true,
    "loggingPort": 3001
  }
}
```

## Almacenamiento

Los logs se almacenan en:
- **Local**: Consola del servidor principal
- **Remoto**: Base de datos del servidor de logs (puerto 3001)

## Beneficios

1. **Trazabilidad completa**: Todas las operaciones quedan registradas
2. **Debugging eficiente**: Contexto detallado en cada log
3. **Auditoría**: Historial de cambios en usuarios
4. **Monitoreo**: Detección de patrones y anomalías
5. **Reutilizable**: Patrón consistente aplicable a otros módulos