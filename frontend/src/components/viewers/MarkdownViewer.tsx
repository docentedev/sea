import React, { useState, useEffect } from 'react';
import type { FileViewerProps } from './FileViewerRegistry';
import { Button } from '../Button';

export const MarkdownViewer: React.FC<FileViewerProps> = ({ file, fileUrl }) => {
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'rendered' | 'source'>('rendered');

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to load file: ${response.status}`);
        }

        const text = await response.text();
        setContent(text);
        setError(null);
      } catch (err) {
        console.error('Error loading Markdown file:', err);
        setError('Failed to load file');
      }
    };

    loadContent();
  }, [fileUrl]);

  // Basic Markdown to HTML converter (very simplified)
  const markdownToHtml = (markdown: string): string => {
    let html = markdown;
    const codeBlocks: string[] = [];
    const inlineCodes: string[] = [];

    // Extract and protect code blocks
    html = html.replace(/```([\s\S]*?)```/g, (_, content) => {
      codeBlocks.push(content);
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });

    // Extract and protect inline code
    html = html.replace(/`([^`]+)`/g, (_, content) => {
      inlineCodes.push(content);
      return `__INLINE_CODE_${inlineCodes.length - 1}__`;
    });

    // Now apply markdown rules to the remaining text (outside code)
    // Headers with dark mode styling
    html = html.replace(/^###### (.*$)/gim, '<h6 class="text-lg font-semibold text-gray-100 mt-6 mb-2">$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5 class="text-xl font-semibold text-gray-100 mt-6 mb-2">$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4 class="text-2xl font-semibold text-gray-100 mt-6 mb-2">$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-3xl font-semibold text-gray-100 mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-4xl font-semibold text-gray-100 mt-8 mb-4">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-5xl font-bold text-gray-100 mt-8 mb-4">$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Links with dark mode styling
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>');

    // Lists with dark mode styling
    html = html.replace(/^\* (.*$)/gim, '<li class="text-gray-200 ml-4">$1</li>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="text-gray-200 ml-4">$1</li>');

    // Wrap consecutive list items
    html = html.replace(/(<li>.*<\/li>\s*)+/g, '<ul class="list-disc list-inside space-y-1 my-4">$&</ul>');

    // Tables with dark mode styling
    html = html.replace(/(\|.*\|\n\|[-|:]+\|\n(?:\|.*\|\n)*)/g, (tableMatch) => {
      const lines = tableMatch.trim().split('\n');
      if (lines.length < 2) return tableMatch;

      const headers = lines[0].split('|').slice(1, -1).map(h => h.trim());
      const alignments = lines[1].split('|').slice(1, -1).map(cell => {
        const trimmed = cell.trim();
        if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
        if (trimmed.endsWith(':')) return 'right';
        return 'left';
      });

      const rows = lines.slice(2).map(line =>
        line.split('|').slice(1, -1).map(cell => cell.trim())
      );

      let tableHtml = '<table class="border-collapse border border-gray-600 my-4 w-full">';
      tableHtml += '<thead class="bg-gray-700">';
      tableHtml += '<tr>';
      headers.forEach((header, i) => {
        const align = alignments[i] || 'left';
        tableHtml += `<th class="border border-gray-600 px-4 py-2 text-${align} text-gray-100 font-semibold">${header}</th>`;
      });
      tableHtml += '</tr></thead>';

      tableHtml += '<tbody>';
      rows.forEach(row => {
        tableHtml += '<tr class="border-b border-gray-600">';
        row.forEach((cell, i) => {
          const align = alignments[i] || 'left';
          tableHtml += `<td class="border border-gray-600 px-4 py-2 text-${align} text-gray-200">${cell}</td>`;
        });
        tableHtml += '</tr>';
      });
      tableHtml += '</tbody></table>';

      return tableHtml;
    });

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p class="text-gray-200 leading-relaxed mb-4">');
    html = html.replace(/\n/g, '<br>');

    // Wrap in paragraph tags with dark mode styling
    if (!html.startsWith('<')) {
      html = '<p class="text-gray-200 leading-relaxed mb-4">' + html + '</p>';
    }

    // Restore code blocks with dark mode styling
    codeBlocks.forEach((content, index) => {
      html = html.replace(`__CODE_BLOCK_${index}__`, `<pre class="bg-gray-800 border border-gray-600 rounded-lg p-4 overflow-x-auto my-4"><code class="text-gray-100 font-mono text-sm block">${content}</code></pre>`);
    });

    // Restore inline code with dark mode styling
    inlineCodes.forEach((content, index) => {
      html = html.replace(`__INLINE_CODE_${index}__`, `<code class="bg-gray-700 text-gray-100 px-2 py-1 rounded font-mono text-sm">${content}</code>`);
    });

    return html;

    return html;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 text-gray-100">
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
      <div className="flex items-center justify-between mb-4 pb-2">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            isActive={viewMode === 'rendered'}
            onClick={() => setViewMode('rendered')}
          >
            Rendered
          </Button>
          <Button
            variant="ghost"
            size="sm"
            isActive={viewMode === 'source'}
            onClick={() => setViewMode('source')}
          >
            Source
          </Button>
        </div>
        <div className="text-sm text-gray-400">
          {file.original_filename} ({(file.size / 1024).toFixed(1)} KB)
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-800 rounded border border-gray-600">
        {viewMode === 'rendered' ? (
          <div
            className="p-6 prose prose-sm max-w-none prose-invert"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
          />
        ) : (
          <pre className="p-6 font-mono text-sm whitespace-pre-wrap text-gray-100">
            {content}
          </pre>
        )}
      </div>
    </div>
  );
};