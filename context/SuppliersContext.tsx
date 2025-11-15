import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Supplier } from '../types';
import { suppliersApi } from '../services/serverApi';

interface SuppliersContextType {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => Promise<void>;
  updateSupplier: (id: string, data: Partial<Omit<Supplier, 'id' | 'createdAt'>>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  getSupplier: (id: string) => Supplier | undefined;
  refreshSuppliers: () => Promise<void>;
}

const SuppliersContext = createContext<SuppliersContextType | undefined>(undefined);

export const SuppliersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load suppliers on mount
  useEffect(() => {
    refreshSuppliers();
  }, []);

  const handleError = (error: any) => {
    if (error?.message) {
      setError(error.message);
    } else {
      setError('שגיאה לא צפויה');
    }
    console.error('Supplier operation error:', error);
  };

  const refreshSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedSuppliers = await suppliersApi.getAll();
      setSuppliers(fetchedSuppliers);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt'>) => {
    setError(null);
    try {
      const newSupplier = await suppliersApi.create(supplierData);
      setSuppliers(prev => [...prev, newSupplier]);
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const updateSupplier = async (id: string, data: Partial<Omit<Supplier, 'id' | 'createdAt'>>) => {
    setError(null);
    try {
      const updatedSupplier = await suppliersApi.update(id, data);
      setSuppliers(prev => prev.map(supplier => 
        supplier.id === id ? updatedSupplier : supplier
      ));
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const deleteSupplier = async (id: string) => {
    setError(null);
    try {
      await suppliersApi.delete(id);
      setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const getSupplier = (id: string) => {
    return suppliers.find(supplier => supplier.id === id);
  };

  const value: SuppliersContextType = {
    suppliers,
    loading,
    error,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplier,
    refreshSuppliers,
  };

  return (
    <SuppliersContext.Provider value={value}>
      {children}
    </SuppliersContext.Provider>
  );
};

export const useSuppliers = () => {
  const context = useContext(SuppliersContext);
  if (context === undefined) {
    throw new Error('useSuppliers must be used within a SuppliersProvider');
  }
  return context;
};
