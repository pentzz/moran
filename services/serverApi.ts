import { Project, Income, Expense, Category, Subcategory, Supplier, Milestone, User, ActivityLog, SystemSettings, UserSettings, UserProfile } from '../types';

// מערכת API מרכזית שעובדת עם קבצי JSON בשרת
const API_BASE_URL = 'api.php';

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to load from localStorage or JSON file
async function loadFromLocalOrFile<T>(storageKey: string, jsonFile: string, defaultValue: T): Promise<T> {
  try {
    // Try localStorage first
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Accept empty arrays/objects as valid data
        if (parsed !== null && parsed !== undefined) {
          console.log(`✅ Loaded ${storageKey} from localStorage`);
          return parsed;
        }
      } catch (e) {
        // Invalid JSON in localStorage, clear it
        localStorage.removeItem(storageKey);
      }
    }
    
    // Try JSON file
    try {
      const response = await fetch(`/data/${jsonFile}`);
      if (response.ok) {
        const text = await response.text();
        // Check if response is HTML (error page) instead of JSON
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          console.log(`⚠️ Server returned HTML for ${jsonFile}, using default`);
          return defaultValue;
        }
        try {
          const data = JSON.parse(text);
          // Accept empty arrays/objects as valid data
          if (data !== null && data !== undefined) {
            console.log(`✅ Loaded ${jsonFile} from file`);
            localStorage.setItem(storageKey, JSON.stringify(data));
            return data;
          }
        } catch (e) {
          console.log(`⚠️ Invalid JSON in ${jsonFile}, using default`);
        }
      } else if (response.status === 404) {
        // File doesn't exist - that's OK, use default
        console.log(`⚠️ File ${jsonFile} not found, using default`);
      }
    } catch (fetchError) {
      // Network error or other fetch error - that's OK, use default
      console.log(`⚠️ Could not load ${jsonFile}, using default`);
    }
    
    console.log(`⚠️ No data found, using default for ${storageKey}`);
    return defaultValue;
  } catch (error) {
    // Any other error - use default silently
    console.log(`⚠️ Error loading ${storageKey}, using default`);
    return defaultValue;
  }
}

async function apiRequest<T>(action: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}?action=${action}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = 'Network error';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new ApiError(errorMessage, response.status);
    }
    
    const text = await response.text();
    
    // Check if response is HTML (error page) instead of JSON
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      throw new ApiError('Server returned HTML instead of JSON', response.status);
    }
    
    return text ? JSON.parse(text) : ({} as T);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors - will be handled by fallback in each API function
    console.warn('API request failed, will use fallback:', error);
    throw error;
  }
}

// Authentication API
export const authApi = {
  login: async (username: string, password: string) => {
    return await apiRequest<{success: boolean, token: string, user: User}>('login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
};

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    try {
      return await apiRequest<User[]>('getUsers');
    } catch (error) {
      console.log('⚠️ Server API unavailable, using local fallback for users');
      return await loadFromLocalOrFile<User[]>('users_data', '/data/users.json', []);
    }
  },

  create: async (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'isActive'>): Promise<User> => {
    return await apiRequest<User>('createUser', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  update: async (userId: string, userData: Partial<User>): Promise<void> => {
    await apiRequest<{success: boolean}>(`updateUser&id=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  delete: async (userId: string): Promise<void> => {
    await apiRequest<{success: boolean}>(`deleteUser&id=${userId}`, {
      method: 'DELETE',
    });
  },
};

// Activity Logs API
export const activityApi = {
  getAll: async (): Promise<ActivityLog[]> => {
    return await apiRequest<ActivityLog[]>('getActivityLogs');
  },

  add: async (logData: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog> => {
    return await apiRequest<ActivityLog>('addActivityLog', {
      method: 'POST',
      body: JSON.stringify(logData),
    });
  },
};

// Settings API
export const settingsApi = {
  get: async (): Promise<SystemSettings> => {
    try {
      return await apiRequest<SystemSettings>('getSettings');
    } catch (error) {
      console.log('⚠️ Server API unavailable, using local fallback for settings');
      const defaultSettings: SystemSettings = {
        id: 'default',
        taxRate: 0,
        vatRate: 18,
        updatedAt: new Date().toISOString(),
        updatedBy: 'system',
      };
      return await loadFromLocalOrFile<SystemSettings>('settings_data', '/data/settings.json', defaultSettings);
    }
  },

  update: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
    return await apiRequest<SystemSettings>('updateSettings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

// User Settings API
export const userSettingsApi = {
  get: async (userId: string): Promise<UserSettings> => {
    return await apiRequest<UserSettings>(`getUserSettings&userId=${userId}`);
  },

  update: async (userId: string, settings: Partial<UserSettings>): Promise<{ success: boolean }> => {
    return await apiRequest<{ success: boolean }>(`updateUserSettings&userId=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

export const userProfileApi = {
  get: async (userId: string): Promise<UserProfile> => {
    try {
      return await apiRequest<UserProfile>(`getUserProfile&userId=${userId}`);
    } catch (error) {
      console.log('⚠️ Server API unavailable, using local fallback for user profile');
      // Try to get user from users list
      const users = await usersApi.getAll();
      const user = users.find(u => u.id === userId);
      if (user) {
        // Convert User to UserProfile format
        const defaultProfile: UserProfile = {
          id: `profile_${userId}`,
          userId: userId,
          fullName: user.fullName || user.username,
          email: user.email,
          phone: user.phone,
          address: user.address,
          bio: user.bio,
          preferences: {
            theme: 'light',
            language: 'he',
            notifications: true,
            emailNotifications: false,
          },
          updatedAt: user.updatedAt || user.createdAt,
          updatedBy: userId,
          profilePicture: user.profilePicture,
        };
        return defaultProfile;
      }
      throw new Error('User not found');
    }
  },

  update: async (userId: string, profile: Partial<UserProfile>): Promise<{ success: boolean }> => {
    return await apiRequest<{ success: boolean }>(`updateUserProfile&userId=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },
};

// Projects API
export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    try {
      // Try server API first
      return await apiRequest<Project[]>('getProjects');
    } catch (error) {
      console.log('⚠️ Server API unavailable, using local fallback');
      // Fallback to local storage or JSON file
      return await loadFromLocalOrFile<Project[]>('projects_data', 'projects.json', []);
    }
  },

  create: async (projectData: Omit<Project, 'id' | 'createdAt' | 'incomes' | 'expenses' | 'milestones' | 'isArchived'>): Promise<Project> => {
    try {
      return await apiRequest<Project>('createProject', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
    } catch (error) {
      // Fallback: create locally
      console.log('⚠️ Server API unavailable, creating project locally');
      const newProject: Project = {
        ...projectData,
        id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        incomes: [],
        expenses: [],
        milestones: [],
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: (projectData as any).createdBy || 'current-user',
        ownerId: (projectData as any).ownerId || 'current-user'
      };
      
      // Save to localStorage
      const projects = await projectsApi.getAll();
      projects.push(newProject);
      localStorage.setItem('projects_data', JSON.stringify(projects));
      
      return newProject;
    }
  },

  update: async (projectId: string, projectData: Partial<Project>): Promise<Project> => {
    try {
      await apiRequest<{success: boolean}>(`updateProject&id=${projectId}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
      });
    } catch (error) {
      console.log('⚠️ Server API unavailable, updating project locally');
    }
    
    // Always update locally as fallback
    const projects = await projectsApi.getAll();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) throw new Error('Project not found');
    
    projects[projectIndex] = {
      ...projects[projectIndex],
      ...projectData,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('projects_data', JSON.stringify(projects));
    
    return projects[projectIndex];
  },

  archive: async (projectId: string): Promise<Project> => {
    try {
      await apiRequest<{success: boolean}>(`updateProject&id=${projectId}`, {
        method: 'PUT',
        body: JSON.stringify({ isArchived: true }),
      });
    } catch (error) {
      console.log('⚠️ Server API unavailable, archiving project locally');
    }
    
    return await projectsApi.update(projectId, { isArchived: true } as any);
  },

  unarchive: async (projectId: string): Promise<Project> => {
    try {
      await apiRequest<{success: boolean}>(`updateProject&id=${projectId}`, {
        method: 'PUT',
        body: JSON.stringify({ isArchived: false }),
      });
    } catch (error) {
      console.log('⚠️ Server API unavailable, unarchiving project locally');
    }
    
    return await projectsApi.update(projectId, { isArchived: false } as any);
  },

  delete: async (projectId: string): Promise<void> => {
    try {
      await apiRequest<{success: boolean}>(`deleteProject&id=${projectId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.log('⚠️ Server API unavailable, deleting project locally');
    }
    
    // Always delete locally
    const projects = await projectsApi.getAll();
    const filtered = projects.filter(p => p.id !== projectId);
    localStorage.setItem('projects_data', JSON.stringify(filtered));
  },

  deleteAll: async (): Promise<void> => {
    const projects = await projectsApi.getAll();
    for (const project of projects) {
      await projectsApi.delete(project.id);
    }
  },

  addIncome: async (projectId: string, income: Omit<Income, 'id'>): Promise<Income> => {
    // This would need to be implemented to update the project with new income
    const projects = await projectsApi.getAll();
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    
    const newIncome = { ...income, id: `income_${Date.now()}` };
    project.incomes.push(newIncome);
    
    await projectsApi.update(projectId, { incomes: project.incomes });
    return newIncome;
  },

  updateIncome: async (projectId: string, incomeId: string, incomeData: Partial<Income>): Promise<void> => {
    const projects = await projectsApi.getAll();
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    
    const incomeIndex = project.incomes.findIndex(i => i.id === incomeId);
    if (incomeIndex === -1) throw new Error('Income not found');
    
    project.incomes[incomeIndex] = { ...project.incomes[incomeIndex], ...incomeData };
    await projectsApi.update(projectId, { incomes: project.incomes });
  },

  deleteIncome: async (projectId: string, incomeId: string): Promise<void> => {
    const projects = await projectsApi.getAll();
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    
    project.incomes = project.incomes.filter(i => i.id !== incomeId);
    await projectsApi.update(projectId, { incomes: project.incomes });
  },

  addExpense: async (projectId: string, expense: Omit<Expense, 'id'>): Promise<Expense> => {
    const projects = await projectsApi.getAll();
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    
    const newExpense = { ...expense, id: `expense_${Date.now()}` };
    project.expenses.push(newExpense);
    
    await projectsApi.update(projectId, { expenses: project.expenses });
    return newExpense;
  },

  updateExpense: async (projectId: string, expenseId: string, expenseData: Partial<Expense>): Promise<void> => {
    const projects = await projectsApi.getAll();
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    
    const expenseIndex = project.expenses.findIndex(e => e.id === expenseId);
    if (expenseIndex === -1) throw new Error('Expense not found');
    
    project.expenses[expenseIndex] = { ...project.expenses[expenseIndex], ...expenseData };
    await projectsApi.update(projectId, { expenses: project.expenses });
  },

  deleteExpense: async (projectId: string, expenseId: string): Promise<void> => {
    const projects = await projectsApi.getAll();
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    
    project.expenses = project.expenses.filter(e => e.id !== expenseId);
    await projectsApi.update(projectId, { expenses: project.expenses });
  },

  addMilestone: async (projectId: string, milestone: Omit<Milestone, 'id'>): Promise<Milestone> => {
    const projects = await projectsApi.getAll();
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    
    const newMilestone = { ...milestone, id: `milestone_${Date.now()}` };
    project.milestones = project.milestones || [];
    project.milestones.push(newMilestone);
    
    await projectsApi.update(projectId, { milestones: project.milestones });
    return newMilestone;
  },

  updateMilestone: async (projectId: string, milestoneId: string, milestoneData: Partial<Milestone>): Promise<void> => {
    const projects = await projectsApi.getAll();
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    
    const milestoneIndex = project.milestones?.findIndex(m => m.id === milestoneId) ?? -1;
    if (milestoneIndex === -1) throw new Error('Milestone not found');
    
    project.milestones![milestoneIndex] = { ...project.milestones![milestoneIndex], ...milestoneData };
    await projectsApi.update(projectId, { milestones: project.milestones });
  },

  deleteMilestone: async (projectId: string, milestoneId: string): Promise<void> => {
    const projects = await projectsApi.getAll();
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    
    project.milestones = project.milestones?.filter(m => m.id !== milestoneId) || [];
    await projectsApi.update(projectId, { milestones: project.milestones });
  },
};

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    try {
      return await apiRequest<Category[]>('getCategories');
    } catch (error) {
      console.log('⚠️ Server API unavailable, using local fallback for categories');
      return await loadFromLocalOrFile<Category[]>('categories_data', '/data/categories.json', []);
    }
  },

  create: async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
    return await apiRequest<Category>('createCategory', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  update: async (categoryId: string, categoryData: Partial<Category>): Promise<void> => {
    await apiRequest<{success: boolean}>(`updateCategory&id=${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  delete: async (categoryId: string): Promise<void> => {
    await apiRequest<{success: boolean}>(`deleteCategory&id=${categoryId}`, {
      method: 'DELETE',
    });
  },

  addSubcategory: async (categoryId: string, subcategory: Omit<Subcategory, 'id'>): Promise<Subcategory> => {
    const categories = await categoriesApi.getAll();
    const category = categories.find(c => c.id === categoryId);
    if (!category) throw new Error('Category not found');
    
    const newSubcategory = { ...subcategory, id: `sub_${Date.now()}` };
    category.subcategories = category.subcategories || [];
    category.subcategories.push(newSubcategory);
    
    await categoriesApi.update(categoryId, { subcategories: category.subcategories });
    return newSubcategory;
  },

  updateSubcategory: async (categoryId: string, subcategoryId: string, subcategoryData: Partial<Subcategory>): Promise<void> => {
    const categories = await categoriesApi.getAll();
    const category = categories.find(c => c.id === categoryId);
    if (!category) throw new Error('Category not found');
    
    const subcategoryIndex = category.subcategories?.findIndex(s => s.id === subcategoryId) ?? -1;
    if (subcategoryIndex === -1) throw new Error('Subcategory not found');
    
    category.subcategories![subcategoryIndex] = { ...category.subcategories![subcategoryIndex], ...subcategoryData };
    await categoriesApi.update(categoryId, { subcategories: category.subcategories });
  },

  deleteSubcategory: async (categoryId: string, subcategoryId: string): Promise<void> => {
    const categories = await categoriesApi.getAll();
    const category = categories.find(c => c.id === categoryId);
    if (!category) throw new Error('Category not found');
    
    category.subcategories = category.subcategories?.filter(s => s.id !== subcategoryId) || [];
    await categoriesApi.update(categoryId, { subcategories: category.subcategories });
  },
};

// Suppliers API
export const suppliersApi = {
  getAll: async (): Promise<Supplier[]> => {
    try {
      return await apiRequest<Supplier[]>('getSuppliers');
    } catch (error) {
      console.log('⚠️ Server API unavailable, using local fallback for suppliers');
      return await loadFromLocalOrFile<Supplier[]>('suppliers_data', '/data/suppliers.json', []);
    }
  },

  create: async (supplierData: Omit<Supplier, 'id' | 'createdAt'>): Promise<Supplier> => {
    return await apiRequest<Supplier>('createSupplier', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
  },

  update: async (supplierId: string, supplierData: Partial<Supplier>): Promise<void> => {
    await apiRequest<{success: boolean}>(`updateSupplier&id=${supplierId}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData),
    });
  },

  delete: async (supplierId: string): Promise<void> => {
    await apiRequest<{success: boolean}>(`deleteSupplier&id=${supplierId}`, {
      method: 'DELETE',
    });
  },
};
