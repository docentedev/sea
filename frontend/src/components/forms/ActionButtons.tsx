import React from 'react';
import { Button } from '../Button';

interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

interface ActionButtonsProps {
  actions: ActionButton[];
  align?: 'left' | 'center' | 'right' | 'between' | 'around' | 'evenly';
  className?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
}

const alignClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly'
};

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  actions,
  align = 'right',
  className = '',
  buttonSize = 'md'
}) => {
  return (
    <div className={`flex gap-3 ${alignClasses[align]} ${className}`}>
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || 'secondary'}
          size={buttonSize}
          onClick={action.onClick}
          disabled={action.disabled}
          isLoading={action.loading}
        >
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </Button>
      ))}
    </div>
  );
};