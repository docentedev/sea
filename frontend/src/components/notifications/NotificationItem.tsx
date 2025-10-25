import React, { useEffect } from 'react';
import { Check, X, AlertTriangle, Info, X as CloseIcon } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

interface NotificationItemProps {
  notification: Notification;
  onClose: (id: string) => void;
}

// --- REFRACTORIZADO PARA DARK MODE: ICONOS ---
const getIcon = (type: NotificationType) => {
  // Los colores de los iconos se mantienen vibrantes pero se ajustan a un fondo oscuro
  switch (type) {
    case 'success':
      return <Check className="h-5 w-5 text-green-400" />;
    case 'error':
      return <X className="h-5 w-5 text-red-400" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
    case 'info':
      return <Info className="h-5 w-5 text-blue-400" />;
    default:
      return <Info className="h-5 w-5 text-blue-400" />;
  }
};

// --- REFRACTORIZADO PARA DARK MODE: ESTILOS ---
const getStyles = (type: NotificationType) => {
  // Los fondos se cambian a tonos más oscuros (e.g., -800 o -900) y los bordes a tonos intermedios
  switch (type) {
    case 'success':
      return 'bg-green-900 border-green-700';
    case 'error':
      return 'bg-red-900 border-red-700';
    case 'warning':
      return 'bg-yellow-900 border-yellow-700';
    case 'info':
      return 'bg-blue-900 border-blue-700';
    default:
      return 'bg-gray-800 border-gray-600'; // Fondo por defecto más oscuro
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
  useEffect(() => {
    if (!notification.persistent && notification.duration !== 0) {
      const timer = setTimeout(() => {
        onClose(notification.id);
      }, notification.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  return (
    // Se aplican los estilos de fondo y borde para modo oscuro
    <div className={`rounded-md p-4 border ${getStyles(notification.type)} transition-all duration-300 ease-in-out shadow-lg`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {getIcon(notification.type)}
        </div>
        <div className="ml-3 flex-1">
          {/* Título: se cambia a un color claro (e.g., text-white) */}
          <h3 className="text-sm font-medium text-white">
            {notification.title}
          </h3>
          {notification.message && (
            // Mensaje: se cambia a un gris claro para legibilidad (e.g., text-gray-300)
            <div className="mt-2 text-sm text-gray-300">
              {notification.message}
            </div>
          )}
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              // Botón de cierre: se ajusta a colores que contrasten en fondo oscuro
              className="inline-flex rounded-md p-1.5 text-gray-400 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-400"
              onClick={() => onClose(notification.id)}
            >
              <span className="sr-only">Cerrar</span>
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};