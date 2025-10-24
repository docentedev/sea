# File Preview System - Streaming Edition

Este sistema proporciona una arquitectura extensible para mostrar vistas previas de diferentes tipos de archivos en el explorador de archivos, con soporte completo para streaming HTTP.

## Arquitectura

### Componentes Principales

- **FileViewerRegistry**: Registro central que mapea tipos de archivos a componentes de vista previa
- **FilePreviewModal**: Modal genérico que muestra la vista previa usando el componente apropiado
- **Viewer Components**: Componentes específicos para cada tipo de archivo

### Estrategias de Carga

#### Blob URLs (Archivos Pequeños)
- **ImageViewer, AudioViewer, PlainTextViewer**: Descargan el archivo completo y crean blob URLs
- **Ventajas**: Control total, funciona offline
- **Desventajas**: No eficiente para archivos grandes

#### Streaming HTTP Real (Videos)
- **VideoViewer**: Usa URL directa con token de autenticación en query parameter
- **Ventajas**: Seek instantáneo, carga progresiva, eficiente para videos grandes
- **Desventajas**: Token expuesto en URL (riesgo de seguridad moderado)
- **Implementación**: Navegador envía automáticamente range requests
- **Implementación futura**: Range requests con streaming nativo

#### Blob URLs con Autenticación (Implementación Actual)
- **VideoViewer**: Descarga completa con headers de autenticación, crea blob URL
- **Ventajas**: Autenticación segura, seek completo, controles nativos
- **Desventajas**: Carga completa requerida, memoria para archivos grandes

## Componentes de Vista Previa Incluidos

### ImageViewer
- **Tipos MIME**: `image/*`
- **Extensiones**: `jpg`, `jpeg`, `png`, `gif`, `bmp`, `webp`, `svg`
- **Estrategia**: Blob URL
- **Funcionalidad**: Muestra imágenes con zoom automático y metadatos

### AudioViewer
- **Tipos MIME**: `audio/*`
- **Extensiones**: `mp3`, `wav`, `ogg`, `aac`, `flac`, `m4a`
- **Estrategia**: Blob URL
- **Funcionalidad**: Reproductor con controles nativos

### VideoViewer
- **Tipos MIME**: `video/*`
- **Extensiones**: `mp4`, `avi`, `mov`, `wmv`, `flv`, `webm`, `mkv`
- **Estrategia**: **Streaming HTTP Real**
- **Funcionalidad**: Reproductor con seek completo, carga progresiva, controles nativos
- **Nota**: Usa URL directa con token en query parameter para autenticación

### PlainTextViewer
- **Tipos MIME**: `text/plain`, `text/markdown`, `text/csv`, `application/json`, `application/xml`
- **Extensiones**: `txt`, `md`, `csv`, `json`, `xml`, `log`, `ini`, `cfg`, `conf`
- **Estrategia**: Blob URL con fetch
- **Funcionalidad**: Vista de texto con sintaxis resaltada

## Streaming HTTP - Implementación Backend

### Endpoint: `/api/files/:id/download`

**Características implementadas:**
- ✅ **Range Requests**: Soporte completo para HTTP 206 Partial Content
- ✅ **Headers apropiados**:
  - `Accept-Ranges: bytes`
  - `Content-Range: bytes start-end/total`
  - `Cache-Control: no-cache`
- ✅ **Streaming nativo**: Usa streams de Node.js para eficiencia

### Cómo sabe el endpoint si es descarga, preview o streaming

El endpoint `/api/files/:id/download` determina el tipo de respuesta basado en **parámetros de query** y **headers HTTP**:

### Parámetros de Query
- `action=download` (por defecto): Descarga con `Content-Disposition: attachment`
- `action=preview`: Visualización inline sin `Content-Disposition`
- `action=stream`: Streaming con soporte para range requests

### Headers HTTP
- **Range header presente**: HTTP 206 Partial Content (streaming)
- **Range header ausente**: Archivo completo

### Matriz de Comportamiento

| Query Parameter | Range Header | Response Type | Content-Disposition |
|----------------|--------------|---------------|-------------------|
| `action=download` | No | 200 OK | `attachment` |
| `action=preview` | No | 200 OK | Ninguno (inline) |
| `action=stream` | No | 200 OK | Ninguno (inline) |
| `action=stream` | Sí | 206 Partial | Ninguno (inline) |
| (ninguno) | No | 200 OK | `attachment` |
| (ninguno) | Sí | 206 Partial | Ninguno (inline) |

### Implementación en Viewers

```typescript
// Para preview (FilePreviewModal, ImageViewer, AudioViewer, PlainTextViewer)
await apiService.downloadFile(file.id, 'preview');

// Para descarga real (FileBrowser download button)
await apiService.downloadFile(file.id, 'download'); // o sin parámetro

// Para video streaming (VideoViewer)
const token = localStorage.getItem('auth_token');
const streamUrl = `${apiService.getBaseUrl()}/api/files/${file.id}/download?action=stream&token=${encodeURIComponent(token)}`;
```

### Autenticación para Streaming

**Backend soporta dos métodos de autenticación:**
1. **Header Authorization**: `Authorization: Bearer <token>` (recomendado)
2. **Query Parameter**: `?token=<token>` (para elementos multimedia que no pueden enviar headers)

**VideoViewer usa query parameter** porque el elemento `<video>` no puede enviar headers de autenticación custom.

### Ventajas de la Implementación

- **Flexibilidad**: Un solo endpoint maneja múltiples casos de uso
- **Backward compatibility**: Requests sin parámetros funcionan como antes
- **Claridad semántica**: `action` parameter deja claro el propósito
- **Optimización**: Preview no incluye `Content-Disposition: attachment`
- **Futuro-ready**: Soporte para streaming nativo cuando se implemente

### Beneficios para videos (Streaming Real):

- **Seek instantáneo**: El usuario puede saltar a cualquier posición del video
- **Carga progresiva**: Inicio inmediato de reproducción sin esperar descarga completa
- **Eficiencia de ancho de banda**: Solo se descargan las partes necesarias
- **Controles nativos**: Todos los controles HTML5 disponibles
- **Experiencia similar a YouTube/Netflix**: Reproducción fluida y responsiva

## Cómo Agregar Nuevos Viewers

### 1. Crear el componente viewer:
```typescript
import React from 'react';
import type { FileViewerProps } from './FileViewerRegistry';
import { apiService } from '../../services/api';

export const MyCustomViewer: React.FC<FileViewerProps> = ({ file, fileUrl, onClose }) => {
  // Para archivos pequeños: usar fileUrl (proporcionado por FilePreviewModal)
  // Para archivos grandes: usar streaming directo
  const streamingUrl = `${apiService.getBaseUrl()}/api/files/${file.id}/download`;

  return (
    <div>
      {/* Implementar la vista previa */}
    </div>
  );
};
```

### 2. Registrar el viewer:
```typescript
fileViewerRegistry.register({
  mimeTypes: ['application/my-custom-type'],
  extensions: ['mycustom'],
  component: MyCustomViewer,
  priority: 10
});
```

### 3. Elegir estrategia de carga:
- **Archivos pequeños** (< 50MB): Usar `fileUrl` del FilePreviewModal
- **Archivos grandes** (> 50MB): Usar streaming directo con URL del endpoint

## API Reference

### FileViewerProps
```typescript
interface FileViewerProps {
  file: FileInfo;        // Información del archivo
  fileUrl: string;       // URL para archivos pequeños (blob)
  onClose: () => void;   // Función para cerrar el modal
}
```

### FileViewerRegistry
```typescript
// Registrar viewer
fileViewerRegistry.register(config: ViewerConfig)

// Obtener viewer para archivo
const ViewerComponent = getFileViewer(file)

// Verificar si se puede previsualizar
const canPreview = canPreviewFile(file)
```

## Consideraciones Técnicas

- **Autenticación**: Todas las requests incluyen tokens de autenticación
- **Permisos**: El backend verifica permisos en cada request
- **Limpieza de memoria**: URLs se liberan automáticamente
- **Manejo de errores**: Estados de error consistentes
- **Extensibilidad**: Nuevo viewers sin modificar código existente

## Próximas Mejoras

- [ ] **Mejorar seguridad del streaming**: Implementar tokens temporales en lugar de tokens permanentes en URL
- [ ] Streaming para archivos de audio grandes
- [ ] Compresión automática de imágenes grandes
- [ ] Soporte para PDFs con streaming
- [ ] Cache inteligente de vistas previas