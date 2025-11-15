import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Category, Subcategory } from '../types';
import { categoriesApi } from '../services/serverApi';

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, newName: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubcategory: (categoryId: string, name: string) => Promise<void>;
  updateSubcategory: (categoryId: string, subcategoryId: string, newName: string) => Promise<void>;
  deleteSubcategory: (categoryId: string, subcategoryId: string) => Promise<void>;
  getCategoryNameById: (id: string) => string;
  getSubcategoryNameById: (categoryId: string, subcategoryId: string) => string;
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
    if (error?.message) {
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
      const newCategory = await categoriesApi.create({ name, subcategories: [] });
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
      await categoriesApi.update(id, { name: newName });
      setCategories(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
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
    
  const addSubcategory = async (categoryId: string, name: string) => {
    if (!name) return;
    
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    if (category.subcategories?.some(s => s.name === name)) return;
    
    setLoading(true);
    setError(null);
    try {
      const newSubcategory = await categoriesApi.addSubcategory(categoryId, { name, categoryId });
      setCategories(prev => prev.map(c =>
        c.id === categoryId
          ? { ...c, subcategories: [...(c.subcategories || []), newSubcategory] }
          : c
      ));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSubcategory = async (categoryId: string, subcategoryId: string, newName: string) => {
    if (!newName) return;
    
    setLoading(true);
    setError(null);
    try {
      await categoriesApi.updateSubcategory(categoryId, subcategoryId, { name: newName });
      setCategories(prev => prev.map(c =>
        c.id === categoryId
          ? {
              ...c,
              subcategories: c.subcategories?.map(s =>
                s.id === subcategoryId ? { ...s, name: newName } : s
              )
            }
          : c
      ));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteSubcategory = async (categoryId: string, subcategoryId: string) => {
    setLoading(true);
    setError(null);
    try {
      await categoriesApi.deleteSubcategory(categoryId, subcategoryId);
      setCategories(prev => prev.map(c => 
        c.id === categoryId 
          ? { ...c, subcategories: c.subcategories?.filter(s => s.id !== subcategoryId) }
          : c
      ));
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

  const getSubcategoryNameById = (categoryId: string, subcategoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.subcategories?.find(s => s.id === subcategoryId)?.name || subcategoryId;
  };

  return (
    <CategoriesContext.Provider value={{ 
      categories, 
      loading, 
      error, 
      addCategory, 
      updateCategory, 
      deleteCategory, 
      addSubcategory,
      updateSubcategory,
      deleteSubcategory,
      getCategoryNameById,
      getSubcategoryNameById,
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
