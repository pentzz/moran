import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Organization } from '../types';
import { organizationsApi } from '../services/organizationsApi';
import { useAuth } from './AuthContext';

interface OrganizationsContextType {
  organizations: Organization[];
  loading: boolean;
  error: string | null;
  currentOrganization: Organization | null;
  setCurrentOrganization: (org: Organization | null) => void;
  addOrganization: (organization: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateOrganization: (id: string, organization: Partial<Organization>) => Promise<void>;
  deleteOrganization: (id: string) => Promise<void>;
  toggleOrganizationActive: (id: string) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
  getOrganizationById: (id: string) => Organization | undefined;
}

const OrganizationsContext = createContext<OrganizationsContextType | undefined>(undefined);

export const OrganizationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isSuperAdmin } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: unknown) => {
    const message = error instanceof Error ? error.message : 'שגיאה לא ידועה';
    setError(message);
    console.error('Organizations error:', error);
  };

  const loadOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizationsApi.getAll();
      setOrganizations(data);

      // Auto-select organization for non-super-admin users
      if (user && !isSuperAdmin && user.organizationId) {
        const userOrg = data.find(org => org.id === user.organizationId);
        if (userOrg) {
          setCurrentOrganization(userOrg);
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, [user]);

  const addOrganization = async (organization: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const newOrganization = await organizationsApi.create(organization);
      setOrganizations(prev => [...prev, newOrganization]);
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateOrganization = async (id: string, organization: Partial<Organization>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedOrganization = await organizationsApi.update(id, organization);
      setOrganizations(prev => prev.map(org => org.id === id ? updatedOrganization : org));

      // Update current organization if it's the one being updated
      if (currentOrganization?.id === id) {
        setCurrentOrganization(updatedOrganization);
      }
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrganization = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק ארגון זה? כל המשתמשים והפרויקטים המשוייכים יימחקו!')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await organizationsApi.delete(id);
      setOrganizations(prev => prev.filter(org => org.id !== id));

      // Clear current organization if it's being deleted
      if (currentOrganization?.id === id) {
        setCurrentOrganization(null);
      }
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const toggleOrganizationActive = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedOrganization = await organizationsApi.toggleActive(id);
      setOrganizations(prev => prev.map(org => org.id === id ? updatedOrganization : org));

      // Update current organization if it's the one being toggled
      if (currentOrganization?.id === id) {
        setCurrentOrganization(updatedOrganization);
      }
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshOrganizations = async () => {
    await loadOrganizations();
  };

  const getOrganizationById = (id: string): Organization | undefined => {
    return organizations.find(org => org.id === id);
  };

  return (
    <OrganizationsContext.Provider
      value={{
        organizations,
        loading,
        error,
        currentOrganization,
        setCurrentOrganization,
        addOrganization,
        updateOrganization,
        deleteOrganization,
        toggleOrganizationActive,
        refreshOrganizations,
        getOrganizationById,
      }}
    >
      {children}
    </OrganizationsContext.Provider>
  );
};

export const useOrganizations = (): OrganizationsContextType => {
  const context = useContext(OrganizationsContext);
  if (!context) {
    throw new Error('useOrganizations must be used within an OrganizationsProvider');
  }
  return context;
};
