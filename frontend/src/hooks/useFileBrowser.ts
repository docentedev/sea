import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { FolderContent } from '../types/api';

export const useFileBrowser = () => {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [folderContent, setFolderContent] = useState<FolderContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultViewMode, setDefaultViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    loadFolderContent(currentPath);
  }, [currentPath]);

  // Initialize path from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pathParam = urlParams.get('path');
    if (pathParam) {
      setCurrentPath(decodeURIComponent(pathParam));
    }
  }, []);

  // Load default view mode on mount
  useEffect(() => {
    const loadDefaultViewMode = async () => {
      try {
        const config = await apiService.getFileUploadConfig();
        if (config.defaultFileView) {
          setDefaultViewMode(config.defaultFileView);
        }
      } catch (error) {
        console.warn('Failed to load default view mode:', error);
      }
    };

    loadDefaultViewMode();
  }, []);

  const updateDefaultViewMode = async (viewMode: 'list' | 'grid') => {
    try {
      // Note: This would require a new API endpoint to update user preferences
      // For now, we'll just update local state
      setDefaultViewMode(viewMode);
    } catch (error) {
      console.error('Failed to update default view mode:', error);
    }
  };

  const loadFolderContent = async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getFolderContents(path);
      if (response.success) {
        setFolderContent(response.data);
      } else {
        setError('Failed to load folder content');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to load folder content');
    } finally {
      setLoading(false);
    }
  };

  const navigateToPath = (path: string) => {
    setCurrentPath(path);
  };

  const navigateToParent = () => {
    if (currentPath !== '/' && folderContent && folderContent.parent_path !== null) {
      setCurrentPath(folderContent.parent_path);
    } else {
      setCurrentPath('/');
    }
  };

  const getBreadcrumbs = (): string[] => {
    if (currentPath === '/') return ['/'];
    return ['/', ...currentPath.split('/').filter(p => p.length > 0)];
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      setCurrentPath('/');
    } else {
      const breadcrumbs = getBreadcrumbs();
      const path = '/' + breadcrumbs.slice(1, index + 1).join('/');
      setCurrentPath(path);
    }
  };

  return {
    currentPath,
    folderContent,
    loading,
    error,
    defaultViewMode,
    loadFolderContent,
    navigateToPath,
    navigateToParent,
    getBreadcrumbs,
    handleBreadcrumbClick,
    updateDefaultViewMode,
    setError
  };
};