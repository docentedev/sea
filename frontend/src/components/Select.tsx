import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  error?: boolean;
  fullWidth?: boolean;
  options?: Array<{ value: string | number; label: string; disabled?: boolean }>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ startIcon, endIcon, error, fullWidth = true, className = '', options = [], children, ...props }, ref) => {
    const baseClasses = "block box-border py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-100 bg-gray-800 appearance-none";

    // Dynamic padding classes based on icons
    let paddingClasses = "px-4";
    if (startIcon && endIcon) {
      paddingClasses = "pl-12 pr-12";
    } else if (startIcon) {
      paddingClasses = "pl-12 pr-4";
    } else if (endIcon) {
      paddingClasses = "pl-4 pr-12";
    }

    const widthClasses = fullWidth ? "w-full" : "";

    const errorClasses = error
      ? "border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500"
      : "border-gray-300";

    const finalClassName = `${baseClasses} ${paddingClasses} ${widthClasses} ${errorClasses} ${className}`.trim();

    return (
      <div className="relative">
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            {startIcon}
          </div>
        )}
        <select
          ref={ref}
          className={finalClassName}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
          {children}
        </select>
        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10">
            {endIcon}
          </div>
        )}
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-20">
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;