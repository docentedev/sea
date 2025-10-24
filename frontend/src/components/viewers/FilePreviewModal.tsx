import React from 'react';
import type { FileInfo } from '../../types/api';
import { getFileViewer } from './FileViewerRegistry';

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
          <ViewerComponent file={file} onClose={onClose} />
        </div>
      </div>
    </div>
  );
};