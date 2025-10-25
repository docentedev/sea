import React from 'react';
import { Home, Folder, ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  breadcrumbs: string[];
  onBreadcrumbClick: (index: number) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ breadcrumbs, onBreadcrumbClick }) => {
  const getBreadcrumbIcon = (index: number) => {
    if (index === 0) {
      return <Home className="w-4 h-4 mr-2" />;
    }
    return <Folder className="w-4 h-4 mr-2" />;
  };

  const getBreadcrumbText = (crumb: string, index: number) => {
    if (index === 0) return 'Home';
    return crumb;
  };

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRight className='text-gray-200' />
            )}
            <button
              onClick={() => onBreadcrumbClick(index)}
              className={`inline-flex items-center text-sm font-medium transition-colors duration-200 border-none bg-transparent ${
                index === breadcrumbs.length - 1
                  ? 'text-gray-200 cursor-default'
                  : 'text-blue-300 hover:text-blue-200 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-gray-800'
              }`}
              disabled={index === breadcrumbs.length - 1}
              title={index === 0 ? 'Go to root directory' : `Go to ${crumb}`}
            >
              {getBreadcrumbIcon(index)}
              <span className="truncate max-w-32">{getBreadcrumbText(crumb, index)}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};