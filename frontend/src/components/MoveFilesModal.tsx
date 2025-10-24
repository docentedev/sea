import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Folder } from '../types/api';
import { FolderTreeSelector } from './FolderTreeSelector';

interface MoveFilesModalProps {
  isOpen: boolean;
  fileIds: number[];
  currentPath: string;
  onMove: (fileIds: number[], destinationPath: string) => void;
  onCancel: () => void;
  moving: boolean;
  moveError: string | null;
  moveSuccess: string | null;
}

export const MoveFilesModal: React.FC<MoveFilesModalProps> = ({
  isOpen,
  fileIds,
  currentPath,
  onMove,
  onCancel,
  moving,
  moveError,
  moveSuccess,
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>('/');
  const [loading, setLoading] = useState(false);

  const loadAllFolders = useCallback(async () => {
    setLoading(true);
    try {
      // Get all user folders directly from the API
      const folders = await apiService.getAllFolders();
      console.log('All folders loaded:', folders);
      console.log('Folders with details:', folders.map(f => ({
        id: f.id,
        name: f.name,
        path: f.path,
        parent_path: f.parent_path,
        parent_path_type: typeof f.parent_path
      })));
      // Don't filter out the current directory - we need to show its children
      // but make the current directory non-selectable in the tree
      const availableFolders = folders;
      console.log('Available folders after filtering:', availableFolders);
      console.log('Current path:', currentPath);
      setFolders(availableFolders);
    } catch (error) {
      console.error('Error loading folders:', error);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, [currentPath]);

  useEffect(() => {
    if (isOpen) {
      loadAllFolders();
    }
  }, [isOpen, loadAllFolders]);

  const handleMove = () => {
    if (fileIds.length > 0 && selectedPath) {
      onMove(fileIds, selectedPath);
    }
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
            ) : folders.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No folders available to move to.
                <br />
                <small className="text-xs">Create some folders first to see them here.</small>
              </div>
            ) : (
              <FolderTreeSelector
                folders={folders}
                selectedPath={selectedPath}
                onSelectPath={setSelectedPath}
                disabled={moving}
                currentPath={currentPath}
              />
            )}

            <p className="mt-2 text-sm text-gray-600">
              Selected destination: <span className="font-medium">{selectedPath === '/' ? 'Root Directory' : selectedPath}</span>
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