import { useLocation } from 'wouter';

export function HomePage() {
  const [, navigate] = useLocation();
  return (
    <div className="p-10 text-center font-sans">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">NAS Cloud System</h1>
      <p className="text-lg text-gray-600 mb-16">Welcome to your personal cloud storage system</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
        <div className="p-5 border border-gray-300 rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">System Health</h3>
          <p className="text-gray-600 mb-4">Monitor system status, memory usage, and database health</p>
          <button
            onClick={() => navigate('/health')}
            className="px-4 py-2 bg-blue-500 text-white border-none rounded hover:bg-blue-600 cursor-pointer transition-colors"
          >
            View Health
          </button>
        </div>

        <div className="p-5 border border-gray-300 rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">File Storage</h3>
          <p className="text-gray-600 mb-4">Manage your files and folders in the cloud</p>
          <button
            onClick={() => navigate('/files')}
            className="px-4 py-2 bg-blue-500 text-white border-none rounded hover:bg-blue-600 cursor-pointer transition-colors"
          >
            📁 Manage Files
          </button>
        </div>

        <div className="p-5 border border-gray-300 rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">User Management</h3>
          <p className="text-gray-600 mb-4">Manage users and permissions</p>
          <button
            disabled
            className="px-4 py-2 bg-gray-400 text-white border-none rounded cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}