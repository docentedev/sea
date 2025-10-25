import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { FolderContent, FilesResponse } from '../types/api';

export const useFileBrowser = () => {
  const { isAdmin } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [folderContent, setFolderContent] = useState<FolderContent | null>(null);
  const [allFiles, setAllFiles] = useState<FilesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultViewMode, setDefaultViewMode] = useState<'table' | 'cards'>('table');

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

  const updateDefaultViewMode = async (viewMode: 'table' | 'cards') => {
    try {
      // Note: This would require a new API endpoint to update user preferences
      // For now, we'll just update local state
      setDefaultViewMode(viewMode);
    } catch (error) {
      console.error('Failed to update default view mode:', error);
    }
  };

  const loadFolderContent = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      if (isAdmin()) {
        // Admin users see all files
        const response = await apiService.getAllFiles();
        if (response) {
          setAllFiles(response);
          setFolderContent(null); // Clear folder content for admin view
        } else {
          setError('Failed to load files');
        }
      } else {
        // Regular users see folder structure
        const response = await apiService.getFolderContents(path);
        if (response.success) {
          setFolderContent(response.data);
          setAllFiles(null); // Clear all files for regular view
        } else {
          setError('Failed to load folder content');
        }
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

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
    allFiles,
    loading,
    error,
    defaultViewMode,
    isAdmin: isAdmin(),
    loadFolderContent,
    navigateToPath,
    navigateToParent,
    getBreadcrumbs,
    handleBreadcrumbClick,
    updateDefaultViewMode,
    setError
  };
};