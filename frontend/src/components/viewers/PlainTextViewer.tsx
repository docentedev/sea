import React, { useState, useEffect } from 'react';
import type { FileViewerProps } from './FileViewerRegistry';
import { AlertTriangle } from 'lucide-react';

export const PlainTextViewer: React.FC<FileViewerProps> = ({ file, fileUrl }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadText = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        if (isMounted) {
          setContent(text);
        }
      } catch (err) {
        console.error('Error loading text file:', err);
        if (isMounted) {
          setError('Failed to load text file');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadText();

    return () => {
      isMounted = false;
    };
  }, [fileUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 text-sm text-gray-400 text-center">
        <p>{file.original_filename}</p>
        <p>{file.size ? `${(file.size / 1024).toFixed(2)} KB` : ''}</p>
      </div>
      <div className="flex-1 border rounded-md overflow-auto">
        <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words bg-gray-50 min-h-[400px]">
          {content}
        </pre>
      </div>
    </div>
  );
};