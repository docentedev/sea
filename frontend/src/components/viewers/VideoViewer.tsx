import React, { useState, useEffect } from 'react';
import type { FileViewerProps } from './FileViewerRegistry';
import { apiService } from '../../services/api';

export const VideoViewer: React.FC<FileViewerProps> = ({ file, fileUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  useEffect(() => {
    // If fileUrl is provided by FilePreviewModal, use it directly (blob URL)
    // Otherwise, create streaming URL (fallback for direct usage)
    if (fileUrl) {
      console.log('🎬 VideoViewer: Using blob URL from FilePreviewModal');
      setStreamUrl(fileUrl);
      setLoading(false);
    } else {
      console.log('🎬 VideoViewer: No fileUrl provided, using streaming fallback');
      // Create streaming URL with authentication token as query parameter
      const token = localStorage.getItem('auth_token');
      console.log('🎬 VideoViewer: Token from localStorage:', token ? 'present' : 'missing');
      console.log('🎬 VideoViewer: File ID:', file.id, 'MIME type:', file.mime_type);

      const url = `${apiService.getBaseUrl()}/api/files/${file.id}/download?action=stream&token=${encodeURIComponent(token || '')}`;
      console.log('🎬 VideoViewer: Generated URL:', url);
      setStreamUrl(url);
      setLoading(false);
    }
  }, [file.id, file.mime_type, fileUrl]);

  const handleVideoLoadStart = () => {
    setLoading(true);
  };

  const handleVideoCanPlay = () => {
    setLoading(false);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    console.error('🎬 VideoViewer: Video error occurred');
    console.error('🎬 VideoViewer: Error code:', video.error?.code);
    console.error('🎬 VideoViewer: Error message:', video.error?.message);
    console.error('🎬 VideoViewer: Network state:', video.networkState);
    console.error('🎬 VideoViewer: Ready state:', video.readyState);
    console.error('🎬 VideoViewer: Current src:', video.currentSrc);

    let errorMessage = 'Failed to load video file';
    if (video.error) {
      switch (video.error.code) {
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error while loading video';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Video format not supported';
          break;
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = 'Video loading aborted';
          break;
        default:
          errorMessage = `Video error: ${video.error.message}`;
      }
    }

    setLoading(false);
    setError(errorMessage);
  };

  // Use fileUrl if available (from FilePreviewModal), otherwise use streamUrl
  const videoSrc = fileUrl || streamUrl;

  console.log('🎬 VideoViewer: Video source determination', {
    fileUrl: fileUrl,
    streamUrl: streamUrl,
    videoSrc: videoSrc,
    isBlobUrl: videoSrc?.startsWith('blob:'),
    hasTokenInQuery: videoSrc?.includes('token=')
  });

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
      <div className="w-full max-w-4xl">
        {loading && (
          <div className="flex items-center justify-center h-64 mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-sm text-gray-400">Loading video...</p>
          </div>
        )}
        {videoSrc && (
          <>
            <video
              controls
              className="w-full max-h-[60vh] bg-black"
              preload="metadata"
              onLoadStart={handleVideoLoadStart}
              onCanPlay={handleVideoCanPlay}
              onError={handleVideoError}
            >
              <source src={videoSrc} type={file.mime_type || undefined} />
              Your browser does not support the video element.
            </video>
            {/* Debug info */}
            <div className="mt-2 text-xs text-gray-400">
              Debug: URL loaded - {videoSrc.length} chars
            </div>
          </>
        )}
      </div>
      <div className="mt-4 text-sm text-gray-400 text-center">
        <p>{file.original_filename}</p>
        <p>{file.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : ''}</p>
        <p className="text-xs text-gray-400 mt-1">Streaming enabled - seek available</p>
      </div>
    </div>
  );
};