import { useState, useRef, useEffect } from 'react';
import { apiService } from '../services/api';
import type { FileUploadConfig } from '../types/api';

export const useFileUpload = (currentPath: string, onUploadSuccess: () => void) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<string>('');
  const [uploadConfig, setUploadConfig] = useState<FileUploadConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Load upload configuration when modal opens
  useEffect(() => {
    if (showUploadModal && !uploadConfig && !loadingConfig) {
      const loadConfig = async () => {
        setLoadingConfig(true);
        try {
          const config = await apiService.getFileUploadConfig();
          setUploadConfig(config);
        } catch (error) {
          console.error('Failed to load upload config:', error);
          // Continue without config - backend will handle validation
        } finally {
          setLoadingConfig(false);
        }
      };
      loadConfig();
    }
  }, [showUploadModal, uploadConfig, loadingConfig]);

  // Helper function to check if file type is allowed
  const isFileTypeAllowed = (mimeType: string, fileName: string): boolean => {
    if (!uploadConfig) return true; // Allow if config not loaded yet

    // Check MIME type
    const mimeAllowed = uploadConfig.allowedFileTypes.some(allowedType => {
      if (allowedType.includes('*')) {
        // Handle wildcard patterns like "image/*"
        const [mainType] = allowedType.split('/');
        return mimeType.startsWith(`${mainType}/`);
      } else {
        // Exact match
        return mimeType === allowedType;
      }
    });

    if (!mimeAllowed) {
      return false;
    }

    // Check file extension against blocked extensions
    const fileExt = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    if (uploadConfig.blockedFileExtensions.includes(fileExt)) {
      return false;
    }

    return true;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);

    // Validate file types if config is loaded
    if (uploadConfig) {
      const invalidFiles = fileArray.filter(file => !isFileTypeAllowed(file.type, file.name));
      if (invalidFiles.length > 0) {
        const blockedExts = uploadConfig.blockedFileExtensions;
        const errors = invalidFiles.map(file => {
          const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
          if (blockedExts.includes(fileExt)) {
            return `${file.name} (blocked extension: ${fileExt})`;
          } else {
            return `${file.name} (type: ${file.type})`;
          }
        });
        setUploadError(`File(s) not allowed: ${errors.join(', ')}. Allowed types: ${uploadConfig.allowedFileTypes.join(', ')}. Blocked extensions: ${blockedExts.join(', ')}`);
        return;
      }

      // Validate file sizes
      const oversizedFiles = fileArray.filter(file => file.size > uploadConfig.maxFileSize);
      if (oversizedFiles.length > 0) {
        setUploadError(`File(s) too large: ${oversizedFiles.map(f => f.name).join(', ')}. Maximum size: ${Math.round(uploadConfig.maxFileSize / (1024 * 1024))}MB`);
        return;
      }
    }

    setSelectedFiles(prev => [...prev, ...fileArray]);
    setUploadError('');
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('border-blue-500', 'bg-blue-50');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-blue-500', 'bg-blue-50');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-blue-500', 'bg-blue-50');
    }
    handleFileSelect(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadError('Please select at least one file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError('');
    setUploadSuccess('');

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await apiService.uploadFiles(formData, currentPath);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        setUploadSuccess(`${selectedFiles.length} file(s) uploaded successfully`);
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onUploadSuccess();
      } else {
        setUploadError('Failed to upload files');
      }
    } catch (err) {
      const error = err as Error;
      setUploadError(error.message || 'Failed to upload files');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancelUpload = () => {
    setShowUploadModal(false);
    setSelectedFiles([]);
    setUploadError('');
    setUploadSuccess('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openUploadModal = () => setShowUploadModal(true);

  return {
    showUploadModal,
    selectedFiles,
    uploading,
    uploadProgress,
    uploadError,
    uploadSuccess,
    fileInputRef,
    dropZoneRef,
    handleFileSelect,
    removeFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleUpload,
    handleCancelUpload,
    openUploadModal,
    setShowUploadModal
  };
};