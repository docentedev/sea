import { useLocation } from 'wouter';
import { Button } from '../components/Button';

export function HomePage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-100">NAS Cloud System</h1>
              <p className="mt-1 text-sm text-gray-400">
                Welcome to your personal cloud storage system
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
          <div className="p-5 border border-gray-600 rounded-lg bg-gray-800">
            <h3 className="text-xl font-semibold text-gray-100 mb-3">System Health</h3>
            <p className="text-gray-400 mb-4">Monitor system status, memory usage, and database health</p>
            <Button
              onClick={() => navigate('/health')}
              variant="primary"
            >
              View Health
            </Button>
          </div>

          <div className="p-5 border border-gray-600 rounded-lg bg-gray-800">
            <h3 className="text-xl font-semibold text-gray-100 mb-3">File Storage</h3>
            <p className="text-gray-400 mb-4">Manage your files and folders in the cloud</p>
            <Button
              onClick={() => navigate('/browser')}
              variant="primary"
            >
              📁 Browse & Upload Files
            </Button>
          </div>

          <div className="p-5 border border-gray-600 rounded-lg bg-gray-800">
            <h3 className="text-xl font-semibold text-gray-100 mb-3">User Management</h3>
            <p className="text-gray-400 mb-4">Manage users and permissions</p>
            <Button
              disabled
              variant="secondary"
            >
              Coming Soon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}