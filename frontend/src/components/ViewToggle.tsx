import React from 'react';
import { Grid3X3, List } from 'lucide-react';
import { Button } from './Button';

interface ViewToggleProps<T extends string> {
    value: T;
    onChange: (value: T) => void;
    options: Array<{
        value: T;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
    }>;
    label?: string;
}

export const ViewToggle = <T extends string>({
    value,
    onChange,
    options,
    label
}: ViewToggleProps<T>) => {
    return (
        <div className="flex items-center space-x-2">
            {label && (
                <span className="text-sm text-gray-400">{label}</span>
            )}
            <div className="flex items-center border border-gray-700 rounded-md">
                {options.map((option, index) => {
                    const Icon = option.icon;
                    const isFirst = index === 0;
                    const isLast = index === options.length - 1;
                    const isActive = value === option.value;

                    return (
                        <Button
                            key={option.value}
                            variant="ghost"
                            size="sm"
                            className={`${isFirst ? 'rounded-r-none' : isLast ? 'rounded-l-none' : 'rounded-none'
                                } ${!isLast ? 'border-r border-gray-400' : ''
                                } ${isActive ? 'text-gray-100' : ''
                                }`}
                            onClick={() => onChange(option.value)}
                            title={option.label}
                        >
                            <Icon className={`h-4 w-4 ${isActive ? 'text-gray-100' : 'text-gray-400'}`} />
                        </Button>
                    );
                })}
            </div>
        </div>
    );
};

// Convenience component for common card/table view toggle
interface CardTableToggleProps {
    value: 'cards' | 'table';
    onChange: (value: 'cards' | 'table') => void;
    label?: string;
}

export const CardTableToggle: React.FC<CardTableToggleProps> = ({
    value,
    onChange,
    label = 'Vista:'
}) => {
    return (
        <ViewToggle
            value={value}
            onChange={onChange}
            label={label}
            options={[
                {
                    value: 'cards',
                    label: 'Vista de tarjetas',
                    icon: Grid3X3
                },
                {
                    value: 'table',
                    label: 'Vista de tabla',
                    icon: List
                }
            ]}
        />
    );
};