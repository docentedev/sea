import React, { useState, useEffect } from 'react';
import type { Folder } from '../types/api';

interface TreeNode {
  folder: Folder;
  children: TreeNode[];
  expanded: boolean;
  level: number;
}

interface FolderTreeSelectorProps {
  folders: Folder[];
  selectedPath: string;
  onSelectPath: (path: string) => void;
  disabled?: boolean;
  currentPath?: string;
}

export const FolderTreeSelector: React.FC<FolderTreeSelectorProps> = ({
  folders,
  selectedPath,
  onSelectPath,
  disabled = false,
  currentPath
}) => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);

  useEffect(() => {
    const buildTree = (folders: Folder[], parentPath: string | null = null, level = 0): TreeNode[] => {
      // Handle root level folders (those with null parent_path or parent_path === '/')
      const children = folders.filter(f => {
        if (parentPath === null) {
          return f.parent_path === null || f.parent_path === '/' || f.parent_path === '';
        }
        return f.parent_path === parentPath;
      });

      return children.map(folder => ({
        folder,
        children: buildTree(folders, folder.path, level + 1),
        expanded: false, // Tree closed by default
        level
      }));
    };

    const tree = buildTree(folders);
    setTreeData(tree);
  }, [folders]);

  const toggleExpanded = (node: TreeNode) => {
    const updateTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(n => {
        if (n === node) {
          return { ...n, expanded: !n.expanded };
        }
        if (n.children.length > 0) {
          return { ...n, children: updateTree(n.children) };
        }
        return n;
      });
    };

    setTreeData(updateTree(treeData));
  };

  const renderTreeNode = (node: TreeNode): React.ReactNode => {
    const { folder, children, expanded, level } = node;
    const hasChildren = children.length > 0;
    const isSelected = selectedPath === folder.path;
    const isCurrentPath = currentPath === folder.path;
    const indent = level * 20;

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded-md ${
            isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
          } ${disabled || isCurrentPath ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ paddingLeft: `${12 + indent}px` }}
          onClick={() => !disabled && !isCurrentPath && onSelectPath(folder.path)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node);
              }}
              className="mr-2 p-1 hover:bg-gray-200 rounded text-xs font-bold w-5 h-5 flex items-center justify-center"
              disabled={disabled}
            >
              {expanded ? '−' : '+'}
            </button>
          ) : (
            <div className="w-7" />
          )}
          <span className="text-xl mr-3">📁</span>
          <span className="font-medium">{folder.name}</span>
        </div>

        {hasChildren && expanded && (
          <div>
            {children.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border border-gray-300 rounded-md max-h-64 overflow-y-auto">
      {/* Root Directory */}
      <div
        className={`flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded-md ${
          selectedPath === '/' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
        } ${disabled || currentPath === '/' ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && currentPath !== '/' && onSelectPath('/')}
      >
        <div className="w-6" />
        <span className="text-xl mr-3">📁</span>
        <span className="font-medium">Root Directory</span>
      </div>

      {/* Tree nodes */}
      {treeData.map(node => renderTreeNode(node))}
    </div>
  );
};