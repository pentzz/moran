import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, UserRole, ActivityLog } from '../types';
import { usersApi, activityApi } from '../services/serverApi';

interface UsersContextType {
  users: User[];
  currentUser: User | null;
  activityLogs: ActivityLog[];
  addUser: (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'isActive'>) => void;
  updateUser: (userId: string, userData: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  logActivity: (action: string, entityType: ActivityLog['entityType'], entityId: string, details: string) => void;
  getUserById: (userId: string) => User | undefined;
  isAdmin: (userId?: string) => boolean;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data from server on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load users from server
        const serverUsers = await usersApi.getAll();
        setUsers(serverUsers);
        
        // Load activity logs from server
        const serverLogs = await activityApi.getAll();
        setActivityLogs(serverLogs);
        
        // Removed localStorage sync - using server-only storage
        
        // Try to get current user from localStorage (for session persistence)
        const storedCurrentUser = localStorage.getItem('currentUser');
        if (storedCurrentUser) {
          try {
            const parsedUser = JSON.parse(storedCurrentUser);
            // Verify user still exists on server
            const serverUser = serverUsers.find(u => u.id === parsedUser.id);
            if (serverUser) {
              setCurrentUser(serverUser);
            } else {
              localStorage.removeItem('currentUser');
            }
          } catch (error) {
            console.error('Error parsing stored user:', error);
            localStorage.removeItem('currentUser');
          }
        }
      } catch (error) {
        console.error('Error loading data from server:', error);
        // Server-only mode - no localStorage fallback
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const addUser = async (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'isActive'>) => {
    try {
      // Create user on server
      const newUser = await usersApi.create(userData);
      
      // Update local state
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      
      if (currentUser) {
        logActivity('יצירת משתמש חדש', 'user', newUser.id, `נוצר משתמש: ${newUser.username}`);
      }
      
      return newUser;
    } catch (error) {
      console.error('Error creating user on server:', error);
      throw error;
    }
  };

  const updateUser = async (userId: string, userData: Partial<User>) => {
    try {
      // Update user on server
      await usersApi.update(userId, userData);
      
      // Update local state
      const updatedUsers = users.map(user => 
        user.id === userId 
          ? { ...user, ...userData, updatedAt: new Date().toISOString() }
          : user
      );
      
      setUsers(updatedUsers);
      
      if (currentUser) {
        logActivity('עדכון משתמש', 'user', userId, `עודכן משתמש: ${userData.username || userId}`);
      }
    } catch (error) {
      console.error('Error updating user on server:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user && user.role !== UserRole.Admin) {
      try {
        // Delete user on server
        await usersApi.delete(userId);
        
        // Update local state
        const updatedUsers = users.filter(u => u.id !== userId);
        setUsers(updatedUsers);
        
        if (currentUser) {
          logActivity('מחיקת משתמש', 'user', userId, `נמחק משתמש: ${user.username}`);
        }
      } catch (error) {
        console.error('Error deleting user on server:', error);
        throw error;
      }
    }
  };

  const logActivity = async (action: string, entityType: ActivityLog['entityType'], entityId: string, details: string) => {
    if (!currentUser) return;

    const logData = {
      userId: currentUser.id,
      username: currentUser.username,
      action,
      entityType,
      entityId,
      details
    };
    
    try {
      // Send log to server
      const newLog = await activityApi.add(logData);
      
      // Update local state
      const updatedLogs = [newLog, ...activityLogs];
      setActivityLogs(updatedLogs);
    } catch (error) {
      console.error('Error logging activity to server:', error);
      // Server-only mode - no localStorage fallback
    }
  };

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  const isAdmin = (userId?: string) => {
    const user = userId ? getUserById(userId) : currentUser;
    return user?.role === UserRole.Admin;
  };

  return (
    <UsersContext.Provider value={{
      users,
      currentUser,
      activityLogs,
      addUser,
      updateUser,
      deleteUser,
      logActivity,
      getUserById,
      isAdmin
    }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};
