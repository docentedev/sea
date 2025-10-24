import { useState } from 'react';
import { apiService } from '../services/api';

export const useFileMove = (onSuccess?: () => void) => {
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moving, setMoving] = useState(false);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [moveSuccess, setMoveSuccess] = useState<string | null>(null);

  const openMoveModal = () => {
    setShowMoveModal(true);
    setMoveError(null);
    setMoveSuccess(null);
  };

  const closeMoveModal = () => {
    setShowMoveModal(false);
    setMoveError(null);
    setMoveSuccess(null);
  };

  const moveFiles = async (fileIds: number[], destinationPath: string) => {
    if (fileIds.length === 0) {
      setMoveError('No files selected');
      return;
    }

    setMoving(true);
    setMoveError(null);
    setMoveSuccess(null);

    try {
      const result = await apiService.moveFiles(fileIds, destinationPath);

      setMoveSuccess(`Successfully moved ${result.movedFiles.length} file(s) to ${result.destinationPath}`);

      // Call success callback to refresh the view
      if (onSuccess) {
        onSuccess();
      }

      // Close modal after a short delay
      setTimeout(() => {
        closeMoveModal();
      }, 1500);

    } catch (error: unknown) {
      console.error('Error moving files:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to move files';
      setMoveError(errorMessage);
    } finally {
      setMoving(false);
    }
  };

  return {
    showMoveModal,
    moving,
    moveError,
    moveSuccess,
    openMoveModal,
    closeMoveModal,
    moveFiles,
  };
};