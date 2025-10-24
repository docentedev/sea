import React from 'react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>

        <p className="text-gray-700 mb-6">
          Are you sure you want to delete this {itemToDelete.type}?
        </p>

        <div className="bg-gray-50 p-3 rounded-md mb-6">
          <p className="font-medium text-gray-900">{itemToDelete.name}</p>
          <p className="text-sm text-gray-600 capitalize">{itemToDelete.type}</p>
        </div>

        {itemToDelete.type === 'folder' && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md mb-6">
            <p className="text-sm text-yellow-800">
              ⚠️ Deleting a folder will permanently remove all files and subfolders inside it.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};