import { FileBrowser } from '../components/FileBrowser';
import type { FileInfo, Folder } from '../types/api';

export function FileBrowserPage() {
  const handleFileSelect = (file: FileInfo) => {
    console.log('File selected:', file);
    // TODO: Implement file actions (download, delete, etc.)
  };

  const handleFolderSelect = (folder: Folder) => {
    console.log('Folder selected:', folder);
    // TODO: Implement folder actions (rename, delete, etc.)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">File Browser</h1>
          <p className="mt-2 text-sm text-gray-600">
            Navigate through your virtual folders and manage your files
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <FileBrowser
              onFileSelect={handleFileSelect}
              onFolderSelect={handleFolderSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}