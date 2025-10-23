import { useEffect, useCallback } from 'react';
import { useApp } from '../hooks/useApp';
import { apiService } from '../services/api';
import { HealthStatus } from '../components/HealthStatus';
import { LoadingSpinner } from '../components/LoadingAndError';
import { ErrorMessage } from '../components/LoadingAndError';

export function HealthPage() {
  const { state, dispatch } = useApp();

    const fetchHealth = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const healthData = await apiService.getHealth();
      dispatch({ type: 'SET_HEALTH', payload: healthData });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch health data';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  }, [dispatch]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const handleRetry = () => {
    fetchHealth();
  };

  if (state.loading) {
    return <LoadingSpinner message="Checking system health..." />;
  }

  if (state.error) {
    return <ErrorMessage message={state.error} onRetry={handleRetry} />;
  }

  if (!state.health) {
    return <div>No health data available</div>;
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '0 20px'
      }}>
        <h1>NAS Cloud System Health</h1>
        <button
          onClick={fetchHealth}
          disabled={state.loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: state.loading ? 'not-allowed' : 'pointer',
            opacity: state.loading ? 0.6 : 1
          }}
        >
          Refresh
        </button>
      </div>
      <HealthStatus health={state.health} />
    </div>
  );
}