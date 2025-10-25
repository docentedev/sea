import React, { useState, useEffect } from 'react';
import type { FileViewerProps } from './FileViewerRegistry';

interface CodeLanguage {
  name: string;
  extensions: string[];
  keywords: string[];
  commentStyle: 'single' | 'multi' | 'both';
  singleComment?: string;
  multiCommentStart?: string;
  multiCommentEnd?: string;
}

const LANGUAGES: Record<string, CodeLanguage> = {
  javascript: {
    name: 'JavaScript',
    extensions: ['js', 'jsx', 'mjs'],
    keywords: ['const', 'let', 'var', 'function', 'class', 'if', 'else', 'for', 'while', 'return', 'import', 'export', 'async', 'await', 'try', 'catch'],
    commentStyle: 'both',
    singleComment: '//',
    multiCommentStart: '/*',
    multiCommentEnd: '*/'
  },
  typescript: {
    name: 'TypeScript',
    extensions: ['ts', 'tsx'],
    keywords: ['const', 'let', 'var', 'function', 'class', 'interface', 'type', 'if', 'else', 'for', 'while', 'return', 'import', 'export', 'async', 'await', 'try', 'catch', 'public', 'private', 'protected'],
    commentStyle: 'both',
    singleComment: '//',
    multiCommentStart: '/*',
    multiCommentEnd: '*/'
  },
  python: {
    name: 'Python',
    extensions: ['py', 'pyw'],
    keywords: ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'return', 'import', 'from', 'try', 'except', 'with', 'as', 'lambda', 'and', 'or', 'not', 'in', 'is'],
    commentStyle: 'single',
    singleComment: '#'
  },
  java: {
    name: 'Java',
    extensions: ['java'],
    keywords: ['public', 'private', 'protected', 'class', 'interface', 'if', 'else', 'for', 'while', 'return', 'import', 'package', 'static', 'final', 'void', 'int', 'String', 'boolean'],
    commentStyle: 'both',
    singleComment: '//',
    multiCommentStart: '/*',
    multiCommentEnd: '*/'
  },
  css: {
    name: 'CSS',
    extensions: ['css'],
    keywords: ['color', 'background', 'margin', 'padding', 'border', 'width', 'height', 'display', 'position', 'float', 'font-size', 'text-align'],
    commentStyle: 'multi',
    multiCommentStart: '/*',
    multiCommentEnd: '*/'
  },
  html: {
    name: 'HTML',
    extensions: ['html', 'htm'],
    keywords: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'a', 'img', 'input', 'button', 'form', 'table', 'tr', 'td', 'th'],
    commentStyle: 'multi',
    multiCommentStart: '<!--',
    multiCommentEnd: '-->'
  }
};

export const CodeViewer: React.FC<FileViewerProps> = ({ file, fileUrl }) => {
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<CodeLanguage | null>(null);

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

        // Detect language based on file extension
        const extension = file.original_filename.split('.').pop()?.toLowerCase();
        if (extension) {
          const detectedLang = Object.values(LANGUAGES).find(lang =>
            lang.extensions.includes(extension)
          );
          setLanguage(detectedLang || null);
        }
      } catch (err) {
        console.error('Error loading code file:', err);
        setError('Failed to load file');
      }
    };

    loadContent();
  }, [fileUrl, file.original_filename]);

  const highlightCode = (code: string): React.ReactElement => {
    if (!language) {
      return <span style={{ color: '#e5e7eb', whiteSpace: 'pre' }}>{code}</span>;
    }

    const lines = code.split('\n');

    return (
      <div>
        {lines.map((line, lineIndex) => {
          const highlightedParts: React.ReactElement[] = [];
          let lastIndex = 0;

          // Create regex patterns
          const keywordRegex = new RegExp(`\\b(${language.keywords.join('|')})\\b`, 'g');
          const numberRegex = /\b\d+(\.\d+)?\b/g;
          const stringRegex = /(["'`])(.*?)\1/g;

          // Reset regex lastIndex
          keywordRegex.lastIndex = 0;
          numberRegex.lastIndex = 0;
          stringRegex.lastIndex = 0;

          // Combine all matches with their positions
          const matches: Array<{ start: number; end: number; type: string; text: string }> = [];

          // Find keywords
          let match;
          while ((match = keywordRegex.exec(line)) !== null) {
            matches.push({
              start: match.index,
              end: match.index + match[0].length,
              type: 'keyword',
              text: match[0]
            });
          }

          // Find strings
          while ((match = stringRegex.exec(line)) !== null) {
            matches.push({
              start: match.index,
              end: match.index + match[0].length,
              type: 'string',
              text: match[0]
            });
          }

          // Find numbers
          while ((match = numberRegex.exec(line)) !== null) {
            matches.push({
              start: match.index,
              end: match.index + match[0].length,
              type: 'number',
              text: match[0]
            });
          }

          // Sort matches by start position
          matches.sort((a, b) => a.start - b.start);

          // Remove overlapping matches (prefer strings over keywords/numbers)
          const filteredMatches = matches.filter((match, index) => {
            if (match.type === 'string') return true;
            // Check if this match overlaps with any string
            return !matches.some((other, otherIndex) =>
              otherIndex !== index && other.type === 'string' &&
              match.start < other.end && match.end > other.start
            );
          });

          // Build highlighted line
          filteredMatches.forEach((match) => {
            // Add text before match
            if (lastIndex < match.start) {
              const beforeText = line.slice(lastIndex, match.start);
              if (beforeText) {
                highlightedParts.push(
                  <span key={`text-${lastIndex}`} style={{ color: '#e5e7eb', whiteSpace: 'pre' }}>
                    {beforeText}
                  </span>
                );
              }
            }

            // Add highlighted match
            let color = '#e5e7eb'; // default gray
            if (match.type === 'keyword') color = '#60a5fa'; // blue
            else if (match.type === 'string') color = '#34d399'; // green
            else if (match.type === 'number') color = '#a78bfa'; // purple

            highlightedParts.push(
              <span key={`match-${match.start}`} style={{ color, fontWeight: match.type === 'keyword' ? '600' : 'normal', whiteSpace: 'pre' }}>
                {match.text}
              </span>
            );

            lastIndex = match.end;
          });

          // Add remaining text
          if (lastIndex < line.length) {
            const remainingText = line.slice(lastIndex);
            highlightedParts.push(
              <span key={`remaining-${lastIndex}`} style={{ color: '#e5e7eb', whiteSpace: 'pre' }}>
                {remainingText}
              </span>
            );
          }

          return (
            <div key={lineIndex} style={{ display: 'flex', minHeight: '1.5em', alignItems: 'flex-start' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '3rem',
                  flexShrink: 0,
                  textAlign: 'right',
                  color: '#6b7280',
                  marginRight: '1rem',
                  userSelect: 'none',
                  fontSize: '0.875rem',
                  lineHeight: '1.5'
                }}
              >
                {lineIndex + 1}
              </span>
              <span style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: '1.5', overflowWrap: 'break-word' }}>
                {highlightedParts.length > 0 ? highlightedParts : <span style={{ color: '#e5e7eb', whiteSpace: 'pre-wrap' }}>{line || '\u00A0'}</span>}
              </span>
            </div>
          );
        })}
      </div>
    );
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
      {/* Header with info */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
        <div className="text-sm text-gray-600">
          {language ? `${language.name} code` : 'Code file'}
        </div>
        <div className="text-sm text-gray-400">
          {file.original_filename} ({(file.size / 1024).toFixed(1)} KB)
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-900 rounded p-4">
        <div className="font-mono text-sm text-gray-100">
          {highlightCode(content)}
        </div>
      </div>
    </div>
  );
};