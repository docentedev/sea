import React from 'react';

interface FieldGroupProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  required?: boolean;
}

export const FieldGroup: React.FC<FieldGroupProps> = ({
  children,
  title,
  description,
  className = '',
  required = false
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {title && (
        <label className="block text-sm font-medium text-gray-300">
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {description && (
        <p className="text-sm text-gray-400">{description}</p>
      )}
      {children}
    </div>
  );
};