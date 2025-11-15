import { Project, Income, Expense, Category, Subcategory, Supplier, Milestone, User, ActivityLog, SystemSettings, UserSettings, UserProfile } from '../types';

// מערכת API מרכזית שעובדת עם השרת בלבד (ללא localStorage)
const API_BASE_URL = '/api';

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Important: Include cookies for session
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

    console.error('API request failed:', error);
    throw error;
  }
}

// Authentication API
export const authApi = {
  login: async (username: string, password: string) => {
    return await apiRequest<{success: boolean, user: User, authenticated: boolean}>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  logout: async () => {
    return await apiRequest<{success: boolean}>('/auth/logout', {
      method: 'POST',
    });
  },

  checkAuth: async () => {
    return await apiRequest<{authenticated: boolean, userId?: string, username?: string, role?: string}>('/auth/check', {
      method: 'GET',
    });
  },
};

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    return await apiRequest<User[]>('/users', { method: 'GET' });
  },

  create: async (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'isActive'>): Promise<User> => {
    return await apiRequest<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  update: async (userId: string, userData: Partial<User>): Promise<void> => {
    await apiRequest<{success: boolean}>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  delete: async (userId: string): Promise<void> => {
    await apiRequest<{success: boolean}>(`/users/${userId}`, {
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
    return await apiRequest<SystemSettings>('/settings', { method: 'GET' });
  },

  update: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
    return await apiRequest<SystemSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

// User Settings API
export const userSettingsApi = {
  get: async (userId: string): Promise<UserSettings> => {
    return await apiRequest<UserSettings>(`/users/${userId}/settings`, { method: 'GET' });
  },

  update: async (userId: string, settings: Partial<UserSettings>): Promise<{ success: boolean }> => {
    return await apiRequest<{ success: boolean }>(`/users/${userId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

export const userProfileApi = {
  get: async (userId: string): Promise<UserProfile> => {
    return await apiRequest<UserProfile>(`/users/${userId}/profile`, { method: 'GET' });
  },

  update: async (userId: string, profile: Partial<UserProfile>): Promise<{ success: boolean }> => {
    return await apiRequest<{ success: boolean }>(`/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },
};

// Projects API
export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    return await apiRequest<Project[]>('/projects', { method: 'GET' });
  },

  create: async (projectData: Omit<Project, 'id' | 'createdAt' | 'incomes' | 'expenses' | 'milestones' | 'isArchived'>): Promise<Project> => {
    return await apiRequest<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  update: async (projectId: string, projectData: Partial<Project>): Promise<Project> => {
    return await apiRequest<Project>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  },

  archive: async (projectId: string): Promise<Project> => {
    return await apiRequest<Project>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify({ isArchived: true }),
    });
  },

  unarchive: async (projectId: string): Promise<Project> => {
    return await apiRequest<Project>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify({ isArchived: false }),
    });
  },

  delete: async (projectId: string): Promise<void> => {
    await apiRequest<{success: boolean}>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
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
    return await apiRequest<Category[]>('/categories', { method: 'GET' });
  },

  create: async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
    return await apiRequest<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  update: async (categoryId: string, categoryData: Partial<Category>): Promise<void> => {
    await apiRequest<{success: boolean}>(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  delete: async (categoryId: string): Promise<void> => {
    await apiRequest<{success: boolean}>(`/categories/${categoryId}`, {
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
    return await apiRequest<Supplier[]>('/suppliers', { method: 'GET' });
  },

  create: async (supplierData: Omit<Supplier, 'id' | 'createdAt'>): Promise<Supplier> => {
    return await apiRequest<Supplier>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
  },

  update: async (supplierId: string, supplierData: Partial<Supplier>): Promise<void> => {
    await apiRequest<{success: boolean}>(`/suppliers/${supplierId}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData),
    });
  },

  delete: async (supplierId: string): Promise<void> => {
    await apiRequest<{success: boolean}>(`/suppliers/${supplierId}`, {
      method: 'DELETE',
    });
  },
};
