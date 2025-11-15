const API_BASE = '/api.php';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetUsers: string[];
  targetProjectId?: string;
  createdBy: string;
  createdAt: string;
  isRead: { [userId: string]: boolean };
}

async function loadFromLocalOrFile<T>(localStorageKey: string, filePath: string, defaultValue: T): Promise<T> {
  try {
    // Try localStorage first
    const localData = localStorage.getItem(localStorageKey);
    if (localData) {
      return JSON.parse(localData);
    }
    
    // Try loading from file
    const response = await fetch(filePath);
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem(localStorageKey, JSON.stringify(data));
      return data;
    }
  } catch (error) {
    console.warn(`Failed to load ${localStorageKey} from localStorage or file:`, error);
  }
  
  return defaultValue;
}

export const notificationsApi = {
  // Get notifications for a specific user
  getNotifications: async (userId: string): Promise<Notification[]> => {
    try {
      const response = await fetch(`${API_BASE}?action=getNotifications&userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const text = await response.text();
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        throw new Error('Server returned HTML instead of JSON');
      }
      return JSON.parse(text);
    } catch (error) {
      console.log('⚠️ Server API unavailable, using local fallback for notifications');
      const allNotifications = await loadFromLocalOrFile<Notification[]>('notifications_data', '/data/notifications.json', []);
      // Filter notifications for the specific user
      return allNotifications.filter(n => 
        n.targetUsers.includes(userId) || 
        n.targetUsers.length === 0 // Global notifications
      );
    }
  },

  // Add a new notification
  addNotification: async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> => {
    const response = await fetch(`${API_BASE}?action=addNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });
    if (!response.ok) {
      throw new Error('Failed to add notification');
    }
    return response.json();
  },

  // Mark a notification as read for a specific user
  markAsRead: async (notificationId: string, userId: string): Promise<void> => {
    const response = await fetch(`${API_BASE}?action=markNotificationAsRead&id=${notificationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
  },

  // Mark all notifications as read for a specific user
  markAllAsRead: async (userId: string): Promise<void> => {
    const response = await fetch(`${API_BASE}?action=markAllNotificationsAsRead`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
  },

  // Delete a notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    const response = await fetch(`${API_BASE}?action=deleteNotification&id=${notificationId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }
  },
};
