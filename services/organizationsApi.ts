import { Organization } from '../types';

const API_BASE = '/api.php';

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

async function saveToLocal<T>(localStorageKey: string, data: T): Promise<void> {
  try {
    localStorage.setItem(localStorageKey, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${localStorageKey} to localStorage:`, error);
  }
}

export const organizationsApi = {
  // Get all organizations (SuperAdmin only)
  getAll: async (): Promise<Organization[]> => {
    try {
      const response = await fetch(`${API_BASE}?action=getOrganizations`);
      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }
      const text = await response.text();
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        throw new Error('Server returned HTML instead of JSON');
      }
      return JSON.parse(text);
    } catch (error) {
      console.log('⚠️ Server API unavailable, using local fallback for organizations');
      return await loadFromLocalOrFile<Organization[]>('organizations_data', '/data/organizations.json', []);
    }
  },

  // Get organization by ID
  getById: async (id: string): Promise<Organization | null> => {
    try {
      const response = await fetch(`${API_BASE}?action=getOrganization&id=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch organization');
      }
      return response.json();
    } catch (error) {
      console.log('⚠️ Server API unavailable, using local fallback');
      const organizations = await loadFromLocalOrFile<Organization[]>('organizations_data', '/data/organizations.json', []);
      return organizations.find(org => org.id === id) || null;
    }
  },

  // Create new organization
  create: async (organization: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> => {
    try {
      const response = await fetch(`${API_BASE}?action=createOrganization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(organization),
      });
      if (!response.ok) {
        throw new Error('Failed to create organization');
      }
      return response.json();
    } catch (error) {
      console.log('⚠️ Server API unavailable, using local fallback');
      const organizations = await loadFromLocalOrFile<Organization[]>('organizations_data', '/data/organizations.json', []);
      const newOrganization: Organization = {
        ...organization,
        id: `org_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      organizations.push(newOrganization);
      await saveToLocal('organizations_data', organizations);
      return newOrganization;
    }
  },

  // Update organization
  update: async (id: string, organization: Partial<Organization>): Promise<Organization> => {
    try {
      const response = await fetch(`${API_BASE}?action=updateOrganization&id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(organization),
      });
      if (!response.ok) {
        throw new Error('Failed to update organization');
      }
      return response.json();
    } catch (error) {
      console.log('⚠️ Server API unavailable, using local fallback');
      const organizations = await loadFromLocalOrFile<Organization[]>('organizations_data', '/data/organizations.json', []);
      const index = organizations.findIndex(org => org.id === id);
      if (index === -1) {
        throw new Error('Organization not found');
      }
      organizations[index] = {
        ...organizations[index],
        ...organization,
        updatedAt: new Date().toISOString(),
      };
      await saveToLocal('organizations_data', organizations);
      return organizations[index];
    }
  },

  // Delete organization
  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}?action=deleteOrganization&id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete organization');
      }
    } catch (error) {
      console.log('⚠️ Server API unavailable, using local fallback');
      const organizations = await loadFromLocalOrFile<Organization[]>('organizations_data', '/data/organizations.json', []);
      const filtered = organizations.filter(org => org.id !== id);
      await saveToLocal('organizations_data', filtered);
    }
  },

  // Toggle organization active status
  toggleActive: async (id: string): Promise<Organization> => {
    try {
      const response = await fetch(`${API_BASE}?action=toggleOrganizationActive&id=${id}`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Failed to toggle organization status');
      }
      return response.json();
    } catch (error) {
      console.log('⚠️ Server API unavailable, using local fallback');
      const organizations = await loadFromLocalOrFile<Organization[]>('organizations_data', '/data/organizations.json', []);
      const index = organizations.findIndex(org => org.id === id);
      if (index === -1) {
        throw new Error('Organization not found');
      }
      organizations[index] = {
        ...organizations[index],
        isActive: !organizations[index].isActive,
        updatedAt: new Date().toISOString(),
      };
      await saveToLocal('organizations_data', organizations);
      return organizations[index];
    }
  },
};
