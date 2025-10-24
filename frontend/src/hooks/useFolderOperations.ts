import { useState } from 'react';
import { apiService } from '../services/api';

export const useFolderOperations = (currentPath: string, onOperationSuccess: () => void) => {
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'file' | 'folder', id: number, name: string, path?: string} | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      throw new Error('Folder name cannot be empty');
    }

    setCreatingFolder(true);

    try {
      const folderPath = currentPath === '/' ? `/${newFolderName}` : `${currentPath}/${newFolderName}`;
      await apiService.createFolder(newFolderName, folderPath, currentPath === '/' ? undefined : currentPath);

      onOperationSuccess();
      setShowCreateFolderModal(false);
      setNewFolderName('');
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleCancelCreateFolder = () => {
    setShowCreateFolderModal(false);
    setNewFolderName('');
  };

  const handleDeleteClick = (type: 'file' | 'folder', id: number, name: string, path?: string) => {
    setItemToDelete({ type, id, name, path });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setDeleting(true);
    try {
      if (itemToDelete.type === 'file') {
        await apiService.deleteFile(itemToDelete.id);
      } else if (itemToDelete.type === 'folder' && itemToDelete.path) {
        await apiService.deleteFolder(itemToDelete.path);
      }

      onOperationSuccess();
      setShowDeleteModal(false);
      setItemToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
    setDeleting(false);
  };

  const openCreateFolderModal = () => setShowCreateFolderModal(true);

  return {
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
    openCreateFolderModal,
    setShowCreateFolderModal
  };
};