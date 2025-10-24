import React, { useState, useEffect } from 'react';
import type { FileViewerProps } from './FileViewerRegistry';

interface CSVRow {
  [key: string]: string;
}

export const CSVViewer: React.FC<FileViewerProps> = ({ file, fileUrl }) => {
  const [data, setData] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'raw'>('table');

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to load file: ${response.status}`);
        }

        const text = await response.text();
        parseCSV(text);
      } catch (err) {
        console.error('Error loading CSV file:', err);
        setError('Failed to load file');
      }
    };

    loadContent();
  }, [fileUrl]);

  const parseCSV = (text: string) => {
    try {
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length === 0) {
        setError('Empty CSV file');
        return;
      }

      // Simple CSV parser - handles basic cases
      const parseLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];

          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              // Escaped quote
              current += '"';
              i++; // Skip next quote
            } else {
              // Toggle quote mode
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            // Field separator
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }

        // Add the last field
        result.push(current.trim());
        return result;
      };

      const parsedLines = lines.map(parseLine);

      if (parsedLines.length === 0) {
        setError('No data found in CSV');
        return;
      }

      // First line as headers
      const csvHeaders = parsedLines[0];
      setHeaders(csvHeaders);

      // Remaining lines as data
      const csvData = parsedLines.slice(1).map((line) => {
        const row: CSVRow = {};
        csvHeaders.forEach((header, colIndex) => {
          row[header] = line[colIndex] || '';
        });
        return row;
      });

      setData(csvData);
      setError(null);
    } catch (err) {
      console.error('Error parsing CSV:', err);
      setError('Failed to parse CSV format');
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
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
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'table'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            Table
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
        <div className="text-sm text-gray-500">
          {file.original_filename} ({data.length} rows, {headers.length} columns)
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'table' ? (
          <div className="bg-white border border-gray-200 rounded">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.slice(0, 100).map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {headers.map((header, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {row[header] || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {data.length > 100 && (
                    <tr>
                      <td
                        colSpan={headers.length}
                        className="px-6 py-4 text-center text-sm text-gray-500 bg-gray-50"
                      >
                        ... and {data.length - 100} more rows
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded p-4">
            <pre className="font-mono text-sm whitespace-pre-wrap text-gray-800 max-h-full overflow-auto">
              {data.length > 0 ? (
                [
                  headers.join(','),
                  ...data.map(row => headers.map(header => row[header] || '').join(','))
                ].join('\n')
              ) : (
                'No data available'
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};