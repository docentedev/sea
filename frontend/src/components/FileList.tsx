import React from 'react';
import type { Folder, FileInfo } from '../types/api';

interface FileListProps {
    folders: Folder[];
    files: FileInfo[];
    allowSelection: boolean;
    selectedItems: Set<number>;
    onFolderClick: (folder: Folder) => void;
    onFileClick: (file: FileInfo) => void;
    onItemSelect: (itemId: number) => void;
    onDeleteClick: (type: 'file' | 'folder', id: number, name: string, path?: string) => void;
    onDownloadClick: (file: FileInfo) => void;
    onShareClick?: (file: FileInfo) => void;
    onCopyLinkClick?: (file: FileInfo, link: string) => void;
    onRevokeLinkClick?: (file: FileInfo, link: string) => void;
    formatFileSize: (bytes: number) => string;
}

export const FileList: React.FC<FileListProps> = ({
    folders,
    files,
    allowSelection,
    selectedItems,
    onFolderClick,
    onFileClick,
    onItemSelect,
    onDeleteClick,
    formatFileSize,
    onShareClick,
    onCopyLinkClick,
    onRevokeLinkClick,
}) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf': return '📄';
            case 'doc':
            case 'docx': return '📝';
            case 'xls':
            case 'xlsx': return '📊';
            case 'ppt':
            case 'pptx': return '📽️';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif': return '🖼️';
            case 'mp4':
            case 'avi':
            case 'mov': return '🎥';
            case 'mp3':
            case 'wav': return '🎵';
            case 'zip':
            case 'rar': return '📦';
            default: return '📄';
        }
    };

    const renderGridView = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 pt-2">
            {/* Folders */}
            {folders.map((folder) => (
                <div
                    key={`folder-${folder.id}`}
                    className={`bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer ${selectedItems.has(folder.id) ? 'ring-2 ring-blue-400 bg-blue-900' : ''
                        }`}
                    onClick={() => onFolderClick(folder)}
                >
                    {allowSelection && (
                        <div className="flex justify-end mb-2">
                            <input
                                type="checkbox"
                                checked={selectedItems.has(folder.id)}
                                onChange={() => onItemSelect(folder.id)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}
                    <div className="text-center">
                        <div className="text-4xl mb-2">📁</div>
                        <div className="font-medium text-gray-100 text-sm truncate" title={folder.name}>
                            {folder.name}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            {formatDate(folder.created_at)}
                        </div>
                        <div className="mt-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteClick('folder', folder.id, folder.name, folder.path);
                                }}
                                className="text-red-400 hover:text-red-300 text-xs"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Files */}
            {files.map((file) => (
                <div
                    key={`file-${file.id}`}
                    className={`bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer ${selectedItems.has(file.id) ? 'ring-2 ring-blue-400 bg-blue-900' : ''}`}
                    onClick={() => onFileClick(file)}
                >
                    {allowSelection && (
                        <div className="flex justify-end mb-2">
                            <input
                                type="checkbox"
                                checked={selectedItems.has(file.id)}
                                onChange={() => onItemSelect(file.id)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}
                    <div className="text-center">
                        <div className="text-4xl mb-2">{getFileIcon(file.original_filename)}</div>
                        <div className="font-medium text-gray-100 text-sm truncate" title={file.original_filename}>
                            {file.original_filename}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            {formatFileSize(file.size)}
                        </div>
                        <div className="text-xs text-gray-400">
                            {formatDate(file.created_at)}
                        </div>
                        <div className="mt-2">
                                                        {file.sharedLink && !file.sharedLink.revoked ? (
                                                            <div className="flex flex-col items-center gap-1 mb-2">
                                                                <span className="inline-flex items-center text-green-400 text-xs">
                                                                    <span role="img" aria-label="Compartido" className="mr-1">🔗</span>
                                                                    <a
                                                                        href={`/public/shared/${file.sharedLink.token}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="underline text-green-400"
                                                                    >
                                                                        Compartido
                                                                    </a>
                                                                </span>
                                                                <button
                                                                    className="text-blue-400 hover:text-blue-300 text-xs"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (onCopyLinkClick && file.sharedLink) onCopyLinkClick(file, `${window.location.origin}/public/shared/${file.sharedLink.token}`);
                                                                    }}
                                                                >
                                                                    Copiar link
                                                                </button>
                                                                <button
                                                                    className="text-red-400 hover:text-red-300 text-xs"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (onRevokeLinkClick && file.sharedLink) onRevokeLinkClick(file, file.sharedLink.token);
                                                                    }}
                                                                >
                                                                    Revocar
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (onShareClick) onShareClick(file);
                                                                }}
                                                                className="text-blue-400 hover:text-blue-300 text-xs mr-2"
                                                            >
                                                                Compartir
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteClick('file', file.id, file.original_filename);
                                                            }}
                                                            className="text-red-400 hover:text-red-300 text-xs"
                                                        >
                                                            Delete
                                                        </button>
                        </div>
                    </div>
                </div>
            ))}

            {folders.length === 0 && files.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400">
                    This folder is empty
                </div>
            )}
        </div>
    );

    return renderGridView();
};