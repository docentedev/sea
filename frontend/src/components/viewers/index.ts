// Export all viewers
export { ImageViewer } from './ImageViewer';
export { AudioViewer } from './AudioViewer';
export { VideoViewer } from './VideoViewer';
export { PlainTextViewer } from './PlainTextViewer';

// Export registry and utilities
export { fileViewerRegistry, canPreviewFile, getFileViewer } from './FileViewerRegistry';
export type { FileViewerProps, ViewerComponent, ViewerConfig } from './FileViewerRegistry';

// Export modal component
export { FilePreviewModal } from './FilePreviewModal';

// Register all built-in viewers
import { fileViewerRegistry } from './FileViewerRegistry';
import { ImageViewer } from './ImageViewer';
import { AudioViewer } from './AudioViewer';
import { VideoViewer } from './VideoViewer';
import { PlainTextViewer } from './PlainTextViewer';

// Register image viewer
fileViewerRegistry.register({
  mimeTypes: ['image/'],
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
  component: ImageViewer,
  priority: 10
});

// Register audio viewer
fileViewerRegistry.register({
  mimeTypes: ['audio/'],
  extensions: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'],
  component: AudioViewer,
  priority: 10
});

// Register video viewer
fileViewerRegistry.register({
  mimeTypes: ['video/'],
  extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'],
  component: VideoViewer,
  priority: 10
});

// Register plain text viewer
fileViewerRegistry.register({
  mimeTypes: ['text/plain', 'text/markdown', 'text/csv', 'application/json', 'application/xml', 'text/xml'],
  extensions: ['txt', 'md', 'csv', 'json', 'xml', 'log', 'ini', 'cfg', 'conf'],
  component: PlainTextViewer,
  priority: 5 // Lower priority so specific MIME types take precedence
});