import { useLocation } from 'wouter';

export function HomePage() {
  const [, navigate] = useLocation();
  return (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>NAS Cloud System</h1>
      <p>Welcome to your personal cloud storage system</p>

      <div style={{
        marginTop: '40px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        maxWidth: '800px',
        margin: '40px auto'
      }}>
        <div style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>System Health</h3>
          <p>Monitor system status, memory usage, and database health</p>
          <button
            onClick={() => navigate('/health')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              marginTop: '10px',
              cursor: 'pointer'
            }}
          >
            View Health
          </button>
        </div>

        <div style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>File Storage</h3>
          <p>Manage your files and folders in the cloud</p>
          <button
            disabled
            style={{
              padding: '8px 16px',
              backgroundColor: '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              marginTop: '10px',
              cursor: 'not-allowed'
            }}
          >
            Coming Soon
          </button>
        </div>

        <div style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>User Management</h3>
          <p>Manage users and permissions</p>
          <button
            disabled
            style={{
              padding: '8px 16px',
              backgroundColor: '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              marginTop: '10px',
              cursor: 'not-allowed'
            }}
          >
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}