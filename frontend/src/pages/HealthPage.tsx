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
      <div className="flex justify-between items-center mb-5 px-5">
        <h1 className="text-3xl font-bold text-gray-800">NAS Cloud System Health</h1>
        <button
          onClick={fetchHealth}
          disabled={state.loading}
          className={`px-5 py-2.5 bg-blue-500 text-white border-none rounded cursor-pointer transition-opacity ${
            state.loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-600'
          }`}
        >
          Refresh
        </button>
      </div>
      <HealthStatus health={state.health} />
    </div>
  );
}