import React, { useState, useEffect, useRef } from 'react';
import { useProjects } from '../context/ProjectsContext';
import { useUsers } from '../context/UsersContext';
import { Project, User } from '../types';
import { ExclamationTriangleIcon, CheckCircleIcon, ClockIcon, BellIcon } from './Icons';

interface Notification {
  id: string;
  type: 'warning' | 'success' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: () => void;
}

const NotificationsSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { projects } = useProjects();
  const { users } = useUsers();
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
    // Generate notifications based on system state
    const newNotifications: Notification[] = [];
    
    // Check if we should create system notifications
    const shouldCreateSystemNotifications = () => {
      const lastCheck = localStorage.getItem('lastSystemNotificationCheck');
      const now = new Date().getTime();
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
      
      if (!lastCheck || (now - parseInt(lastCheck)) > oneHour) {
        localStorage.setItem('lastSystemNotificationCheck', now.toString());
        return true;
      }
      return false;
    };

    // Check for projects with low budget
    projects.forEach(project => {
      if (!project.isArchived) {
        const remainingBudget = project.contractAmount - project.totalExpenses;
        const budgetPercentage = (remainingBudget / project.contractAmount) * 100;
        
        if (budgetPercentage < 20 && budgetPercentage > 0) {
          newNotifications.push({
            id: `low-budget-${project.id}`,
            type: 'warning',
            title: 'תקציב נמוך',
            message: `פרויקט "${project.name}" נותר לו ${budgetPercentage.toFixed(1)}% מהתקציב`,
            timestamp: new Date(),
            read: false,
            action: () => {
              window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'projectView', projectId: project.id } }));
            }
          });
        }
      }
    });

    // Check for overdue milestones
    projects.forEach(project => {
      if (!project.isArchived && project.milestones) {
        project.milestones.forEach(milestone => {
          if (!milestone.completed && milestone.dueDate) {
            const dueDate = new Date(milestone.dueDate);
            const today = new Date();
            const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysOverdue > 0) {
              newNotifications.push({
                id: `overdue-milestone-${milestone.id}`,
                type: 'error',
                title: 'מיילסטון באיחור',
                message: `מיילסטון "${milestone.name}" באיחור של ${daysOverdue} ימים`,
                timestamp: new Date(),
                read: false,
                action: () => {
                  window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'projectView', projectId: project.id } }));
                }
              });
            }
          }
        });
      }
    });

    // Check for inactive users
    users.forEach(user => {
      if (user.lastLogin) {
        const lastLogin = new Date(user.lastLogin);
        const today = new Date();
        const daysSinceLogin = Math.ceil((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLogin > 30) {
          newNotifications.push({
            id: `inactive-user-${user.id}`,
            type: 'info',
            title: 'משתמש לא פעיל',
            message: `משתמש "${user.username}" לא התחבר ${daysSinceLogin} ימים`,
            timestamp: new Date(),
            read: false
          });
        }
      }
    });

    // Check for projects without milestones
    projects.forEach(project => {
      if (!project.isArchived && (!project.milestones || project.milestones.length === 0)) {
        newNotifications.push({
          id: `no-milestones-${project.id}`,
          type: 'warning',
          title: 'פרויקט ללא מיילסטונס',
          message: `פרויקט "${project.name}" לא מוגדרים לו מיילסטונס`,
          timestamp: new Date(),
          read: false,
          action: () => {
            window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'projectView', projectId: project.id } }));
          }
        });
      }
    });

    setNotifications(newNotifications);
    
    // Send system notifications to users if needed
    if (shouldCreateSystemNotifications() && newNotifications.length > 0) {
      newNotifications.forEach(notification => {
        // Create user notification
        const userNotification = {
          id: `system-${notification.id}-${Date.now()}`,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          targetUsers: [], // System notifications go to all users
          createdBy: 'system',
          createdAt: new Date().toISOString(),
          isRead: {}
        };

        // Save to localStorage
        const existingNotifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
        const updatedNotifications = [...existingNotifications, userNotification];
        localStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));

        // Dispatch event
        window.dispatchEvent(new CustomEvent('newNotification', { 
          detail: userNotification 
        }));
      });
    }
  }, [projects, users]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">התראות</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  סמן הכל כנקרא
                </button>
              )}
            </div>
          </div>
          
          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BellIcon />
                <p className="mt-2 text-sm sm:text-base">אין התראות חדשות</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 mb-2 rounded-lg border cursor-pointer hover:shadow-md transition-all duration-200 ${
                    notification.read ? 'opacity-60' : ''
                  } ${getNotificationColor(notification.type)}`}
                  onClick={() => {
                    if (notification.action) {
                      notification.action();
                    }
                    markAsRead(notification.id);
                  }}
                >
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium break-words">{notification.title}</p>
                      <p className="text-xs sm:text-sm opacity-75 mt-1 break-words">{notification.message}</p>
                      <p className="text-xs opacity-50 mt-1">
                        {notification.timestamp.toLocaleString('he-IL')}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsSystem;
