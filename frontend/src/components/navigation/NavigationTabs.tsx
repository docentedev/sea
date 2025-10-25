import React from 'react';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface NavigationTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'buttons';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantClasses = {
  underline: {
    container: 'border-b border-gray-200',
    tab: 'border-b-2 border-transparent px-1 py-2 font-medium text-sm',
    active: 'border-blue-500 text-blue-600',
    inactive: 'text-gray-400 hover:text-gray-300 hover:border-gray-600'
  },
  pills: {
    container: 'bg-gray-800 p-1 rounded-lg',
    tab: 'px-3 py-2 rounded-md font-medium text-sm transition-colors',
    active: 'bg-gray-700 text-gray-100 shadow-sm',
    inactive: 'text-gray-400 hover:text-gray-300'
  },
  buttons: {
    container: 'flex gap-2',
    tab: 'px-4 py-2 rounded-md font-medium text-sm border transition-colors',
    active: 'bg-blue-900 border-blue-700 text-blue-100',
    inactive: 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
  }
};

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base'
};

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'underline',
  size = 'md',
  className = ''
}) => {
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];

  return (
    <div className={`${variantClass.container} ${className}`}>
      <nav className="flex" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={`
                ${variantClass.tab}
                ${sizeClass}
                ${isActive ? variantClass.active : variantClass.inactive}
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                inline-flex items-center gap-2
              `}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`
                  inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium
                  ${isActive ? 'bg-blue-900 text-blue-100' : 'bg-gray-900 text-gray-200'}
                `}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};