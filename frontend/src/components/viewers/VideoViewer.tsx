import React, { useState, useEffect, useRef } from 'react';
import type { FileViewerProps } from './FileViewerRegistry';
import { apiService } from '../../services/api';

export const VideoViewer: React.FC<FileViewerProps> = ({ file }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let isMounted = true;

    const loadVideo = async () => {
      try {
        setLoading(true);
        setError(null);
        const blob = await apiService.downloadFile(file.id);
        if (isMounted) {
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);
        }
      } catch (err) {
        console.error('Error loading video:', err);
        if (isMounted) {
          setError('Failed to load video file');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadVideo();

    return () => {
      isMounted = false;
    };
  }, [file.id]);

  // Cleanup URL when component unmounts or videoUrl changes
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
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
    <div className="flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <video
          ref={videoRef}
          controls
          className="w-full max-h-[60vh] bg-black"
          preload="metadata"
        >
          <source src={videoUrl!} type={file.mime_type || undefined} />
          Your browser does not support the video element.
        </video>
      </div>
      <div className="mt-4 text-sm text-gray-500 text-center">
        <p>{file.original_filename}</p>
        <p>{file.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : ''}</p>
      </div>
    </div>
  );
};