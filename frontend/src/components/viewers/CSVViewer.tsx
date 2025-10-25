import React, { useState, useEffect } from 'react';
import type { FileViewerProps } from './FileViewerRegistry';
import { DataTable } from '../data';
import type { Column } from '../data';

interface CSVRow {
  id: string;
  [key: string]: string;
}

export const CSVViewer: React.FC<FileViewerProps> = ({ file, fileUrl }) => {
  const [data, setData] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'raw'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50); // Show 50 rows per page

  // Reset page when file changes
  useEffect(() => {
    setCurrentPage(1);
  }, [fileUrl]);

  // Calculate pagination
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageData = data.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPrevious = () => goToPage(currentPage - 1);
  const goToNext = () => goToPage(currentPage + 1);

  // Generate columns dynamically based on headers
  const columns: Column<CSVRow>[] = headers.map(header => ({
    key: header,
    header: header,
    render: (value) => String(value || '')
  }));

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
      const csvData = parsedLines.slice(1).map((line, rowIndex) => {
        const row: CSVRow = { id: `row-${rowIndex}` };
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
          <p className="mt-2 text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-600">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
              viewMode === 'table'
                ? 'bg-blue-900/50 text-blue-300 border border-blue-600'
                : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
              viewMode === 'raw'
                ? 'bg-blue-900/50 text-blue-300 border border-blue-600'
                : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
            }`}
          >
            Raw
          </button>
        </div>
        <div className="text-sm text-gray-400">
          {file.original_filename} ({data.length} rows, {headers.length} columns)
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'table' ? (
          <>
            <DataTable
              data={currentPageData}
              columns={columns}
              keyField="id"
              loading={false}
              emptyMessage="No data available"
            />
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {startIndex + 1}-{Math.min(endIndex, data.length)} of {data.length} rows
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={goToPrevious}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-gray-300 transition-colors duration-200"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-1 text-sm border rounded transition-colors duration-200 ${
                            pageNum === currentPage
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-600 hover:bg-gray-700 text-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={goToNext}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
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