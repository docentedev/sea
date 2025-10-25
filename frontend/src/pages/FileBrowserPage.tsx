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
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-100">File Browser</h1>
              <p className="mt-1 text-sm text-gray-400">
                Browse and manage files in your NAS Cloud storage
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <FileBrowser
              onFileSelect={handleFileSelect}
              onFolderSelect={handleFolderSelect}
              allowSelection={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}