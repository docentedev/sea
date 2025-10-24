import React, { useState } from 'react';
import type { Folder, FileInfo } from '../types/api';
import { useFileBrowser } from '../hooks/useFileBrowser';
import { useFileUpload } from '../hooks/useFileUpload';
import { useFolderOperations } from '../hooks/useFolderOperations';
import { Breadcrumb } from './Breadcrumb';
import { CreateFolderModal } from './CreateFolderModal';
import { UploadModal } from './UploadModal';
import { DeleteModal } from './DeleteModal';
import { FileList } from './FileList';

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
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const {
    currentPath,
    folderContent,
    loading,
    error,
    navigateToPath,
    navigateToParent,
    getBreadcrumbs,
    handleBreadcrumbClick,
    loadFolderContent
  } = useFileBrowser();

  const {
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
    openUploadModal
  } = useFileUpload(currentPath, () => {
    loadFolderContent(currentPath);
  });

  const {
    showCreateFolderModal,
    newFolderName,
    creatingFolder,
    showDeleteModal,
    itemToDelete,
    deleting,
    setNewFolderName,
    handleCreateFolder,
    handleCancelCreateFolder,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    openCreateFolderModal
  } = useFolderOperations(currentPath, () => {
    loadFolderContent(currentPath);
  });

  const handleFolderClick = (folder: Folder) => {
    if (onFolderSelect) {
      onFolderSelect(folder);
    }
    if (!allowSelection) {
      navigateToPath(folder.path);
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        <Breadcrumb
          breadcrumbs={getBreadcrumbs()}
          onBreadcrumbClick={handleBreadcrumbClick}
        />
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
              onClick={openCreateFolderModal}
              className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Folder
            </button>
            <button
              onClick={openUploadModal}
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
          <FileList
            folders={folderContent.folders}
            files={folderContent.files}
            allowSelection={allowSelection}
            selectedItems={selectedItems}
            onFolderClick={handleFolderClick}
            onFileClick={handleFileClick}
            onItemSelect={handleItemSelect}
            onDeleteClick={handleDeleteClick}
            formatFileSize={formatFileSize}
          />
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

      {/* Modals */}
      <CreateFolderModal
        isOpen={showCreateFolderModal}
        folderName={newFolderName}
        onFolderNameChange={setNewFolderName}
        onCreate={handleCreateFolder}
        onCancel={handleCancelCreateFolder}
        creating={creatingFolder}
      />

      <UploadModal
        isOpen={showUploadModal}
        selectedFiles={selectedFiles}
        uploading={uploading}
        uploadProgress={uploadProgress}
        uploadError={uploadError}
        uploadSuccess={uploadSuccess}
        fileInputRef={fileInputRef}
        dropZoneRef={dropZoneRef}
        onFileSelect={handleFileSelect}
        onRemoveFile={removeFile}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onUpload={handleUpload}
        onCancel={handleCancelUpload}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        itemToDelete={itemToDelete}
        deleting={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};