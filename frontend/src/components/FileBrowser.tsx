import React, { useState, useEffect } from 'react';
import type { Folder, FileInfo } from '../types/api';
import { apiService } from '../services/api';
import { useFileBrowser } from '../hooks/useFileBrowser';
import { useFileUpload } from '../hooks/useFileUpload';
import { useFolderOperations } from '../hooks/useFolderOperations';
import { useFileMove } from '../hooks/useFileMove';
import { Breadcrumb } from './Breadcrumb';
import { CreateFolderModal } from './CreateFolderModal';
import { UploadModal } from './UploadModal';
import { DeleteModal } from './DeleteModal';
import { FileList } from './FileList';
import { MoveFilesModal } from './MoveFilesModal';
import { FilePreviewModal, canPreviewFile } from './viewers';
import { Button } from './Button';
import { DataTable } from './data';
import type { Column } from './data';
import { Upload, Move, Check, X, ChevronUp, Plus, Download, Folder as FolderIcon, File as FileIcon, Trash2, Circle, CircleCheck } from 'lucide-react';
import { CardTableToggle } from './ViewToggle';

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
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const {
    currentPath,
    folderContent,
    allFiles,
    loading,
    error,
    defaultViewMode,
    isAdmin,
    navigateToPath,
    navigateToParent,
    getBreadcrumbs,
    handleBreadcrumbClick,
    updateDefaultViewMode,
    loadFolderContent
  } = useFileBrowser();

  // Sync view mode with default setting
  useEffect(() => {
    if (defaultViewMode) {
      setViewMode(defaultViewMode);
    }
  }, [defaultViewMode]);

  const handleViewModeChange = async (newViewMode: 'table' | 'cards') => {
    setViewMode(newViewMode);
    await updateDefaultViewMode(newViewMode);
  };

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

  const {
    showMoveModal,
    moving: movingFiles,
    moveError,
    moveSuccess,
    openMoveModal,
    closeMoveModal,
    moveFiles
  } = useFileMove(() => {
    loadFolderContent(currentPath);
    setSelectedItems(new Set()); // Clear selection after successful move
  });

  const handleFolderClick = (folder: Folder) => {
    if (onFolderSelect) {
      onFolderSelect(folder);
    }
    navigateToPath(folder.path);
  };

  const handleFileClick = (file: FileInfo) => {
    // Check if file can be previewed
    if (canPreviewFile(file)) {
      setPreviewFile(file);
      setShowPreviewModal(true);
      return;
    }

    // Otherwise, use the callback if provided
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleDownloadClick = async (file: FileInfo) => {
    try {
      const blob = await apiService.downloadFile(file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      // TODO: Show error message to user
    }
  };

  const handleDownloadMultiple = async () => {
    const selectedFiles = (isAdmin ? allFiles?.files : folderContent?.files)?.filter(file => selectedItems.has(file.id)) || [];

    // For now, only download files (folders would require ZIP creation)
    for (const file of selectedFiles) {
      try {
        await handleDownloadClick(file);
        // Add small delay between downloads to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error downloading file ${file.original_filename}:`, error);
        // Continue with other files even if one fails
      }
    }

    // Clear selection after download
    setSelectedItems(new Set());
  };

  const handleItemSelect = (itemId: number) => {
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

  // Combined type for files and folders in DataTable
  type FileBrowserItem = {
    id: number;
    name: string;
    type: 'folder' | 'file';
    size?: number;
    modifiedAt?: string;
    originalItem: Folder | FileInfo;
  };

  // Convert folders and files to combined items
  const getCombinedItems = (): FileBrowserItem[] => {
    if (isAdmin && allFiles) {
      return allFiles.files.map(file => ({
        id: file.id,
        name: file.original_filename,
        type: 'file' as const,
        size: file.size,
        modifiedAt: file.created_at,
        originalItem: file
      }));
    } else if (folderContent) {
      const folderItems: FileBrowserItem[] = folderContent.folders.map(folder => ({
        id: folder.id,
        name: folder.name,
        type: 'folder' as const,
        modifiedAt: folder.created_at,
        originalItem: folder
      }));

      const fileItems: FileBrowserItem[] = folderContent.files.map(file => ({
        id: file.id,
        name: file.original_filename,
        type: 'file' as const,
        size: file.size,
        modifiedAt: file.created_at,
        originalItem: file
      }));

      return [...folderItems, ...fileItems];
    }
    return [];
  };

  // DataTable columns
  const columns: Column<FileBrowserItem>[] = [
    {
      key: 'select',
      header: '',
      render: (_, item) => (
        <Button
          variant="ghost"
          size="xs"
          onClick={(e) => {
            e.stopPropagation();
            handleItemSelect(item.id);
          }}
        >
          {selectedItems.has(item.id) ? (
            <CircleCheck className="h-4 w-4 text-blue-500" />
          ) : (
            <Circle className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      )
    },
    {
      key: 'name',
      header: 'Name',
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          {item.type === 'folder' ? (
            <FolderIcon className="h-4 w-4 text-blue-500" />
          ) : (
            <FileIcon className="h-4 w-4 text-gray-400" />
          )}
          <span className="text-sm font-medium text-gray-100">{String(value)}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'type',
      header: 'Type',
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${value === 'folder'
          ? 'bg-blue-900 text-blue-100'
          : 'bg-gray-900 text-gray-200'
          }`}>
          {String(value)}
        </span>
      ),
      sortable: true
    },
    {
      key: 'size',
      header: 'Size',
      render: (value, item) => (
        <span className="text-sm text-gray-400">
          {item.type === 'file' && typeof value === 'number' ? formatFileSize(value) : '-'}
        </span>
      ),
      sortable: true
    },
    {
      key: 'modifiedAt',
      header: 'Modified',
      render: (value) => (
        <span className="text-sm text-gray-400">
          {value ? new Date(String(value)).toLocaleDateString() : '-'}
        </span>
      ),
      sortable: true
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, item) => (
        <div className="flex items-center space-x-2">
          {item.type === 'file' && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadClick(item.originalItem as FileInfo);
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(item.type, item.id, item.name, item.type === 'folder' ? (item.originalItem as Folder).path : undefined);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const combinedItems = getCombinedItems();

  if (loading) {
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 border-gray-600"></div>
      <span className="ml-2 text-gray-400">Loading...</span>
    </div>
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-700 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <X className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-200">Error</h3>
            <div className="mt-2 text-sm text-red-300">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <div className="py-3">
        <Breadcrumb
          breadcrumbs={getBreadcrumbs()}
          onBreadcrumbClick={handleBreadcrumbClick}
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between py-3 bg-gray-750">
        <div className="flex items-center space-x-2">
          {currentPath !== '/' && (
            <Button
              variant="outline"
              size="sm"
              onClick={navigateToParent}
            >
              <ChevronUp className="-ml-0.5 mr-2 h-4 w-4" />
              Up
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateFolderModal}
          >
            <Plus className="-ml-0.5 mr-2 h-4 w-4" />
            New Folder
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={openUploadModal}
          >
            <Upload className="-ml-0.5 mr-2 h-4 w-4" />
            Upload Files
          </Button>
          {selectedItems.size > 0 && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={handleDownloadMultiple}
              >
                <Download className="-ml-0.5 mr-2 h-4 w-4" />
                Download {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={openMoveModal}
                disabled={movingFiles}
              >
                <Move className="-ml-0.5 mr-2 h-4 w-4" />
                Move {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''}
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <CardTableToggle
            value={viewMode}
            onChange={handleViewModeChange}
          />
          <div className="text-sm text-gray-400">
            {isAdmin
              ? (allFiles ? `${allFiles.total} archivos totales` : 'Cargando archivos...')
              : (folderContent ? `${folderContent.folders.length} folders, ${folderContent.files.length} files` : 'Cargando...')
            }
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {moveError && (
        <div className="mx-4 mb-4 px-4 py-3 bg-red-900 border-l-4 border-red-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-300">{moveError}</p>
            </div>
          </div>
        </div>
      )}

      {moveSuccess && (
        <div className="px-4 py-3 bg-green-900 border-l-4 border-green-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-300">{moveSuccess}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div>
        {isAdmin ? (
          // Admin view: show all files
          allFiles && allFiles.files.length > 0 ? (
            viewMode === 'table' ? (
              <DataTable
                data={combinedItems}
                columns={columns}
                keyField="id"
                loading={false}
                emptyMessage="No hay archivos"
                onRowClick={(item) => {
                  if (item.type === 'file') {
                    handleFileClick(item.originalItem as FileInfo);
                  }
                }}
                className="border border-gray-700"
              />
            ) : (
              <FileList
                folders={[]}
                files={allFiles.files}
                allowSelection={allowSelection}
                selectedItems={selectedItems}
                onFolderClick={handleFolderClick}
                onFileClick={handleFileClick}
                onItemSelect={handleItemSelect}
                onDeleteClick={handleDeleteClick}
                onDownloadClick={handleDownloadClick}
                formatFileSize={formatFileSize}
              />
            )
          ) : (
            <div className="text-center py-12">
              <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-100">No hay archivos</h3>
              <p className="mt-1 text-sm text-gray-400">No se encontraron archivos en el sistema.</p>
            </div>
          )
        ) : (
          // Regular user view: show folder structure
          folderContent && (folderContent.folders.length > 0 || folderContent.files.length > 0) ? (
            viewMode === 'table' ? (
              <DataTable
                data={combinedItems}
                columns={columns}
                keyField="id"
                loading={false}
                emptyMessage="No hay archivos o carpetas"
                onRowClick={(item) => {
                  if (item.type === 'folder') {
                    handleFolderClick(item.originalItem as Folder);
                  } else {
                    handleFileClick(item.originalItem as FileInfo);
                  }
                }}
                className="border border-gray-700"
              />
            ) : (
              <FileList
                folders={folderContent.folders}
                files={folderContent.files}
                allowSelection={allowSelection}
                selectedItems={selectedItems}
                onFolderClick={handleFolderClick}
                onFileClick={handleFileClick}
                onItemSelect={handleItemSelect}
                onDeleteClick={handleDeleteClick}
                onDownloadClick={handleDownloadClick}
                formatFileSize={formatFileSize}
              />
            )
          ) : (
            <div className="text-center py-12">
              <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-100">No files or folders</h3>
              <p className="mt-1 text-sm text-gray-400">This folder is empty.</p>
            </div>
          )
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

      <MoveFilesModal
        isOpen={showMoveModal}
        fileIds={Array.from(selectedItems)}
        currentPath={currentPath}
        moving={movingFiles}
        moveError={moveError}
        moveSuccess={moveSuccess}
        onMove={moveFiles}
        onCancel={closeMoveModal}
      />

      <FilePreviewModal
        file={previewFile}
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewFile(null);
        }}
      />
    </div>
  );
};