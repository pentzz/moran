import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../context/UsersContext';
import { useProjects } from '../context/ProjectsContext';
import { User, Project } from '../types';
import { notificationsApi, Notification } from '../services/notificationsApi';
import { 
  BellIcon, 
  SendIcon, 
  UserIcon, 
  ProjectIcon, 
  PlusIcon,
  TrashIcon,
  EditIcon,
  SaveIcon,
  CancelIcon
} from './Icons';
import Modal from './Modal';

// Use the imported Notification interface

const AdminNotificationSystem: React.FC = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const { users } = useUsers();
  const { projects } = useProjects();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as Notification['type'],
    targetUsers: [] as string[],
    targetProjectId: ''
  });

  // Only admin can access this
  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="text-lg font-semibold text-red-800 mb-2">🚫 גישה מוגבלת</h3>
            <p className="text-red-600">
              רק מנהל המערכת יכול לשלוח התראות מותאמות אישית.
            </p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // Load all notifications (admin can see all)
      const allNotifications = await notificationsApi.getNotifications(''); // Empty string gets all
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const openModal = (notification?: Notification) => {
    if (notification) {
      setEditingNotification(notification);
      setFormData({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        targetUsers: notification.targetUsers,
        targetProjectId: notification.targetProjectId || ''
      });
    } else {
      setEditingNotification(null);
      setFormData({
        title: '',
        message: '',
        type: 'info',
        targetUsers: [],
        targetProjectId: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNotification(null);
    setFormData({
      title: '',
      message: '',
      type: 'info',
      targetUsers: [],
      targetProjectId: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message || formData.targetUsers.length === 0) return;

    try {
      const newNotification = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        targetUsers: formData.targetUsers,
        targetProjectId: formData.targetProjectId || undefined,
        createdBy: currentUser?.id || ''
      };

      await notificationsApi.addNotification(newNotification);
      await loadNotifications(); // Reload notifications
      closeModal();
    } catch (error) {
      console.error('Error creating notification:', error);
      alert('שגיאה ביצירת ההתראה');
    }
  };

  const deleteNotification = (notificationId: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק את ההתראה?')) {
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      saveNotifications(updatedNotifications);
    }
  };

  const sendNotification = async (notification: Notification) => {
    try {
      // Get target users
      const targetUsers = users.filter(user => notification.targetUsers.includes(user.id));
      
      // The notification is already saved in the database, just dispatch event
      window.dispatchEvent(new CustomEvent('newNotification', { 
        detail: notification 
      }));

      // Show success message
      alert(`התראה נשלחה ל-${targetUsers.length} משתמשים: ${targetUsers.map(u => u.fullName || u.username).join(', ')}`);
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('שגיאה בשליחת ההתראה');
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeIcon = (type: CustomNotification['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">מערכת התראות מתקדמת</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              שליחת התראות מותאמות אישית למשתמשים ספציפיים
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={async () => {
                  try {
                    // Test notification
                    const testNotification = {
                      title: 'התראה לבדיקה',
                      message: 'זוהי התראה לבדיקה מהמערכת',
                      type: 'info' as const,
                      targetUsers: users.map(u => u.id),
                      createdBy: currentUser?.id || ''
                    };
                    
                    await notificationsApi.addNotification(testNotification);
                    
                    // Dispatch event to notify users
                    window.dispatchEvent(new CustomEvent('newNotification', { 
                      detail: { ...testNotification, id: `test-${Date.now()}`, createdAt: new Date().toISOString(), isRead: {} }
                    }));
                    
                    alert('התראה לבדיקה נשלחה לכל המשתמשים');
                    await loadNotifications(); // Reload notifications
                  } catch (error) {
                    console.error('Error sending test notification:', error);
                    alert('שגיאה בשליחת התראה לבדיקה');
                  }
                }}
                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors duration-200"
              >
                בדיקת התראות
              </button>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base"
          >
            <PlusIcon />
            צור התראה חדשה
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">התראות קיימות</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <BellIcon />
              <p className="mt-2">לא נוצרו התראות עדיין</p>
              <p className="text-sm">לחץ "צור התראה חדשה" כדי להתחיל</p>
            </div>
          ) : (
            notifications.map(notification => {
              const targetUsers = users.filter(user => notification.targetUsers.includes(user.id));
              const targetProject = notification.targetProjectId ? 
                projects.find(p => p.id === notification.targetProjectId) : null;
              
              return (
                <div key={notification.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getTypeIcon(notification.type)}</span>
                        <h4 className="text-lg font-medium text-gray-900 truncate">
                          {notification.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-3 text-sm sm:text-base">
                        {notification.message}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <UserIcon />
                          <span>{targetUsers.length} משתמשים</span>
                        </div>
                        {targetProject && (
                          <div className="flex items-center gap-1">
                            <ProjectIcon />
                            <span>{targetProject.name}</span>
                          </div>
                        )}
                        <div>
                          נוצר: {new Date(notification.createdAt).toLocaleDateString('he-IL')}
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">נשלח ל:</p>
                        <div className="flex flex-wrap gap-1">
                          {targetUsers.map(user => (
                            <span key={user.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {user.fullName || user.username}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => sendNotification(notification)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="שלח התראה"
                      >
                        <SendIcon />
                      </button>
                      <button
                        onClick={() => openModal(notification)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="ערוך התראה"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="מחק התראה"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create/Edit Notification Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingNotification ? 'ערוך התראה' : 'צור התראה חדשה'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              כותרת ההתראה *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="כותרת ההתראה"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              תוכן ההתראה *
            </label>
            <textarea
              required
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="תוכן ההתראה"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              סוג ההתראה
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CustomNotification['type'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="info">מידע</option>
              <option value="success">הצלחה</option>
              <option value="warning">אזהרה</option>
              <option value="error">שגיאה</option>
            </select>
          </div>

          {/* Target Users */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              משתמשים יעד *
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
              {users.map(user => (
                <label key={user.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.targetUsers.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ 
                          ...prev, 
                          targetUsers: [...prev.targetUsers, user.id] 
                        }));
                      } else {
                        setFormData(prev => ({ 
                          ...prev, 
                          targetUsers: prev.targetUsers.filter(id => id !== user.id) 
                        }));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {user.fullName || user.username}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              בחר את המשתמשים שיקבלו את ההתראה
            </p>
          </div>

          {/* Target Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              פרויקט יעד (אופציונלי)
            </label>
            <select
              value={formData.targetProjectId}
              onChange={(e) => setFormData(prev => ({ ...prev, targetProjectId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">כל הפרויקטים</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              בחר פרויקט ספציפי או השאר ריק לכל הפרויקטים
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
            >
              <CancelIcon />
              ביטול
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <SaveIcon />
              {editingNotification ? 'עדכן התראה' : 'צור התראה'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminNotificationSystem;
