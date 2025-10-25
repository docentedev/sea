import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input, { type InputProps } from './Input';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'endIcon' | 'endButton'> {
    showToggle?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ showToggle = true, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);

        const toggleIcon = showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
        ) : (
            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
        );

        return (
            <Input
                ref={ref}
                type={showPassword ? "text" : "password"}
                endButton={showToggle ? (
                    <div
                        onClick={() => setShowPassword(!showPassword)}
                        className="focus:outline-none hover:text-gray-600 transition-colors duration-200"
                        tabIndex={-1}
                    >
                        {toggleIcon}
                    </div>
                ) : undefined}
                {...props}
            />
        );
    }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;