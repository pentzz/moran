import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Category } from '../types';
import { categoriesApi, ApiError } from '../services/api';

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, newName: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryNameById: (id: string) => string;
  refreshCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const CategoriesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories on mount
  useEffect(() => {
    refreshCategories();
  }, []);

  const handleError = (error: any) => {
    if (error instanceof ApiError) {
      setError(error.message);
    } else {
      setError('שגיאה לא צפויה');
    }
    console.error('Category operation error:', error);
  };

  const refreshCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedCategories = await categoriesApi.getAll();
      setCategories(fetchedCategories);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (name: string) => {
    if (!name || categories.some(c => c.name === name)) {
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const newCategory = await categoriesApi.create(name);
      setCategories(prev => [...prev, newCategory]);
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, newName: string) => {
    if (!newName || categories.some(c => c.name === newName && c.id !== id)) {
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const updatedCategory = await categoriesApi.update(id, newName);
      setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await categoriesApi.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
    
  const getCategoryNameById = (id: string) => {
    return categories.find(c => c.id === id)?.name || id;
  };

  return (
    <CategoriesContext.Provider value={{ 
      categories, 
      loading, 
      error, 
      addCategory, 
      updateCategory, 
      deleteCategory, 
      getCategoryNameById,
      refreshCategories
    }}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};
