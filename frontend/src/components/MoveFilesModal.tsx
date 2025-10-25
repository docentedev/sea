import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Folder } from '../types/api';
import { FolderTreeSelector } from './FolderTreeSelector';
import { Button } from './Button';
import { Check, X } from 'lucide-react';
import { Modal } from './Modal';

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
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={`Move ${fileIds.length} file${fileIds.length !== 1 ? 's' : ''}`}
      size="md"
    >
      <div className="p-6">
        {moveSuccess && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-700 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-300">{moveSuccess}</p>
              </div>
            </div>
          </div>
        )}

        {moveError && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-300">{moveError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select destination folder:
          </label>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-300">Loading folders...</span>
            </div>
          ) : folders.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
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

          <p className="mt-2 text-sm text-gray-300">
            Selected destination: <span className="font-medium">{selectedPath === '/' ? 'Root Directory' : selectedPath}</span>
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            onClick={onCancel}
            disabled={moving}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={moving || fileIds.length === 0}
            variant="primary"
          >
            {moving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Moving...
              </div>
            ) : (
              `Move ${fileIds.length} file${fileIds.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};