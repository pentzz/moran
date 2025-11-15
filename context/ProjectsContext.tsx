import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { Project, Income, Expense, Milestone } from '../types';
import { projectsApi } from '../services/serverApi';
import { useAuth } from './AuthContext';

interface ProjectsContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  addProject: (project: Omit<Project, 'id' | 'incomes' | 'expenses' | 'isArchived'>) => Promise<void>;
  updateProject: (id: string, data: { name: string; description: string; contractAmount: number; }) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
  unarchiveProject: (id: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;
  addIncome: (projectId: string, income: Omit<Income, 'id'>) => Promise<void>;
  updateIncome: (projectId: string, incomeId: string, income: Partial<Income>) => Promise<void>;
  deleteIncome: (projectId: string, incomeId: string) => Promise<void>;
  addExpense: (projectId: string, expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (projectId: string, expenseId: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (projectId: string, expenseId: string) => Promise<void>;
  addMilestone: (projectId: string, milestone: Omit<Milestone, 'id'>) => Promise<void>;
  updateMilestone: (projectId: string, milestoneId: string, milestone: Partial<Milestone>) => Promise<void>;
  deleteMilestone: (projectId: string, milestoneId: string) => Promise<void>;
  deleteAllProjects: () => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();

  // Load projects on mount and when user changes
  useEffect(() => {
    if (user) {
      refreshProjects();
    }
  }, [user?.id]);

  const handleError = (error: any) => {
    if (error?.message) {
      setError(error.message);
    } else {
      setError('שגיאה לא צפויה');
    }
    console.error('Project operation error:', error);
  };

  const refreshProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedProjects = await projectsApi.getAll();
      setAllProjects(fetchedProjects);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on user role
  // For admin: show all projects
  // For regular users: show only their projects OR projects without ownerId (legacy)
  const projects = useMemo(() => {
    if (isAdmin) {
      return allProjects;
    }
    // For regular users, show projects they own OR projects without ownerId (for backward compatibility)
    return allProjects.filter(project => 
      !project.ownerId || 
      project.ownerId === user?.id || 
      project.createdBy === user?.id
    );
  }, [allProjects, isAdmin, user?.id]);

  const addProject = async (projectData: Omit<Project, 'id' | 'incomes' | 'expenses' | 'isArchived'>) => {
    setLoading(true);
    setError(null);
    try {
      // Add user info to project
      const projectWithOwner = {
        ...projectData,
        ownerId: user?.id || 'current-user',
        createdBy: user?.id || 'current-user'
      };
      const newProject = await projectsApi.create(projectWithOwner);
      setAllProjects(prev => [...prev, newProject]);
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: string, data: { name: string; description: string; contractAmount: number; }) => {
    setLoading(true);
    setError(null);
    try {
      const updatedProject = await projectsApi.update(id, data);
      setAllProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await projectsApi.delete(id);
      setAllProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteAllProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      await projectsApi.deleteAll();
      setAllProjects([]);
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const archiveProject = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedProject = await projectsApi.archive(id);
      setAllProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const unarchiveProject = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedProject = await projectsApi.unarchive(id);
      setAllProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getProject = (id: string) => {
    return projects.find(p => p.id === id);
  };

  const addIncome = async (projectId: string, incomeData: Omit<Income, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const newIncome = await projectsApi.addIncome(projectId, incomeData);
      setAllProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, incomes: [...p.incomes, newIncome] } : p
      ));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateIncome = async (projectId: string, incomeId: string, incomeData: Partial<Income>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedIncome = await projectsApi.updateIncome(projectId, incomeId, incomeData);
      setAllProjects(prev => prev.map(p =>
        p.id === projectId ? {
          ...p,
          incomes: p.incomes.map(i => i.id === incomeId ? updatedIncome : i)
        } : p
      ));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteIncome = async (projectId: string, incomeId: string) => {
    setLoading(true);
    setError(null);
    try {
      await projectsApi.deleteIncome(projectId, incomeId);
      setAllProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, incomes: p.incomes.filter(i => i.id !== incomeId) } : p
      ));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (projectId: string, expenseData: Omit<Expense, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const newExpense = await projectsApi.addExpense(projectId, expenseData);
      setAllProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, expenses: [...p.expenses, newExpense] } : p
      ));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateExpense = async (projectId: string, expenseId: string, expenseData: Partial<Expense>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedExpense = await projectsApi.updateExpense(projectId, expenseId, expenseData);
      setAllProjects(prev => prev.map(p =>
        p.id === projectId ? {
          ...p,
          expenses: p.expenses.map(e => e.id === expenseId ? updatedExpense : e)
        } : p
      ));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteExpense = async (projectId: string, expenseId: string) => {
    setLoading(true);
    setError(null);
    try {
      await projectsApi.deleteExpense(projectId, expenseId);
      setAllProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, expenses: p.expenses.filter(e => e.id !== expenseId) } : p
      ));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addMilestone = async (projectId: string, milestoneData: Omit<Milestone, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const newMilestone = await projectsApi.addMilestone(projectId, milestoneData);
      setAllProjects(prev => prev.map(p =>
        p.id === projectId ? { 
          ...p, 
          milestones: [...(p.milestones || []), newMilestone] 
        } : p
      ));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMilestone = async (projectId: string, milestoneId: string, milestoneData: Partial<Milestone>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedMilestone = await projectsApi.updateMilestone(projectId, milestoneId, milestoneData);
      setAllProjects(prev => prev.map(p =>
        p.id === projectId ? {
          ...p,
          milestones: (p.milestones || []).map(m => m.id === milestoneId ? updatedMilestone : m)
        } : p
      ));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteMilestone = async (projectId: string, milestoneId: string) => {
    setLoading(true);
    setError(null);
    try {
      await projectsApi.deleteMilestone(projectId, milestoneId);
      setAllProjects(prev => prev.map(p =>
        p.id === projectId ? { 
          ...p, 
          milestones: (p.milestones || []).filter(m => m.id !== milestoneId) 
        } : p
      ));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProjectsContext.Provider value={{ 
      projects, 
      loading, 
      error, 
      addProject, 
      updateProject, 
      deleteProject, 
      getProject, 
      addIncome, 
      updateIncome,
      deleteIncome, 
      addExpense, 
      updateExpense,
      deleteExpense, 
      addMilestone,
      updateMilestone,
      deleteMilestone,
      archiveProject, 
      unarchiveProject, 
      deleteAllProjects,
      refreshProjects
    }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};