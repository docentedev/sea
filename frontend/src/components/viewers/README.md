# File Preview System

Este sistema proporciona una arquitectura extensible para mostrar vistas previas de diferentes tipos de archivos en el explorador de archivos.

## Arquitectura

### Componentes Principales

- **FileViewerRegistry**: Registro central que mapea tipos de archivos a componentes de vista previa
- **FilePreviewModal**: Modal genérico que muestra la vista previa usando el componente apropiado
- **Viewer Components**: Componentes específicos para cada tipo de archivo

### Componentes de Vista Previa Incluidos

#### ImageViewer
- **Tipos MIME**: `image/*`
- **Extensiones**: `jpg`, `jpeg`, `png`, `gif`, `bmp`, `webp`, `svg`
- **Funcionalidad**: Muestra imágenes con zoom automático y información del archivo

#### AudioViewer
- **Tipos MIME**: `audio/*`
- **Extensiones**: `mp3`, `wav`, `ogg`, `aac`, `flac`, `m4a`
- **Funcionalidad**: Reproductor de audio con controles nativos del navegador

#### VideoViewer
- **Tipos MIME**: `video/*`
- **Extensiones**: `mp4`, `avi`, `mov`, `wmv`, `flv`, `webm`, `mkv`
- **Funcionalidad**: Reproductor de video con controles nativos del navegador

#### PlainTextViewer
- **Tipos MIME**: `text/plain`, `text/markdown`, `text/csv`, `application/json`, `application/xml`
- **Extensiones**: `txt`, `md`, `csv`, `json`, `xml`, `log`, `ini`, `cfg`, `conf`
- **Funcionalidad**: Vista de texto con formato monoespaciado y scroll

## Cómo Agregar Nuevos Viewers

Para agregar soporte para un nuevo tipo de archivo:

1. **Crear el componente viewer**:
```typescript
import React from 'react';
import type { FileViewerProps } from './FileViewerRegistry';

export const MyCustomViewer: React.FC<FileViewerProps> = ({ file, onClose }) => {
  // Implementar la lógica de vista previa
  return (
    <div>
      {/* Contenido de la vista previa */}
    </div>
  );
};
```

2. **Registrar el viewer** en `viewers/index.ts`:
```typescript
import { MyCustomViewer } from './MyCustomViewer';

fileViewerRegistry.register({
  mimeTypes: ['application/my-custom-type'],
  extensions: ['mycustom'],
  component: MyCustomViewer,
  priority: 10 // Mayor prioridad tiene precedencia
});
```

## Uso

El sistema se integra automáticamente en el `FileBrowser`. Cuando un usuario hace clic en un archivo:

1. Se verifica si el archivo puede ser previsualizado usando `canPreviewFile(file)`
2. Si es posible, se abre el modal de vista previa con el componente apropiado
3. Si no es posible, se ejecuta el callback `onFileSelect` (si está definido)

## API

### FileViewerRegistry

```typescript
// Registrar un nuevo viewer
fileViewerRegistry.register(config: ViewerConfig)

// Obtener el componente viewer para un archivo
const ViewerComponent = getFileViewer(file)

// Verificar si un archivo puede ser previsualizado
const canPreview = canPreviewFile(file)
```

### FilePreviewModal Props

```typescript
interface FilePreviewModalProps {
  file: FileInfo | null;
  isOpen: boolean;
  onClose: () => void;
}
```

## Consideraciones Técnicas

- Los viewers descargan el contenido del archivo usando `apiService.downloadFile()`
- Se usa `URL.createObjectURL()` para crear URLs temporales para medios binarios
- Los viewers manejan errores de carga y muestran estados de carga
- La memoria se limpia automáticamente cuando se desmontan los componentes
- El sistema es extensible sin modificar el código existente