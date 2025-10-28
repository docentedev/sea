import React, { useState, useEffect } from 'react';
import type { FileViewerProps } from './FileViewerRegistry';
import { apiService } from '../../services/api';
import SecureVideoPlayer from './SecureVideoPlayer';

export const VideoViewer: React.FC<FileViewerProps> = ({ file, fileUrl }) => {
  const [loading, setLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  useEffect(() => {
    // If fileUrl is provided by FilePreviewModal, check if it's a blob URL or streaming URL
    if (fileUrl) {
      // Special handling for MOV files - always use streaming endpoint
      const isMovFile = file.original_filename.toLowerCase();
      if (isMovFile) {
        const streamingUrl = `${apiService.getBaseUrl()}/api/files/${file.id}/download?action=stream`;
        setStreamUrl(streamingUrl);
        setLoading(false);
      } else if (fileUrl.startsWith('blob:')) {
        setStreamUrl(fileUrl);
        setLoading(false);
      } else {
        setStreamUrl(fileUrl);
        setLoading(false);
      }
    } else {
      const streamingUrl = `${apiService.getBaseUrl()}/api/files/${file.id}/download?action=stream`;
      setStreamUrl(streamingUrl);
      setLoading(false);
    }
  }, [file.id, file.mime_type, file.original_filename, file.size, fileUrl]);

  // Use fileUrl if available (from FilePreviewModal), otherwise use streamUrl
  const videoSrc = streamUrl;

  return (
    <div className="flex flex-col items-center justify-center min-h-0">
      <div className="w-full max-w-none px-4">
        {loading && (
          <div className="flex items-center justify-center h-64 mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-sm text-gray-400">Loading video...</p>
          </div>
        )}
        {videoSrc && (
          <>
            <SecureVideoPlayer videoUrl={videoSrc} token={localStorage.getItem('auth_token') || ''} />
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