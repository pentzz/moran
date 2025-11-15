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
  isSuperAdmin: boolean;
  impersonateUser: (targetUser: User) => void;
  stopImpersonation: () => void;
  isImpersonating: boolean;
  originalUser: User | null;
  refreshUser?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedToken && storedUser) {
      try {
        setAuthToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Try server authentication first (api.php)
      try {
        const response = await serverAuthApi.login(username, password);
        
        if (response.success) {
          setAuthToken(response.token);
          setUser(response.user);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          localStorage.setItem('authToken', response.token);
          return true;
        }
      } catch (serverError) {
        console.log('Server API failed, trying local fallback:', serverError);
        
        // Fallback to local authentication (reads from users.json)
        try {
          const localResponse = await localAuthApi.login(username, password);
          
          if (localResponse.success) {
            setAuthToken(localResponse.token);
            setUser(localResponse.user);
            localStorage.setItem('currentUser', JSON.stringify(localResponse.user));
            localStorage.setItem('authToken', localResponse.token);
            return true;
          }
        } catch (localError) {
          console.error('Local authentication also failed:', localError);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setOriginalUser(null);
    setIsImpersonating(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('originalUser');
    localStorage.removeItem('authToken');
  };

  const impersonateUser = (targetUser: User) => {
    if (user && (user.role === UserRole.SuperAdmin || user.role === UserRole.Admin || user.role === 'admin' || user.role === 'superAdmin')) {
      setOriginalUser(user);
      setUser(targetUser);
      setIsImpersonating(true);
      localStorage.setItem('originalUser', JSON.stringify(user));
      localStorage.setItem('currentUser', JSON.stringify(targetUser));
    }
  };

  const stopImpersonation = () => {
    if (originalUser && isImpersonating) {
      setUser(originalUser);
      setOriginalUser(null);
      setIsImpersonating(false);
      localStorage.setItem('currentUser', JSON.stringify(originalUser));
      localStorage.removeItem('originalUser');
    }
  };

  const refreshUser = async () => {
    if (user?.id && user?.username) {
      try {
        // Try server first, then local fallback
        let response;
        try {
          response = await serverAuthApi.login(user.username, user.password || '');
        } catch {
          response = await localAuthApi.login(user.username, user.password || '');
        }
        
        if (response.success) {
          setUser(response.user);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        }
      } catch (error) {
        console.error('Error refreshing user:', error);
      }
    }
  };

  const isAuthenticated = authToken !== null && user !== null;
  const isSuperAdmin = user?.role === UserRole.SuperAdmin || user?.role === 'superAdmin';
  const isAdmin = user?.role === UserRole.Admin || user?.role === 'admin' || isSuperAdmin;

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      login,
      logout,
      user,
      isLoading,
      isAdmin,
      isSuperAdmin,
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
