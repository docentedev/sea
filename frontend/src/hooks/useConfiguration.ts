import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Configuration, CreateConfigurationRequest, UpdateConfigurationRequest } from '../types/api';

export const useConfiguration = () => {
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const loadConfigurations = useCallback(async () => {
    setLoading(true);
    clearMessages();
    try {
      const configs = await apiService.getConfigurations();
      setConfigurations(configs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load configurations');
    } finally {
      setLoading(false);
    }
  }, []);

  const createConfiguration = async (data: CreateConfigurationRequest) => {
    setLoading(true);
    clearMessages();
    try {
      const newConfig = await apiService.createConfiguration(data);
      setConfigurations(prev => [...prev, newConfig]);
      setSuccess('Configuration created successfully');
      return newConfig;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create configuration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguration = async (id: number, data: UpdateConfigurationRequest) => {
    setLoading(true);
    clearMessages();
    try {
      const updatedConfig = await apiService.updateConfiguration(id, data);
      setConfigurations(prev =>
        prev.map(config => config.id === id ? updatedConfig : config)
      );
      setSuccess('Configuration updated successfully');
      return updatedConfig;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update configuration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteConfiguration = async (id: number) => {
    setLoading(true);
    clearMessages();
    try {
      await apiService.deleteConfiguration(id);
      setConfigurations(prev => prev.filter(config => config.id !== id));
      setSuccess('Configuration deleted successfully');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete configuration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getConfigurationValue = async (name: string) => {
    clearMessages();
    try {
      const result = await apiService.getConfigurationValue(name);
      return result.value;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to get configuration value');
      throw err;
    }
  };

  const setConfigurationValue = async (name: string, value: string) => {
    setLoading(true);
    clearMessages();
    try {
      const updatedConfig = await apiService.setConfigurationValue(name, value);
      setConfigurations(prev =>
        prev.map(config =>
          config.name === name ? updatedConfig : config
        )
      );
      setSuccess('Configuration value updated successfully');
      return updatedConfig;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to set configuration value');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigurations();
  }, []);

  return {
    configurations,
    loading,
    error,
    success,
    loadConfigurations,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    getConfigurationValue,
    setConfigurationValue,
    clearMessages
  };
};