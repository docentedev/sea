import React from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import { Upload, X } from 'lucide-react';

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
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Upload Files"
      size="lg"
    >
      <div className="space-y-4 m-2">
        {/* Drop zone */}
        <div
          ref={dropZoneRef}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="text-gray-400 mb-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-100 mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-sm text-gray-400">
            Support for multiple files
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => onFileSelect(e.target.files)}
            className="hidden"
          />
          <Button
            type="button"
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-4"
          >
            Browse Files
          </Button>
        </div>

        {/* Selected files */}
        {selectedFiles.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Selected Files:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-100 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => onRemoveFile(index)}
                    className="ml-2 text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                    disabled={uploading}
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress */}
        {uploading && (
          <div>
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400 mt-1">{uploadProgress}% uploaded</p>
          </div>
        )}

        {/* Messages */}
        {uploadError && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {uploadError}
          </div>
        )}

        {uploadSuccess && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {uploadSuccess}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onUpload}
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};