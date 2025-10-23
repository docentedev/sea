import type { HealthResponse } from '../types/api';

interface HealthStatusProps {
  health: HealthResponse;
}

export function HealthStatus({ health }: HealthStatusProps) {
  const formatBytes = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="p-5 font-sans">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">System Health</h2>

      <div className="mb-5">
        <strong className="text-gray-700">Status:</strong>
        <span className={`ml-2.5 font-semibold ${
          health.status === 'healthy' ? 'text-green-600' : 'text-red-600'
        }`}>
          {health.status.toUpperCase()}
        </span>
      </div>

      <div className="mb-5">
        <strong className="text-gray-700">Version:</strong> <span className="text-gray-600">{health.version}</span>
      </div>

      <div className="mb-5">
        <strong className="text-gray-700">Uptime:</strong> <span className="text-gray-600">{formatUptime(health.uptime)}</span>
      </div>

      <div className="mb-5">
        <strong className="text-gray-700">Last Check:</strong> <span className="text-gray-600">{new Date(health.timestamp).toLocaleString()}</span>
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mb-3">Memory Usage</h3>
      <div className="ml-5 mb-5 space-y-1">
        <div><strong className="text-gray-700">RSS:</strong> <span className="text-gray-600">{formatBytes(health.memory.rss)}</span></div>
        <div><strong className="text-gray-700">Heap Total:</strong> <span className="text-gray-600">{formatBytes(health.memory.heapTotal)}</span></div>
        <div><strong className="text-gray-700">Heap Used:</strong> <span className="text-gray-600">{formatBytes(health.memory.heapUsed)}</span></div>
        <div><strong className="text-gray-700">External:</strong> <span className="text-gray-600">{formatBytes(health.memory.external)}</span></div>
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mb-3">Database Status</h3>
      <div className="ml-5 mb-5 space-y-1">
        <div>
          <strong className="text-gray-700">Status:</strong>
          <span className={`ml-2.5 font-semibold ${
            health.database.status === 'healthy' ? 'text-green-600' : 'text-red-600'
          }`}>
            {health.database.status.toUpperCase()}
          </span>
        </div>
        <div><strong className="text-gray-700">Message:</strong> <span className="text-gray-600">{health.database.message}</span></div>
        <div><strong className="text-gray-700">Latency:</strong> <span className="text-gray-600">{health.database.latency}ms</span></div>
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mb-3">Database Statistics</h3>
      <div className="ml-5 space-y-1">
        <div><strong className="text-gray-700">Total Users:</strong> <span className="text-gray-600">{health.database.stats.total_users}</span></div>
        <div><strong className="text-gray-700">Active Users:</strong> <span className="text-gray-600">{health.database.stats.active_users}</span></div>
        <div><strong className="text-gray-700">Total Roles:</strong> <span className="text-gray-600">{health.database.stats.total_roles}</span></div>
        <div><strong className="text-gray-700">Storage Used:</strong> <span className="text-gray-600">{health.database.stats.total_storage_used_gb} GB</span></div>
        <div><strong className="text-gray-700">Database Size:</strong> <span className="text-gray-600">{health.database.stats.database_size_mb} MB</span></div>
      </div>
    </div>
  );
}