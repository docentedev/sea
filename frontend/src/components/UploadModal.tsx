import React from 'react';

interface UploadModalProps {
  isOpen: boolean;
  selectedFiles: File[];
  uploading: boolean;
  uploadProgress: number;
  uploadError: string;
  uploadSuccess: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  dropZoneRef: React.RefObject<HTMLDivElement | null>;
  onFileSelect: (files: FileList | null) => void;
  onRemoveFile: (index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onUpload: () => void;
  onCancel: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  selectedFiles,
  uploading,
  uploadProgress,
  uploadError,
  uploadSuccess,
  fileInputRef,
  dropZoneRef,
  onFileSelect,
  onRemoveFile,
  onDragOver,
  onDragLeave,
  onDrop,
  onUpload,
  onCancel
}) => {
  if (!isOpen) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Upload Files</h3>

        {/* Drop zone */}
        <div
          ref={dropZoneRef}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 text-center hover:border-blue-400 transition-colors"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="text-gray-600 mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-sm text-gray-500">
            Support for multiple files
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => onFileSelect(e.target.files)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={uploading}
          >
            Browse Files
          </button>
        </div>

        {/* Selected files */}
        {selectedFiles.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Selected Files:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => onRemoveFile(index)}
                    className="ml-2 text-red-600 hover:text-red-800"
                    disabled={uploading}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress */}
        {uploading && (
          <div className="mb-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{uploadProgress}% uploaded</p>
          </div>
        )}

        {/* Messages */}
        {uploadError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {uploadError}
          </div>
        )}

        {uploadSuccess && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {uploadSuccess}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={onUpload}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};