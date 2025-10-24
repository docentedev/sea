import React from 'react';

interface MenuProps {
  children: React.ReactNode;
}

export const Menu: React.FC<MenuProps> = ({ children }) => {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
      {children}
    </div>
  );
};

interface MenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({ children, onClick, href }) => {
  if (href) {
    return (
      <a
        href={href}
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      >
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    >
      {children}
    </button>
  );
};