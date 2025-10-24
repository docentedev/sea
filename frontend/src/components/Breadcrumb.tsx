import React from 'react';

interface BreadcrumbProps {
  breadcrumbs: string[];
  onBreadcrumbClick: (index: number) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ breadcrumbs, onBreadcrumbClick }) => {
  const getBreadcrumbIcon = (index: number) => {
    if (index === 0) {
      return (
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
      </svg>
    );
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
              <svg
                className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
            )}
            <button
              onClick={() => onBreadcrumbClick(index)}
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                index === breadcrumbs.length - 1
                  ? 'text-gray-700 bg-gray-100 cursor-default'
                  : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
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