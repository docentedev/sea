import React, { useState, useEffect, useRef } from 'react';
import type { FileViewerProps } from './FileViewerRegistry';
import { apiService } from '../../services/api';

export const AudioViewer: React.FC<FileViewerProps> = ({ file }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAudio = async () => {
      try {
        setLoading(true);
        setError(null);
        const blob = await apiService.downloadFile(file.id);
        if (isMounted) {
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        }
      } catch (err) {
        console.error('Error loading audio:', err);
        if (isMounted) {
          setError('Failed to load audio file');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAudio();

    return () => {
      isMounted = false;
    };
  }, [file.id]);

  // Cleanup URL when component unmounts or audioUrl changes
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-full max-w-md">
        <audio
          ref={audioRef}
          controls
          className="w-full"
          preload="metadata"
        >
          <source src={audioUrl!} type={file.mime_type || undefined} />
          Your browser does not support the audio element.
        </audio>
      </div>
      <div className="text-sm text-gray-500 text-center">
        <p>{file.original_filename}</p>
        <p>{file.size ? `${(file.size / 1024).toFixed(2)} KB` : ''}</p>
      </div>
    </div>
  );
};