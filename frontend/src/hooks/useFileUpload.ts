import { useState, useRef } from 'react';
import { apiService } from '../services/api';

export const useFileUpload = (currentPath: string, onUploadSuccess: () => void) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
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