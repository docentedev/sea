import React, { forwardRef } from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  endButton?: React.ReactNode;
  error?: boolean;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ startIcon, endIcon, endButton, error, fullWidth = true, className = '', ...props }, ref) => {
    const baseClasses = "block box-border py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-100 placeholder-gray-400";

    // Dynamic padding classes based on icons and button
    let paddingClasses = "px-4";
    if (startIcon && (endIcon || endButton)) {
      paddingClasses = "pl-12 pr-12";
    } else if (startIcon) {
      paddingClasses = "pl-12 pr-4";
    } else if (endIcon || endButton) {
      paddingClasses = "pl-4 pr-12";
    }

    const widthClasses = fullWidth ? "w-full" : "";

    const errorClasses = error
      ? "border-red-300 bg-red-900/20 focus:ring-red-500 focus:border-red-500"
      : "border-gray-600 bg-gray-800";

    const finalClassName = `${baseClasses} ${paddingClasses} ${widthClasses} ${errorClasses} ${className}`.trim();

    return (
      <div className="relative">
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {startIcon}
          </div>
        )}
        <input
          ref={ref}
          className={finalClassName}
          {...props}
        />
        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            {endIcon}
          </div>
        )}
        {endButton && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            {endButton}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;