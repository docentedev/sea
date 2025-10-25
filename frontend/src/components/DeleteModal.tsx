import React from 'react';
import { Button } from './Button';
import { Modal } from './Modal';

interface DeleteModalProps {
  isOpen: boolean;
  itemToDelete: { type: 'file' | 'folder', name: string } | null;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  itemToDelete,
  deleting,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !itemToDelete) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Confirm Deletion"
      size="sm"
    >
      <div className="p-6">
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete this {itemToDelete.type}?
        </p>

        <div className="bg-gray-800 p-3 rounded-md mb-6">
          <p className="font-medium text-gray-100">{itemToDelete.name}</p>
          <p className="text-sm text-gray-400 capitalize">{itemToDelete.type}</p>
        </div>

        {itemToDelete.type === 'folder' && (
          <div className="bg-yellow-900 border border-yellow-700 p-3 rounded-md mb-6">
            <p className="text-sm text-yellow-100">
              ⚠️ Deleting a folder will permanently remove all files and subfolders inside it.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};