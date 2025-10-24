import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    loadFolderContent(currentPath);
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getBreadcrumbs = (): string[] => {
    if (currentPath === '/') return ['Home'];
    return ['Home', ...currentPath.split('/').filter(p => p.length > 0)];
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
          </div>
          <div className="text-sm text-gray-500">
            {folderContent && `${folderContent.folders.length} folders, ${folderContent.files.length} files`}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-hidden">
        {folderContent && (folderContent.folders.length > 0 || folderContent.files.length > 0) ? (
          <div className="divide-y divide-gray-200">
            {/* Folders */}
            {folderContent.folders.map((folder) => (
              <div
                key={`folder-${folder.id}`}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                  selectedItems.has(`folder-${folder.id}`) ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleFolderClick(folder)}
                onDoubleClick={() => !allowSelection && setCurrentPath(folder.path)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    {allowSelection && (
                      <input
                        type="checkbox"
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={selectedItems.has(`folder-${folder.id}`)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleItemSelect(`folder-${folder.id}`);
                        }}
                      />
                    )}
                    <svg className="flex-shrink-0 h-5 w-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{folder.name}</p>
                      <p className="text-sm text-gray-500">Folder</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-sm text-gray-500">
                    {formatDate(folder.created_at)}
                  </div>
                </div>
              </div>
            ))}

            {/* Files */}
            {folderContent.files.map((file) => (
              <div
                key={`file-${file.id}`}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                  selectedItems.has(`file-${file.id}`) ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleFileClick(file)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    {allowSelection && (
                      <input
                        type="checkbox"
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={selectedItems.has(`file-${file.id}`)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleItemSelect(`file-${file.id}`);
                        }}
                      />
                    )}
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.original_filename}</p>
                      <p className="text-sm text-gray-500">{file.mime_type} • {formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-sm text-gray-500">
                    {formatDate(file.created_at)}
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
    </div>
  );
};