import React from 'react';

export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'outline'
    | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xs';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isActive?: boolean;
    isLoading?: boolean;
    children: React.ReactNode;
}

// --- REFRACTORIZADO PARA DARK MODE ---
// Se han optimizado los colores para que el texto blanco (text-white) o gris claro (text-gray-200/300)
// contraste perfectamente con los fondos oscuros.
const variantClasses: Record<ButtonVariant, string> = {
    // PRIMARY: Tono azul oscuro más profundo. El focus offset es clave para el dark mode.
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-transparent shadow-lg hover:shadow-xl focus:ring-blue-500 focus:ring-offset-2 disabled:from-blue-400 disabled:to-blue-500 focus:ring-offset-gray-900',
    // SECONDARY: Mejor contraste. Fondo más oscuro con texto gris claro.
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600 shadow-sm hover:shadow-md focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-800 disabled:text-gray-500 focus:ring-offset-gray-900',
    // SUCCESS: Tono verde oscuro más profundo.
    success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-transparent shadow-lg hover:shadow-xl focus:ring-green-500 focus:ring-offset-2 disabled:from-green-400 disabled:to-green-500 focus:ring-offset-gray-900',
    // DANGER: Tono rojo oscuro más profundo.
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-transparent shadow-lg hover:shadow-xl focus:ring-red-500 focus:ring-offset-2 disabled:from-red-400 disabled:to-red-500 focus:ring-offset-gray-900',
    // OUTLINE: Fondo transparente oscuro con texto azul vibrante.
    outline: 'bg-transparent hover:bg-blue-900/40 text-blue-400 border-blue-700 shadow-sm hover:shadow-md hover:border-blue-600 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-transparent disabled:text-blue-500 disabled:border-blue-800 focus:ring-offset-gray-900',
    // GHOST: Transparente con hover sutil.
    ghost: 'bg-transparent hover:bg-gray-700/50 text-gray-300 border-transparent shadow-none hover:shadow-sm focus:ring-gray-500 focus:ring-offset-2 disabled:bg-transparent disabled:text-gray-600 focus:ring-offset-gray-900'
};

const activeVariantClasses: Record<ButtonVariant, string> = {
    // ACTIVE: Mantener el efecto de "presionado" (shadow-inner) sobre fondo oscuro.
    primary: 'bg-gradient-to-r from-blue-700 to-blue-800 text-white border-blue-500 shadow-inner',
    secondary: 'bg-gray-600 text-gray-100 border-gray-500 shadow-inner',
    success: 'bg-gradient-to-r from-green-700 to-green-800 text-white border-green-500 shadow-inner',
    danger: 'bg-gradient-to-r from-red-700 to-red-800 text-white border-red-500 shadow-inner',
    outline: 'bg-blue-900/40 text-blue-300 border-blue-600 shadow-inner',
    ghost: 'bg-gray-700/50 text-gray-300 border-transparent shadow-inner'
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-2 text-sm font-medium min-h-[36px]',
    md: 'px-4 py-2.5 text-sm font-medium min-h-[40px]',
    lg: 'px-6 py-3 text-base font-medium min-h-[48px]',
    xs: 'px-2 py-1 text-xs font-medium min-h-[28px]'
};

export const Button: React.FC<ButtonProps> = ({
    variant = 'secondary',
    size = 'md',
    isActive = false,
    isLoading = false,
    disabled = false,
    className = '',
    children,
    ...props
}) => {
    // baseClasses: Se asegura un contraste en el spinner de carga (currentColor)
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 transform hover:scale-[1.02] active:scale-[0.98]';

    const variantClass = isActive ? activeVariantClasses[variant] : variantClasses[variant];
    const sizeClass = sizeClasses[size];

    const combinedClassName = `${baseClasses} ${sizeClass} ${variantClass} ${className}`.trim();

    return (
        <button
            className={combinedClassName}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    {/* Texto de carga en modo oscuro: el color se heredará del 'variant' */}
                    <span>Cargando...</span>
                </>
            ) : (
                children
            )}
        </button>
    );
};