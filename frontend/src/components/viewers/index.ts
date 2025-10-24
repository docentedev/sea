// Export all viewers
export { ImageViewer } from './ImageViewer';
export { AudioViewer } from './AudioViewer';
export { VideoViewer } from './VideoViewer';
export { PlainTextViewer } from './PlainTextViewer';
export { JSONViewer } from './JSONViewer';
export { CSVViewer } from './CSVViewer';
export { MarkdownViewer } from './MarkdownViewer';
export { CodeViewer } from './CodeViewer';

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
import { JSONViewer } from './JSONViewer';
import { CSVViewer } from './CSVViewer';
import { MarkdownViewer } from './MarkdownViewer';
import { CodeViewer } from './CodeViewer';

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
  mimeTypes: ['text/plain', 'application/xml', 'text/xml'],
  extensions: ['txt', 'xml', 'log', 'ini', 'cfg', 'conf'],
  component: PlainTextViewer,
  priority: 1 // Lowest priority for generic text files
});

// Register JSON viewer
fileViewerRegistry.register({
  mimeTypes: ['application/json'],
  extensions: ['json'],
  component: JSONViewer,
  priority: 15 // Higher priority for JSON
});

// Register CSV viewer
fileViewerRegistry.register({
  mimeTypes: ['text/csv'],
  extensions: ['csv'],
  component: CSVViewer,
  priority: 15 // Higher priority for CSV
});

// Register Markdown viewer
fileViewerRegistry.register({
  mimeTypes: ['text/markdown'],
  extensions: ['md', 'markdown'],
  component: MarkdownViewer,
  priority: 15 // Higher priority for Markdown
});

// Register code viewer
fileViewerRegistry.register({
  mimeTypes: ['application/javascript', 'application/typescript', 'text/x-python', 'text/x-java-source'],
  extensions: ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'css', 'html', 'htm', 'php', 'rb', 'go', 'rs', 'cpp', 'c', 'h'],
  component: CodeViewer,
  priority: 10 // Medium priority for code files
});

/*
 * How to add a new file viewer:
 *
 * 1. Create a new viewer component that implements FileViewerProps:
 *    interface FileViewerProps {
 *      file: FileInfo;
 *      fileUrl: string;  // URL to access the file content
 *      onClose: () => void;
 *    }
 *
 * 2. Register your viewer with the registry:
 *    fileViewerRegistry.register({
 *      mimeTypes: ['application/pdf'],           // MIME types to match
 *      extensions: ['pdf'],                      // File extensions to match
 *      component: YourViewerComponent,           // Your component
 *      priority: 10                              // Higher priority takes precedence
 *    });
 *
 * 3. The FilePreviewModal will automatically handle file loading and URL creation.
 *    Your viewer component should only focus on displaying the content using the fileUrl.
 *
 * 4. For large files, consider implementing streaming or progressive loading.
 */