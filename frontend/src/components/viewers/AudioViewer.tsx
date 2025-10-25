import React, { useState, useRef } from 'react';
import type { FileViewerProps } from './FileViewerRegistry';

export const AudioViewer: React.FC<FileViewerProps> = ({ file, fileUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleAudioLoad = () => {
    setLoading(false);
  };

  const handleAudioError = () => {
    setLoading(false);
    setError('Failed to load audio file');
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
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
    <div className="flex flex-col items-center space-y-4">
      <div className="w-full max-w-md">
        {loading && (
          <div className="flex items-center justify-center h-16 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
        <audio
          ref={audioRef}
          controls
          className="w-full"
          preload="metadata"
          onLoadedData={handleAudioLoad}
          onError={handleAudioError}
        >
          <source src={fileUrl} type={file.mime_type || undefined} />
          Your browser does not support the audio element.
        </audio>
      </div>
      <div className="text-sm text-gray-400 text-center">
        <p>{file.original_filename}</p>
        <p>{file.size ? `${(file.size / 1024).toFixed(2)} KB` : ''}</p>
      </div>
    </div>
  );
};