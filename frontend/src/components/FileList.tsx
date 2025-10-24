import React from 'react';
import type { Folder, FileInfo } from '../types/api';

interface FileListProps {
  folders: Folder[];
  files: FileInfo[];
  allowSelection: boolean;
  selectedItems: Set<number>;
  onFolderClick: (folder: Folder) => void;
  onFileClick: (file: FileInfo) => void;
  onItemSelect: (itemId: number) => void;
  onDeleteClick: (type: 'file' | 'folder', id: number, name: string, path?: string) => void;
  onDownloadClick: (file: FileInfo) => void;
  formatFileSize: (bytes: number) => string;
  viewMode?: 'list' | 'grid';
}

export const FileList: React.FC<FileListProps> = ({
  folders,
  files,
  allowSelection,
  selectedItems,
  onFolderClick,
  onFileClick,
  onItemSelect,
  onDeleteClick,
  onDownloadClick,
  formatFileSize,
  viewMode = 'list'
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'ppt':
      case 'pptx': return '📽️';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      case 'mp4':
      case 'avi':
      case 'mov': return '🎥';
      case 'mp3':
      case 'wav': return '🎵';
      case 'zip':
      case 'rar': return '📦';
      default: return '📄';
    }
  };

  const renderListView = () => (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
          <div className="col-span-6">Name</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-2">Modified</div>
          <div className="col-span-2">Actions</div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {/* Folders */}
        {folders.map((folder) => (
          <div
            key={`folder-${folder.id}`}
            className={`grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer ${
              selectedItems.has(folder.id) ? 'bg-blue-50' : ''
            }`}
            onClick={() => onFolderClick(folder)}
          >
            <div className="col-span-6 flex items-center">
              {allowSelection && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemSelect(folder.id);
                  }}
                  className={`mr-3 p-1 rounded ${
                    selectedItems.has(folder.id)
                      ? 'bg-blue-100 text-blue-600'
                      : 'hover:bg-gray-100 text-gray-400'
                  }`}
                  title="Select for move"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              <span className="text-xl mr-3">📁</span>
              <span className="font-medium text-gray-900">{folder.name}</span>
            </div>
            <div className="col-span-2 text-sm text-gray-500">-</div>
            <div className="col-span-2 text-sm text-gray-500">{formatDate(folder.created_at)}</div>
            <div className="col-span-2 flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick('folder', folder.id, folder.name, folder.path);
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* Files */}
        {files.map((file) => (
          <div
            key={`file-${file.id}`}
            className={`grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer ${
              selectedItems.has(file.id) ? 'bg-blue-50' : ''
            }`}
            onClick={() => onFileClick(file)}
          >
            <div className="col-span-6 flex items-center">
              {allowSelection && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemSelect(file.id);
                  }}
                  className={`mr-3 p-1 rounded ${
                    selectedItems.has(file.id)
                      ? 'bg-blue-100 text-blue-600'
                      : 'hover:bg-gray-100 text-gray-400'
                  }`}
                  title="Select for move"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              <span className="text-xl mr-3">📄</span>
              <span className="font-medium text-gray-900">{file.original_filename}</span>
            </div>
            <div className="col-span-2 text-sm text-gray-500">{formatFileSize(file.size)}</div>
            <div className="col-span-2 text-sm text-gray-500">{formatDate(file.created_at)}</div>
            <div className="col-span-2 flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadClick(file);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
                title="Download file"
              >
                Download
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick('file', file.id, file.original_filename);
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {folders.length === 0 && files.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500">
            This folder is empty
          </div>
        )}
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {/* Folders */}
      {folders.map((folder) => (
        <div
          key={`folder-${folder.id}`}
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer ${
            selectedItems.has(folder.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
          }`}
          onClick={() => allowSelection ? onItemSelect(folder.id) : onFolderClick(folder)}
        >
          {allowSelection && (
            <div className="flex justify-end mb-2">
              <input
                type="checkbox"
                checked={selectedItems.has(folder.id)}
                onChange={() => onItemSelect(folder.id)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="text-center">
            <div className="text-4xl mb-2">📁</div>
            <div className="font-medium text-gray-900 text-sm truncate" title={folder.name}>
              {folder.name}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatDate(folder.created_at)}
            </div>
            <div className="mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick('folder', folder.id, folder.name, folder.path);
                }}
                className="text-red-600 hover:text-red-800 text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Files */}
      {files.map((file) => (
        <div
          key={`file-${file.id}`}
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer ${
            selectedItems.has(file.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
          }`}
          onClick={() => allowSelection ? onItemSelect(file.id) : onFileClick(file)}
        >
          {allowSelection && (
            <div className="flex justify-end mb-2">
              <input
                type="checkbox"
                checked={selectedItems.has(file.id)}
                onChange={() => onItemSelect(file.id)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="text-center">
            <div className="text-4xl mb-2">{getFileIcon(file.original_filename)}</div>
            <div className="font-medium text-gray-900 text-sm truncate" title={file.original_filename}>
              {file.original_filename}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatFileSize(file.size)}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(file.created_at)}
            </div>
            <div className="mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick('file', file.id, file.original_filename);
                }}
                className="text-red-600 hover:text-red-800 text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {folders.length === 0 && files.length === 0 && (
        <div className="col-span-full text-center py-12 text-gray-500">
          This folder is empty
        </div>
      )}
    </div>
  );

  return viewMode === 'grid' ? renderGridView() : renderListView();
};