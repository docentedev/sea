import React from 'react';
import type { Folder, FileInfo } from '../types/api';

interface FileListProps {
  folders: Folder[];
  files: FileInfo[];
  allowSelection: boolean;
  selectedItems: Set<string>;
  onFolderClick: (folder: Folder) => void;
  onFileClick: (file: FileInfo) => void;
  onItemSelect: (itemId: string) => void;
  onDeleteClick: (type: 'file' | 'folder', id: number, name: string, path?: string) => void;
  formatFileSize: (bytes: number) => string;
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
  formatFileSize
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

  return (
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
              selectedItems.has(`folder-${folder.id}`) ? 'bg-blue-50' : ''
            }`}
            onClick={() => allowSelection ? onItemSelect(`folder-${folder.id}`) : onFolderClick(folder)}
          >
            <div className="col-span-6 flex items-center">
              {allowSelection && (
                <input
                  type="checkbox"
                  checked={selectedItems.has(`folder-${folder.id}`)}
                  onChange={() => onItemSelect(`folder-${folder.id}`)}
                  className="mr-3"
                  onClick={(e) => e.stopPropagation()}
                />
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
              selectedItems.has(`file-${file.id}`) ? 'bg-blue-50' : ''
            }`}
            onClick={() => allowSelection ? onItemSelect(`file-${file.id}`) : onFileClick(file)}
          >
            <div className="col-span-6 flex items-center">
              {allowSelection && (
                <input
                  type="checkbox"
                  checked={selectedItems.has(`file-${file.id}`)}
                  onChange={() => onItemSelect(`file-${file.id}`)}
                  className="mr-3"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <span className="text-xl mr-3">{getFileIcon(file.original_filename)}</span>
              <span className="font-medium text-gray-900">{file.original_filename}</span>
            </div>
            <div className="col-span-2 text-sm text-gray-500">{formatFileSize(file.size)}</div>
            <div className="col-span-2 text-sm text-gray-500">{formatDate(file.created_at)}</div>
            <div className="col-span-2 flex items-center space-x-2">
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
};