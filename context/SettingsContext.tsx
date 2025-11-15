import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { SystemSettings } from '../types';
import { settingsApi } from '../services/serverApi';

interface SettingsContextType {
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>({
    id: 'settings',
    taxRate: 0, // מס הכנסה באחוזים
    taxAmount: 0, // מס הכנסה בסכום קבוע  
    vatRate: 18, // מע"מ באחוזים
    companyName: 'מחוברות - ניהול מורן מרקוביץ',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    updatedAt: new Date().toISOString(),
    updatedBy: 'system'
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        // Load settings from server
        const serverSettings = await settingsApi.get();
        setSettings(serverSettings);
        
        // Server-only storage
      } catch (error) {
        console.error('Error loading settings from server:', error);
        // Server-only mode
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    try {
      setLoading(true);
      
      // Update settings on server
      const updatedSettingsData = {
        ...settings,
        ...newSettings,
        updatedAt: new Date().toISOString()
      };
      
      const updatedSettings = await settingsApi.update(updatedSettingsData);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating settings on server:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      loading
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
