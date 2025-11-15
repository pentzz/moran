import { Project, Income, Expense, Category, Subcategory, Supplier, Milestone } from '../types';
import { dataSyncManager } from './dataSync';

// מערכת PHP פשוטה שעובדת בכל שרת אירוח
const API_BASE_URL = '';

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
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
        // Fallback to status text if JSON parsing fails
        errorMessage = response.statusText || errorMessage;
      }
      throw new ApiError(errorMessage, response.status);
    }

    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    console.error('API request failed:', error);
    throw new ApiError('שגיאת רשת - אנא בדוק את החיבור לאינטרנט', 0);
  }
}

// Authentication API - מערכת מקומית פשוטה עם fallback
export const authApi = {
  login: async (username: string, password: string) => {
    try {
      // Try to read users from public/data/users.json
      const response = await fetch('/data/users.json');
      if (response.ok) {
        const users = await response.json();
        const user = users.find((u: any) => 
          u.username === username && 
          u.password === password && 
          u.isActive !== false
        );
        
        if (user) {
          // Update lastLogin
          user.lastLogin = new Date().toISOString();
          
          const result = { 
            success: true, 
            token: `local-authenticated-${user.id}`,
            user: {
              id: user.id,
              username: user.username,
              role: user.role,
              fullName: user.fullName,
              email: user.email,
              createdAt: user.createdAt,
              lastLogin: user.lastLogin,
              isActive: user.isActive
            }
          };
          localStorage.setItem('auth_token', result.token);
          return result;
        }
      }
    } catch (error) {
      console.error('Error reading users.json:', error);
    }
    
    // Fallback to hardcoded credentials (for backward compatibility)
    if (username === 'litalb' && password === 'Papi2009') {
      const result = { 
        success: true, 
        token: 'local-authenticated',
        user: { 
          id: 'legacy-user',
          username,
          role: 'user',
          fullName: 'ליטל ב',
          isActive: true
        }
      };
      localStorage.setItem('auth_token', result.token);
      return result;
    }
    
    throw new Error('שם משתמש או סיסמה שגויים');
  },
};

// Projects API - PHP backend עם localStorage fallback
export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    try {
      console.log('📊 Loading projects from PHP backend...');
      const serverData = await apiRequest<Project[]>('/api.php?action=getProjects');
      // גיבוי מקומי לנתוני השרת
      await dataSyncManager.syncProjects(serverData);
      return serverData;
    } catch (error) {
      console.log('⚠️ PHP backend unavailable, using local fallback');
      return await dataSyncManager.syncProjects();
    }
  },

  create: async (projectData: Omit<Project, 'id' | 'incomes' | 'expenses' | 'isArchived'>): Promise<Project> => {
    try {
      return await apiRequest<Project>('/api.php?action=createProject', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
    } catch (error) {
      // Fallback to localStorage
      const projects = await dataSyncManager.syncProjects();
      const newProject = {
        ...projectData,
        id: new Date().toISOString(),
        incomes: [],
        expenses: [],
        isArchived: false
      };
      projects.push(newProject);
      await dataSyncManager.syncProjects(projects);
      return newProject;
    }
  },

  update: async (id: string, data: { name: string; description: string; contractAmount: number }): Promise<Project> => {
    try {
      return await apiRequest<Project>(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      // Fallback to localStorage
      const projects = await dataSyncManager.syncProjects();
      const projectIndex = projects.findIndex(p => p.id === id);
      if (projectIndex === -1) throw new Error('Project not found');
      projects[projectIndex] = { ...projects[projectIndex], ...data };
      await dataSyncManager.syncProjects(projects);
      return projects[projectIndex];
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiRequest<{ success: boolean }>(`/projects/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      // Fallback to localStorage
      const projects = await dataSyncManager.syncProjects();
      const filteredProjects = projects.filter(p => p.id !== id);
      await dataSyncManager.syncProjects(filteredProjects);
    }
  },

  deleteAll: async (): Promise<void> => {
    try {
      await apiRequest<{ success: boolean }>('/projects', {
        method: 'DELETE',
      });
    } catch (error) {
      await dataSyncManager.syncProjects([]);
    }
  },

  archive: async (id: string): Promise<Project> => {
    const projects = await dataSyncManager.syncProjects();
    const projectIndex = projects.findIndex(p => p.id === id);
    if (projectIndex === -1) throw new Error('Project not found');
    projects[projectIndex].isArchived = true;
    await dataSyncManager.syncProjects(projects);
    return projects[projectIndex];
  },

  unarchive: async (id: string): Promise<Project> => {
    const projects = await dataSyncManager.syncProjects();
    const projectIndex = projects.findIndex(p => p.id === id);
    if (projectIndex === -1) throw new Error('Project not found');
    projects[projectIndex].isArchived = false;
    await dataSyncManager.syncProjects(projects);
    return projects[projectIndex];
  },

  addIncome: async (projectId: string, incomeData: Omit<Income, 'id'>): Promise<Income> => {
    try {
      return await apiRequest<Income>(`/projects/${projectId}/incomes`, {
        method: 'POST',
        body: JSON.stringify(incomeData),
      });
    } catch (error) {
      // Fallback to localStorage
      const projects = await dataSyncManager.syncProjects();
      const projectIndex = projects.findIndex(p => p.id === projectId);
      if (projectIndex === -1) throw new Error('Project not found');
      const newIncome = { ...incomeData, id: new Date().toISOString() };
      projects[projectIndex].incomes.push(newIncome);
      await dataSyncManager.syncProjects(projects);
      return newIncome;
    }
  },

  updateIncome: async (projectId: string, incomeId: string, incomeData: Partial<Income>): Promise<Income> => {
    try {
      return await apiRequest<Income>(`/projects/${projectId}/incomes/${incomeId}`, {
        method: 'PUT',
        body: JSON.stringify(incomeData),
      });
    } catch (error) {
      // Fallback to localStorage
      const projects = await dataSyncManager.syncProjects();
      const projectIndex = projects.findIndex(p => p.id === projectId);
      if (projectIndex === -1) throw new Error('Project not found');
      const incomeIndex = projects[projectIndex].incomes.findIndex(i => i.id === incomeId);
      if (incomeIndex === -1) throw new Error('Income not found');
      
      const updatedIncome = { ...projects[projectIndex].incomes[incomeIndex], ...incomeData };
      projects[projectIndex].incomes[incomeIndex] = updatedIncome;
      await dataSyncManager.syncProjects(projects);
      return updatedIncome;
    }
  },

  deleteIncome: async (projectId: string, incomeId: string): Promise<void> => {
    const projects = await dataSyncManager.syncProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) throw new Error('Project not found');
    projects[projectIndex].incomes = projects[projectIndex].incomes.filter(i => i.id !== incomeId);
    await dataSyncManager.syncProjects(projects);
  },

  addExpense: async (projectId: string, expenseData: Omit<Expense, 'id'>): Promise<Expense> => {
    const projects = await dataSyncManager.syncProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) throw new Error('Project not found');
    const newExpense = { ...expenseData, id: new Date().toISOString() };
    projects[projectIndex].expenses.push(newExpense);
    await dataSyncManager.syncProjects(projects);
    return newExpense;
  },

  updateExpense: async (projectId: string, expenseId: string, expenseData: Partial<Expense>): Promise<Expense> => {
    const projects = await dataSyncManager.syncProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) throw new Error('Project not found');
    const expenseIndex = projects[projectIndex].expenses.findIndex(e => e.id === expenseId);
    if (expenseIndex === -1) throw new Error('Expense not found');
    
    const updatedExpense = { ...projects[projectIndex].expenses[expenseIndex], ...expenseData };
    projects[projectIndex].expenses[expenseIndex] = updatedExpense;
    await dataSyncManager.syncProjects(projects);
    return updatedExpense;
  },

  deleteExpense: async (projectId: string, expenseId: string): Promise<void> => {
    const projects = await dataSyncManager.syncProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) throw new Error('Project not found');
    projects[projectIndex].expenses = projects[projectIndex].expenses.filter(e => e.id !== expenseId);
    await dataSyncManager.syncProjects(projects);
  },

  addMilestone: async (projectId: string, milestoneData: Omit<Milestone, 'id'>): Promise<Milestone> => {
    const projects = await dataSyncManager.syncProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) throw new Error('Project not found');
    
    const newMilestone = { 
      ...milestoneData, 
      id: new Date().toISOString(),
      projectId 
    };
    
    if (!projects[projectIndex].milestones) {
      projects[projectIndex].milestones = [];
    }
    projects[projectIndex].milestones!.push(newMilestone);
    await dataSyncManager.syncProjects(projects);
    return newMilestone;
  },

  updateMilestone: async (projectId: string, milestoneId: string, milestoneData: Partial<Milestone>): Promise<Milestone> => {
    const projects = await dataSyncManager.syncProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) throw new Error('Project not found');
    
    const milestoneIndex = projects[projectIndex].milestones?.findIndex(m => m.id === milestoneId);
    if (milestoneIndex === -1 || milestoneIndex === undefined) throw new Error('Milestone not found');
    
    const updatedMilestone = { 
      ...projects[projectIndex].milestones![milestoneIndex], 
      ...milestoneData 
    };
    
    projects[projectIndex].milestones![milestoneIndex] = updatedMilestone;
    await dataSyncManager.syncProjects(projects);
    return updatedMilestone;
  },

  deleteMilestone: async (projectId: string, milestoneId: string): Promise<void> => {
    const projects = await dataSyncManager.syncProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) throw new Error('Project not found');
    
    if (projects[projectIndex].milestones) {
      projects[projectIndex].milestones = projects[projectIndex].milestones!.filter(m => m.id !== milestoneId);
      await dataSyncManager.syncProjects(projects);
    }
  },
};

// Categories API - עובד רק עם localStorage
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    console.log('📊 Loading categories from localStorage...');
    return await dataSyncManager.syncCategories();
  },

  create: async (name: string): Promise<Category> => {
    const categories = await dataSyncManager.syncCategories();
    const newCategory = {
      id: new Date().toISOString(),
      name
    };
    categories.push(newCategory);
    await dataSyncManager.syncCategories(categories);
    return newCategory;
  },

  update: async (id: string, name: string): Promise<Category> => {
    const categories = await dataSyncManager.syncCategories();
    const categoryIndex = categories.findIndex(c => c.id === id);
    if (categoryIndex === -1) throw new Error('Category not found');
    categories[categoryIndex].name = name;
    await dataSyncManager.syncCategories(categories);
    return categories[categoryIndex];
  },

  delete: async (id: string): Promise<void> => {
    const categories = await dataSyncManager.syncCategories();
    const filteredCategories = categories.filter(c => c.id !== id);
    await dataSyncManager.syncCategories(filteredCategories);
  },

  addSubcategory: async (categoryId: string, name: string): Promise<Subcategory> => {
    const categories = await dataSyncManager.syncCategories();
    const categoryIndex = categories.findIndex(c => c.id === categoryId);
    if (categoryIndex === -1) throw new Error('Category not found');
    
    const newSubcategory = {
      id: new Date().toISOString(),
      name,
      categoryId
    };
    
    if (!categories[categoryIndex].subcategories) {
      categories[categoryIndex].subcategories = [];
    }
    categories[categoryIndex].subcategories!.push(newSubcategory);
    await dataSyncManager.syncCategories(categories);
    return newSubcategory;
  },

  updateSubcategory: async (categoryId: string, subcategoryId: string, name: string): Promise<Subcategory> => {
    const categories = await dataSyncManager.syncCategories();
    const categoryIndex = categories.findIndex(c => c.id === categoryId);
    if (categoryIndex === -1) throw new Error('Category not found');
    
    const subcategoryIndex = categories[categoryIndex].subcategories?.findIndex(s => s.id === subcategoryId);
    if (subcategoryIndex === -1 || subcategoryIndex === undefined) throw new Error('Subcategory not found');
    
    categories[categoryIndex].subcategories![subcategoryIndex].name = name;
    await dataSyncManager.syncCategories(categories);
    return categories[categoryIndex].subcategories![subcategoryIndex];
  },

  deleteSubcategory: async (categoryId: string, subcategoryId: string): Promise<void> => {
    const categories = await dataSyncManager.syncCategories();
    const categoryIndex = categories.findIndex(c => c.id === categoryId);
    if (categoryIndex === -1) throw new Error('Category not found');
    
    if (categories[categoryIndex].subcategories) {
      categories[categoryIndex].subcategories = categories[categoryIndex].subcategories!.filter(s => s.id !== subcategoryId);
      await dataSyncManager.syncCategories(categories);
    }
  },
};

// Suppliers API - עובד רק עם localStorage
export const suppliersApi = {
  getAll: async (): Promise<Supplier[]> => {
    console.log('📊 Loading suppliers from localStorage...');
    return await dataSyncManager.syncSuppliers();
  },

  create: async (supplier: Omit<Supplier, 'id' | 'createdAt'>): Promise<Supplier> => {
    const suppliers = await dataSyncManager.syncSuppliers();
    const newSupplier = {
      ...supplier,
      id: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    suppliers.push(newSupplier);
    await dataSyncManager.syncSuppliers(suppliers);
    return newSupplier;
  },

  update: async (id: string, supplier: Partial<Omit<Supplier, 'id' | 'createdAt'>>): Promise<Supplier> => {
    const suppliers = await dataSyncManager.syncSuppliers();
    const supplierIndex = suppliers.findIndex(s => s.id === id);
    if (supplierIndex === -1) throw new Error('Supplier not found');
    suppliers[supplierIndex] = { ...suppliers[supplierIndex], ...supplier };
    await dataSyncManager.syncSuppliers(suppliers);
    return suppliers[supplierIndex];
  },

  delete: async (id: string): Promise<void> => {
    const suppliers = await dataSyncManager.syncSuppliers();
    const filteredSuppliers = suppliers.filter(s => s.id !== id);
    await dataSyncManager.syncSuppliers(filteredSuppliers);
  },
};

export { ApiError };
