import { Project, Income, Expense, Category, Supplier } from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Same domain in production
  : 'http://localhost:3001'; // Development server

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
    return text ? JSON.parse(text) : {};
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    console.error('API request failed:', error);
    throw new ApiError('שגיאת רשת - אנא בדוק את החיבור לאינטרנט', 0);
  }
}

// Authentication API
export const authApi = {
  login: async (username: string, password: string) => {
    return apiRequest<{ success: boolean; token: string; user: { username: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
};

// Projects API
export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    return apiRequest<Project[]>('/projects');
  },

  create: async (projectData: Omit<Project, 'id' | 'incomes' | 'expenses' | 'isArchived'>): Promise<Project> => {
    return apiRequest<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  update: async (id: string, data: { name: string; description: string; contractAmount: number }): Promise<Project> => {
    return apiRequest<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest<{ success: boolean }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  },

  deleteAll: async (): Promise<void> => {
    await apiRequest<{ success: boolean }>('/projects', {
      method: 'DELETE',
    });
  },

  archive: async (id: string): Promise<Project> => {
    return apiRequest<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isArchived: true }),
    });
  },

  unarchive: async (id: string): Promise<Project> => {
    return apiRequest<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isArchived: false }),
    });
  },

  addIncome: async (projectId: string, incomeData: Omit<Income, 'id'>): Promise<Income> => {
    return apiRequest<Income>(`/projects/${projectId}/incomes`, {
      method: 'POST',
      body: JSON.stringify(incomeData),
    });
  },

  deleteIncome: async (projectId: string, incomeId: string): Promise<void> => {
    await apiRequest<{ success: boolean }>(`/projects/${projectId}/incomes/${incomeId}`, {
      method: 'DELETE',
    });
  },

  addExpense: async (projectId: string, expenseData: Omit<Expense, 'id'>): Promise<Expense> => {
    return apiRequest<Expense>(`/projects/${projectId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },

  deleteExpense: async (projectId: string, expenseId: string): Promise<void> => {
    await apiRequest<{ success: boolean }>(`/projects/${projectId}/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  },
};

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    return apiRequest<Category[]>('/categories');
  },

  create: async (name: string): Promise<Category> => {
    return apiRequest<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  update: async (id: string, name: string): Promise<Category> => {
    return apiRequest<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest<{ success: boolean }>(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// Suppliers API
export const suppliersApi = {
  getAll: async (): Promise<Supplier[]> => {
    return apiRequest<Supplier[]>('/suppliers');
  },

  create: async (supplier: Omit<Supplier, 'id' | 'createdAt'>): Promise<Supplier> => {
    return apiRequest<Supplier>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplier),
    });
  },

  update: async (id: string, supplier: Partial<Omit<Supplier, 'id' | 'createdAt'>>): Promise<Supplier> => {
    return apiRequest<Supplier>(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplier),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest<{ success: boolean }>(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  },
};

export { ApiError };
