import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import type { Folder, FileInfo, FolderContent } from '../types/api';

interface FileBrowserProps {
  onFileSelect?: (file: FileInfo) => void;
  onFolderSelect?: (folder: Folder) => void;
  allowSelection?: boolean;
}

export const FileBrowser: React.FC<FileBrowserProps> = ({
  onFileSelect,
  onFolderSelect,
  allowSelection = false
}) => {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [folderContent, setFolderContent] = useState<FolderContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  useEffect(() => {
    loadFolderContent(currentPath);
  }, [currentPath]);

  // Initialize path from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pathParam = urlParams.get('path');
    if (pathParam) {
      setCurrentPath(decodeURIComponent(pathParam));
    }
  }, []);

  // Update URL when path changes
  useEffect(() => {
    const url = new URL(window.location.href);
    if (currentPath === '/') {
      url.searchParams.delete('path');
    } else {
      url.searchParams.set('path', encodeURIComponent(currentPath));
    }
    window.history.replaceState({}, '', url.toString());
  }, [currentPath]);

  const loadFolderContent = async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getFolderContents(path);
      if (response.success) {
        setFolderContent(response.data);
      } else {
        setError('Failed to load folder content');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to load folder content');
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder: Folder) => {
    if (onFolderSelect) {
      onFolderSelect(folder);
    }
    if (!allowSelection) {
      setCurrentPath(folder.path);
    }
  };

  const handleFileClick = (file: FileInfo) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleItemSelect = (itemId: string) => {
    if (!allowSelection) return;

    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const navigateToParent = () => {
    if (currentPath !== '/' && folderContent && folderContent.parent_path !== null) {
      setCurrentPath(folderContent.parent_path);
    } else {
      setCurrentPath('/');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getBreadcrumbs = (): string[] => {
    if (currentPath === '/') return ['/'];
    return ['/', ...currentPath.split('/').filter(p => p.length > 0)];
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }

    setCreatingFolder(true);
    setError(null);

    try {
      const folderPath = currentPath === '/' ? `/${newFolderName}` : `${currentPath}/${newFolderName}`;
      await apiService.createFolder(newFolderName, folderPath, currentPath === '/' ? undefined : currentPath);
      
      // Reload folder content
      await loadFolderContent(currentPath);
      
      setShowCreateFolderModal(false);
      setNewFolderName('');
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to create folder');
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleCancelCreateFolder = () => {
    setShowCreateFolderModal(false);
    setNewFolderName('');
    setError(null);
  };

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
        // Reload folder content to show new files
        await loadFolderContent(currentPath);
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

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      setCurrentPath('/');
    } else {
      const breadcrumbs = getBreadcrumbs();
      const path = '/' + breadcrumbs.slice(1, index + 1).join('/');
      setCurrentPath(path);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Breadcrumbs */}
      <div className="px-4 py-3 border-b border-gray-200">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {getBreadcrumbs().map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <svg className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 00-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className={`text-sm font-medium ${
                    index === getBreadcrumbs().length - 1
                      ? 'text-gray-900'
                      : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  {crumb}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {currentPath !== '/' && (
              <button
                onClick={navigateToParent}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Up
              </button>
            )}
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Folder
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Files
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {folderContent && `${folderContent.folders.length} folders, ${folderContent.files.length} files`}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-hidden">
        {folderContent && (folderContent.folders.length > 0 || folderContent.files.length > 0) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 p-4">
            {/* Folders */}
            {folderContent.folders.map((folder) => (
              <div
                key={`folder-${folder.id}`}
                className={`p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedItems.has(`folder-${folder.id}`) ? 'bg-blue-50 border-blue-300' : ''
                }`}
                onClick={() => handleFolderClick(folder)}
                onDoubleClick={() => !allowSelection && setCurrentPath(folder.path)}
              >
                <div className="flex flex-col items-center text-center">
                  {allowSelection && (
                    <input
                      type="checkbox"
                      className="mb-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={selectedItems.has(`folder-${folder.id}`)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleItemSelect(`folder-${folder.id}`);
                      }}
                    />
                  )}
                  <svg className="flex-shrink-0 h-8 w-8 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p 
                      className="text-sm font-medium text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap w-full" 
                      title={folder.name}
                    >
                      {folder.name}
                    </p>
                    <p className="text-xs text-gray-500">Folder</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Files */}
            {folderContent.files.map((file) => (
              <div
                key={`file-${file.id}`}
                className={`p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedItems.has(`file-${file.id}`) ? 'bg-blue-50 border-blue-300' : ''
                }`}
                onClick={() => handleFileClick(file)}
              >
                <div className="flex flex-col items-center text-center">
                  {allowSelection && (
                    <input
                      type="checkbox"
                      className="mb-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={selectedItems.has(`file-${file.id}`)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleItemSelect(`file-${file.id}`);
                      }}
                    />
                  )}
                  <svg className="flex-shrink-0 h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p 
                      className="text-sm font-medium text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap w-full" 
                      title={file.original_filename}
                    >
                      {file.original_filename}
                    </p>
                    <p className="text-xs text-gray-500">{file.mime_type.split('/')[0]} • {formatFileSize(file.size)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No files or folders</h3>
            <p className="mt-1 text-sm text-gray-500">This folder is empty.</p>
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black/60 overflow-y-auto h-full w-full z-50" onClick={() => setShowCreateFolderModal(false)}>
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Folder</h3>
              <div className="mb-4">
                <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  id="folderName"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter folder name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateFolder();
                    } else if (e.key === 'Escape') {
                      handleCancelCreateFolder();
                    }
                  }}
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCancelCreateFolder}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={creatingFolder}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={creatingFolder || !newFolderName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {creatingFolder ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 overflow-y-auto h-full w-full z-50" onClick={() => setShowUploadModal(false)}>
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Files</h3>
              
              {/* Drop Zone */}
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Drag and drop files here, or click to select files
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Files:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex-1 min-w-0">
                          <p 
                            className="text-sm font-medium text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap w-full" 
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {uploading && (
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Uploading... {uploadProgress}%</p>
                </div>
              )}

              {/* Messages */}
              {uploadError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{uploadError}</p>
                </div>
              )}
              {uploadSuccess && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">{uploadSuccess}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={handleCancelUpload}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || selectedFiles.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};