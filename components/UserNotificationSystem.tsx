import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { BellIcon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon } from './Icons';
import { notificationsApi, Notification } from '../services/notificationsApi';

// Use the imported Notification interface

const UserNotificationSystem: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.id) return;
      
      try {
        const userNotifications = await notificationsApi.getNotifications(user.id);
        setNotifications(userNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();

    // Listen for new notifications
    const handleNewNotification = (event: CustomEvent) => {
      const newNotification = event.detail;
      setNotifications(prev => [...prev, newNotification]);
    };

    window.addEventListener('newNotification', handleNewNotification as EventListener);
    
    return () => {
      window.removeEventListener('newNotification', handleNewNotification as EventListener);
    };
  }, [user?.id]);

  // Filter notifications for current user
  const userNotifications = notifications.filter(notification => 
    notification.targetUsers.includes(user?.id || '') || 
    notification.targetUsers.length === 0 // Global notifications
  );

  const unreadCount = userNotifications.filter(n => !n.isRead[user?.id || '']).length;

  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;
    
    try {
      await notificationsApi.markAsRead(notificationId, user.id);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { 
                ...notification, 
                isRead: { 
                  ...notification.isRead, 
                  [user.id]: true 
                } 
              }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await notificationsApi.markAllAsRead(user.id);
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          isRead: {
            ...notification.isRead,
            [user.id]: true
          }
        }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon />;
      case 'success':
        return <CheckCircleIcon />;
      case 'error':
        return <ExclamationTriangleIcon />;
      default:
        return <ClockIcon />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors duration-200"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 sm:w-72 md:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 sm:max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">התראות</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  סמן הכל כנקרא
                </button>
              )}
            </div>
          </div>
          
          <div className="p-2">
            {userNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BellIcon />
                <p className="mt-2 text-sm sm:text-base">אין התראות חדשות</p>
              </div>
            ) : (
              userNotifications
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(notification => {
                  const isRead = notification.isRead[user?.id || ''];
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-3 mb-2 rounded-lg border cursor-pointer hover:shadow-md transition-all duration-200 ${
                        isRead ? 'opacity-60' : ''
                      } ${getNotificationColor(notification.type)}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium break-words">{notification.title}</p>
                          <p className="text-xs sm:text-sm opacity-75 mt-1 break-words">{notification.message}</p>
                          <p className="text-xs opacity-50 mt-1">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                        {!isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserNotificationSystem;
