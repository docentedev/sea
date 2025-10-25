import React, { useState } from 'react';
import type { FileViewerProps } from './FileViewerRegistry';

export const ImageViewer: React.FC<FileViewerProps> = ({ file, fileUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError('Failed to load image');
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="mt-2 text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="max-w-full max-h-[70vh] overflow-auto">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
        <img
          src={fileUrl}
          alt={file.original_filename}
          className="max-w-full max-h-full object-contain"
          style={{ maxWidth: '100%', maxHeight: '70vh', display: loading ? 'none' : 'block' }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
      <div className="mt-4 text-sm text-gray-400 text-center">
        <p>{file.original_filename}</p>
        <p>{file.size ? `${(file.size / 1024).toFixed(2)} KB` : ''}</p>
      </div>
    </div>
  );
};