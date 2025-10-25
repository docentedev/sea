import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  helpText,
  className = '',
  children
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-100">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-300 flex items-center">
          <AlertTriangle className="w-4 h-4 mr-1 flex-shrink-0" />
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="text-xs text-gray-400">{helpText}</p>
      )}
    </div>
  );
};

export default FormField;