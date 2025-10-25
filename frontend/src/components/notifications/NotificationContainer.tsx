import React from 'react';
import { NotificationItem } from './NotificationItem';
import type { Notification } from './NotificationItem';

interface NotificationContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const getPositionClasses = (position: string) => {
  switch (position) {
    case 'top-right':
      return 'top-0 right-0';
    case 'top-left':
      return 'top-0 left-0';
    case 'bottom-right':
      return 'bottom-0 right-0';
    case 'bottom-left':
      return 'bottom-0 left-0';
    case 'top-center':
      return 'top-0 left-1/2 transform -translate-x-1/2';
    case 'bottom-center':
      return 'bottom-0 left-1/2 transform -translate-x-1/2';
    default:
      return 'top-0 right-0';
  }
};

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onClose,
  position = 'top-right'
}) => {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={`fixed z-50 p-4 space-y-4 ${getPositionClasses(position)}`}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
};