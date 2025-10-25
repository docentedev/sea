import { useEffect, useCallback } from 'react';
import { useApp } from '../hooks/useApp';
import { apiService } from '../services/api';
import { HealthStatus } from '../components/HealthStatus';
import { LoadingState } from '../components/state/LoadingState';
import { ErrorMessage } from '../components/LoadingAndError';
import { Button } from '../components/Button';
import { RefreshCw } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-100">NAS Cloud System Health</h1>
              <p className="mt-1 text-sm text-gray-400">
                Monitor system status, memory usage, and database health
              </p>
            </div>
            <Button
              onClick={fetchHealth}
              disabled={state.loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

            {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {state.loading && (
          <LoadingState message="Checking system health..." />
        )}

        {state.error && (
          <ErrorMessage message={state.error} onRetry={handleRetry} />
        )}

        {!state.loading && !state.error && state.health && (
          <HealthStatus health={state.health} />
        )}

        {!state.loading && !state.error && !state.health && (
          <div className="text-center py-12">
            <p className="text-gray-400">No health data available</p>
          </div>
        )}
      </div>
    </div>
  );
}