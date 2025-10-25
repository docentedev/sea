import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
  itemClassName?: string;
  activeClassName?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = <ChevronRight className="w-4 h-4 text-gray-400" />,
  className = '',
  itemClassName = '',
  activeClassName = ''
}) => {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400">
                  {separator}
                </span>
              )}

              {item.onClick || item.href ? (
                <button
                  onClick={item.onClick}
                  className={`inline-flex items-center text-sm font-medium transition-colors duration-200 border-none bg-transparent hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded ${itemClassName} ${
                    isLast ? `text-gray-400 cursor-default ${activeClassName}` : 'text-blue-600 hover:underline'
                  }`}
                  disabled={isLast}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </button>
              ) : (
                <span className={`inline-flex items-center text-sm font-medium ${itemClassName} ${
                  isLast ? `text-gray-400 ${activeClassName}` : 'text-gray-300'
                }`}>
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Helper component for common breadcrumb patterns
interface FileBreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
  homeLabel?: string;
  className?: string;
}

export const FileBreadcrumb: React.FC<FileBreadcrumbProps> = ({
  path,
  onNavigate,
  homeLabel = 'Home',
  className = ''
}) => {
  const pathParts = path === '/' ? [] : path.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: homeLabel,
      icon: <Home className="w-4 h-4" />,
      onClick: () => onNavigate('/')
    }
  ];

  let currentPath = '';
  pathParts.forEach((part) => {
    currentPath += `/${part}`;
    breadcrumbs.push({
      label: part,
      onClick: () => onNavigate(currentPath)
    });
  });

  return <Breadcrumb items={breadcrumbs} className={className} />;
};