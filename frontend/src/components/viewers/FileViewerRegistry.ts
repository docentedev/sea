import React from 'react';
import type { FileInfo } from '../../types/api';

// Base interface for all viewers
export interface FileViewerProps {
  file: FileInfo;
  fileUrl: string;
  onClose: () => void;
}

// Viewer component type
export type ViewerComponent = React.ComponentType<FileViewerProps>;

// File type to viewer mapping
export interface ViewerConfig {
  mimeTypes: string[];
  extensions: string[];
  component: ViewerComponent;
  priority: number; // Higher priority takes precedence
}

// Registry for file viewers
class FileViewerRegistry {
  private viewers: ViewerConfig[] = [];

  register(config: ViewerConfig) {
    this.viewers.push(config);
    // Sort by priority (higher first)
    this.viewers.sort((a, b) => b.priority - a.priority);
  }

  getViewer(file: FileInfo): ViewerComponent | null {
    for (const viewer of this.viewers) {
      // Check MIME type
      if (viewer.mimeTypes.some(mime => file.mime_type?.startsWith(mime))) {
        return viewer.component;
      }

      // Check file extension
      const extension = file.original_filename.split('.').pop()?.toLowerCase();
      if (extension && viewer.extensions.includes(extension)) {
        return viewer.component;
      }
    }
    return null;
  }

  getAllViewers(): ViewerConfig[] {
    return [...this.viewers];
  }
}

// Global registry instance
export const fileViewerRegistry = new FileViewerRegistry();

// Helper function to determine if a file can be previewed
export const canPreviewFile = (file: FileInfo): boolean => {
  return fileViewerRegistry.getViewer(file) !== null;
};

// Helper function to get the appropriate viewer for a file
export const getFileViewer = (file: FileInfo): ViewerComponent | null => {
  return fileViewerRegistry.getViewer(file);
};