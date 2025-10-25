import React, { useState, useEffect } from 'react';
import type { FileViewerProps } from './FileViewerRegistry';

export const JSONViewer: React.FC<FileViewerProps> = ({ file, fileUrl }) => {
  const [content, setContent] = useState<string>('');
  const [parsedJson, setParsedJson] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to load file: ${response.status}`);
        }

        const text = await response.text();
        setContent(text);

        try {
          const parsed = JSON.parse(text);
          setParsedJson(parsed);
          setError(null);
        } catch {
          setError('Invalid JSON format');
          setParsedJson(null);
        }
      } catch (err) {
        console.error('Error loading JSON file:', err);
        setError('Failed to load file');
      }
    };

    loadContent();
  }, [fileUrl]);

  const renderValue = (value: unknown, indent: number = 0): React.ReactElement => {

    if (value === null) {
      return <span className="text-gray-400">null</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="text-purple-600">{value.toString()}</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-blue-600">{value}</span>;
    }

    if (typeof value === 'string') {
      return <span className="text-green-600">"{value}"</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-600">[]</span>;
      }

      return (
        <div>
          <span className="text-gray-600">[</span>
          <div className="ml-4">
            {value.map((item, index) => (
              <div key={index}>
                {renderValue(item, indent)}
                {index < value.length - 1 && <span className="text-gray-600">,</span>}
              </div>
            ))}
          </div>
          <span className="text-gray-600">]</span>
        </div>
      );
    }

    if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>;
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        return <span className="text-gray-600">{'{}'}</span>;
      }

      return (
        <div>
          <span className="text-gray-600">{'{'}</span>
          <div className="ml-4">
            {keys.map((key, index) => (
              <div key={key}>
                <span className="text-red-600">"{key}"</span>
                <span className="text-gray-600">: </span>
                {renderValue(obj[key], indent)}
                {index < keys.length - 1 && <span className="text-gray-600">,</span>}
              </div>
            ))}
          </div>
          <span className="text-gray-600">{'}'}</span>
        </div>
      );
    }

    return <span className="text-gray-600">{String(value)}</span>;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="mt-2 text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('formatted')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'formatted'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            Formatted
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'raw'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            Raw
          </button>
        </div>
        <div className="text-sm text-gray-400">
          {file.original_filename} ({(file.size / 1024).toFixed(1)} KB)
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50 rounded p-4">
        {viewMode === 'formatted' && parsedJson ? (
          <div className="font-mono text-sm">
            {renderValue(parsedJson)}
          </div>
        ) : (
          <pre className="font-mono text-sm whitespace-pre-wrap text-gray-800">
            {content}
          </pre>
        )}
      </div>
    </div>
  );
};