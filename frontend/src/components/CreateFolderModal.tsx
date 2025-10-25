import React from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import FormField from './FormField';
import Input from './Input';

interface CreateFolderModalProps {
  isOpen: boolean;
  folderName: string;
  onFolderNameChange: (name: string) => void;
  onCreate: () => void;
  onCancel: () => void;
  creating: boolean;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  folderName,
  onFolderNameChange,
  onCreate,
  onCancel,
  creating
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Create New Folder"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-4">
          <FormField label="Folder Name" required>
            <Input
              type="text"
              value={folderName}
              onChange={(e) => onFolderNameChange(e.target.value)}
              placeholder="Enter folder name"
              disabled={creating}
              autoFocus
            />
          </FormField>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={creating || !folderName.trim()}
          >
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};