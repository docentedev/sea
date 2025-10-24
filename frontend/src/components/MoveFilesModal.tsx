import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Folder } from '../types/api';

interface MoveFilesModalProps {
  isOpen: boolean;
  fileIds: number[];
  onMove: (fileIds: number[], destinationPath: string) => void;
  onCancel: () => void;
  moving: boolean;
  moveError: string | null;
  moveSuccess: string | null;
}

export const MoveFilesModal: React.FC<MoveFilesModalProps> = ({
  isOpen,
  fileIds,
  onMove,
  onCancel,
  moving,
  moveError,
  moveSuccess,
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>('/');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFolders();
    }
  }, [isOpen]);

  const loadFolders = async () => {
    setLoading(true);
    try {
      // Load all user folders
      const response = await apiService.getFolderContents('/');
      if (response.success) {
        setFolders(response.data.folders);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMove = () => {
    if (fileIds.length > 0 && selectedPath) {
      onMove(fileIds, selectedPath);
    }
  };

  const getDisplayPath = (path: string) => {
    if (path === '/') return 'Root Directory';
    return path;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Move {fileIds.length} file{fileIds.length !== 1 ? 's' : ''}
          </h3>

          {moveSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{moveSuccess}</p>
                </div>
              </div>
            </div>
          )}

          {moveError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{moveError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select destination folder:
            </label>

            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading folders...</span>
              </div>
            ) : (
              <select
                value={selectedPath}
                onChange={(e) => setSelectedPath(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={moving}
              >
                <option value="/">📁 Root Directory</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.path}>
                    📁 {folder.name}
                  </option>
                ))}
              </select>
            )}

            <p className="mt-2 text-sm text-gray-600">
              Selected: <span className="font-medium">{getDisplayPath(selectedPath)}</span>
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              disabled={moving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleMove}
              disabled={moving || fileIds.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {moving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Moving...
                </div>
              ) : (
                `Move ${fileIds.length} file${fileIds.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};