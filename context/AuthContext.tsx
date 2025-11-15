import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { authApi as serverAuthApi } from '../services/serverApi';
import { authApi as localAuthApi } from '../services/api';
import { User, UserRole } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  impersonateUser: (targetUser: User) => void;
  stopImpersonation: () => void;
  isImpersonating: boolean;
  originalUser: User | null;
  refreshUser?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);

  // Check session on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await serverAuthApi.checkAuth();
        if (response.authenticated && response.userId) {
          // Fetch full user data
          const users = await import('../services/serverApi').then(m => m.usersApi.getAll());
          const currentUser = users.find(u => u.id === response.userId);
          if (currentUser) {
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.log('No active session or session check failed');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await serverAuthApi.login(username, password);

      if (response.success && response.authenticated) {
        setUser(response.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await serverAuthApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setOriginalUser(null);
      setIsImpersonating(false);
    }
  };

  const impersonateUser = (targetUser: User) => {
    if (user && (user.role === UserRole.Admin || user.role === 'admin')) {
      setOriginalUser(user);
      setUser(targetUser);
      setIsImpersonating(true);
    }
  };

  const stopImpersonation = () => {
    if (originalUser && isImpersonating) {
      setUser(originalUser);
      setOriginalUser(null);
      setIsImpersonating(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await serverAuthApi.checkAuth();
      if (response.authenticated && response.userId) {
        const users = await import('../services/serverApi').then(m => m.usersApi.getAll());
        const currentUser = users.find(u => u.id === response.userId);
        if (currentUser) {
          setUser(currentUser);
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const isAuthenticated = user !== null;
  const isAdmin = user?.role === UserRole.Admin || user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout, 
      user, 
      isLoading,
      isAdmin,
      impersonateUser,
      stopImpersonation,
      isImpersonating,
      originalUser,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
