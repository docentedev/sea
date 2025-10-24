import React, { useState, useEffect } from 'react';
import type { FileInfo } from '../../types/api';
import { getFileViewer } from './FileViewerRegistry';
import { apiService } from '../../services/api';

interface FilePreviewModalProps {
  file: FileInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  isOpen,
  onClose
}) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !file) {
      setFileUrl(null);
      setError(null);
      return;
    }

    let isMounted = true;

    const loadFile = async () => {
      try {
        setLoading(true);
        setError(null);

        // For video files, use streaming URL instead of downloading blob to avoid loading large files
        const isVideoFile = file.mime_type?.startsWith('video/') ||
                           /\.(mp4|avi|mov|mkv|webm|flv|wmv|mpg|mpeg|3gp|m4v)$/i.test(file.original_filename);

        if (isVideoFile) {
          console.log('🎬 FilePreviewModal: Detected video file, using streaming URL', {
            fileId: file.id,
            mimeType: file.mime_type,
            filename: file.original_filename,
            detectedByMimeType: file.mime_type?.startsWith('video/'),
            detectedByExtension: /\.(mp4|avi|mov|mkv|webm|flv|wmv|mpg|mpeg|3gp|m4v)$/i.test(file.original_filename)
          });
          const token = localStorage.getItem('auth_token');
          const streamUrl = `${apiService.getBaseUrl()}/api/files/${file.id}/download?action=stream&token=${token}`;
          console.log('🎬 FilePreviewModal: Constructed streaming URL:', streamUrl);
          if (isMounted) {
            setFileUrl(streamUrl);
          }
        } else {
          // For other files, download as blob
          console.log('📄 FilePreviewModal: Non-video file, downloading as blob', {
            fileId: file.id,
            mimeType: file.mime_type,
            filename: file.original_filename
          });
          const blob = await apiService.downloadFile(file.id, 'preview');
          if (isMounted) {
            const url = URL.createObjectURL(blob);
            console.log('📄 FilePreviewModal: Created blob URL:', url);
            setFileUrl(url);
          }
        }
      } catch (err) {
        console.error('Error loading file:', err);
        if (isMounted) {
          setError('Failed to load file');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFile();

    return () => {
      isMounted = false;
    };
  }, [file, isOpen]);

  // Cleanup URL when component unmounts or fileUrl changes
  useEffect(() => {
    return () => {
      if (fileUrl && fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  if (!isOpen || !file) return null;

  const ViewerComponent = getFileViewer(file);

  if (!ViewerComponent) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Preview Not Available
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              No preview available for this file type.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Loading {file.original_filename}
            </h3>
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Error Loading File
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {error}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border max-w-4xl w-full shadow-lg rounded-md bg-white max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {file.original_filename}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-auto max-h-[calc(90vh-8rem)]">
          <ViewerComponent file={file} fileUrl={fileUrl!} onClose={onClose} />
        </div>
      </div>
    </div>
  );
};