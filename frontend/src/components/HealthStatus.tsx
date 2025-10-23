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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>System Health</h2>

      <div style={{ marginBottom: '20px' }}>
        <strong>Status:</strong>
        <span style={{
          color: health.status === 'healthy' ? 'green' : 'red',
          marginLeft: '10px'
        }}>
          {health.status.toUpperCase()}
        </span>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>Version:</strong> {health.version}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>Uptime:</strong> {formatUptime(health.uptime)}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>Last Check:</strong> {new Date(health.timestamp).toLocaleString()}
      </div>

      <h3>Memory Usage</h3>
      <div style={{ marginLeft: '20px', marginBottom: '20px' }}>
        <div><strong>RSS:</strong> {formatBytes(health.memory.rss)}</div>
        <div><strong>Heap Total:</strong> {formatBytes(health.memory.heapTotal)}</div>
        <div><strong>Heap Used:</strong> {formatBytes(health.memory.heapUsed)}</div>
        <div><strong>External:</strong> {formatBytes(health.memory.external)}</div>
      </div>

      <h3>Database Status</h3>
      <div style={{ marginLeft: '20px', marginBottom: '20px' }}>
        <div>
          <strong>Status:</strong>
          <span style={{
            color: health.database.status === 'healthy' ? 'green' : 'red',
            marginLeft: '10px'
          }}>
            {health.database.status.toUpperCase()}
          </span>
        </div>
        <div><strong>Message:</strong> {health.database.message}</div>
        <div><strong>Latency:</strong> {health.database.latency}ms</div>
      </div>

      <h3>Database Statistics</h3>
      <div style={{ marginLeft: '20px' }}>
        <div><strong>Total Users:</strong> {health.database.stats.total_users}</div>
        <div><strong>Active Users:</strong> {health.database.stats.active_users}</div>
        <div><strong>Total Roles:</strong> {health.database.stats.total_roles}</div>
        <div><strong>Storage Used:</strong> {health.database.stats.total_storage_used_gb} GB</div>
        <div><strong>Database Size:</strong> {health.database.stats.database_size_mb} MB</div>
      </div>
    </div>
  );
}