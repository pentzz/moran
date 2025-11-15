import React, { useState, useMemo } from 'react';
import { useProjects } from '../context/ProjectsContext';
import { useUsers } from '../context/UsersContext';
import { useAuth } from '../context/AuthContext';
import { Project, User } from '../types';
import { 
  SearchIcon, 
  FilterIcon, 
  ProjectIcon, 
  UserIcon, 
  CalendarIcon,
  EyeIcon,
  StatsIcon
} from './Icons';

const AllProjectsView: React.FC = () => {
  const { projects } = useProjects();
  const { users } = useUsers();
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'revenue' | 'profit'>('name');

  // Only admin can access this view
  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="text-lg font-semibold text-red-800 mb-2">🚫 גישה מוגבלת</h3>
            <p className="text-red-600">
              רק מנהל המערכת יכול לצפות בכל הפרויקטים.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getUserById = (userId: string): User | undefined => {
    return users.find(user => user.id === userId);
  };

  const getProjectStats = (project: Project) => {
    const revenue = project.incomes.reduce((sum, income) => sum + income.amount, 0);
    const expenses = project.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const profit = revenue - expenses;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    return { revenue, expenses, profit, profitMargin };
  };

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      // Search filter
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           getUserById(project.ownerId || '')?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // User filter
      const matchesUser = selectedUser === 'all' || project.ownerId === selectedUser;
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && !project.isArchived) ||
                           (statusFilter === 'archived' && project.isArchived);
      
      return matchesSearch && matchesUser && matchesStatus;
    });

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        case 'revenue': {
          const aRevenue = getProjectStats(a).revenue;
          const bRevenue = getProjectStats(b).revenue;
          return bRevenue - aRevenue;
        }
        case 'profit': {
          const aProfit = getProjectStats(a).profit;
          const bProfit = getProjectStats(b).profit;
          return bProfit - aProfit;
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, searchTerm, selectedUser, statusFilter, sortBy, users]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', { 
      style: 'currency', 
      currency: 'ILS',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const getTimeAgo = (dateString: string) => {
    if (!dateString) return 'לא ידוע';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'היום';
    if (diffDays === 1) return 'אתמול';
    if (diffDays < 7) return `לפני ${diffDays} ימים`;
    if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;
    if (diffDays < 365) return `לפני ${Math.floor(diffDays / 30)} חודשים`;
    return `לפני ${Math.floor(diffDays / 365)} שנים`;
  };

  const totalStats = useMemo(() => {
    const filtered = filteredAndSortedProjects;
    const totalRevenue = filtered.reduce((sum, project) => sum + getProjectStats(project).revenue, 0);
    const totalExpenses = filtered.reduce((sum, project) => sum + getProjectStats(project).expenses, 0);
    const totalProfit = totalRevenue - totalExpenses;
    
    return {
      count: filtered.length,
      totalRevenue,
      totalExpenses,
      totalProfit
    };
  }, [filteredAndSortedProjects]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">כל הפרויקטים במערכת</h1>
            <p className="text-gray-600 mt-1">
              צפייה וניהול כל הפרויקטים של כל המשתמשים
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ProjectIcon />
            <span className="text-sm text-gray-600">{totalStats.count} פרויקטים</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <SearchIcon />
            <input
              type="text"
              placeholder="חפש פרויקט או משתמש..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* User Filter */}
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">כל המשתמשים</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.fullName || user.username}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">כל הסטטוסים</option>
            <option value="active">פעילים</option>
            <option value="archived">ארכיון</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">מיון לפי שם</option>
            <option value="date">מיון לפי תאריך</option>
            <option value="revenue">מיון לפי הכנסות</option>
            <option value="profit">מיון לפי רווח</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ProjectIcon />
          </div>
          <div className="text-2xl font-bold text-blue-600">{totalStats.count}</div>
          <div className="text-gray-600">פרויקטים</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <StatsIcon />
          </div>
          <div className="text-xl font-bold text-green-600">{formatCurrency(totalStats.totalRevenue)}</div>
          <div className="text-gray-600">סך הכנסות</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <StatsIcon />
          </div>
          <div className="text-xl font-bold text-red-600">{formatCurrency(totalStats.totalExpenses)}</div>
          <div className="text-gray-600">סך הוצאות</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
            totalStats.totalProfit >= 0 ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <StatsIcon />
          </div>
          <div className={`text-xl font-bold ${
            totalStats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(totalStats.totalProfit)}
          </div>
          <div className="text-gray-600">רווח נקי</div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">רשימת פרויקטים</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredAndSortedProjects.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              לא נמצאו פרויקטים התואמים לחיפוש
            </div>
          ) : (
            filteredAndSortedProjects.map(project => {
              const owner = getUserById(project.ownerId || '');
              const stats = getProjectStats(project);
              
              return (
                <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900 truncate">
                          {project.name}
                        </h4>
                        {project.isArchived && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            ארכיון
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <UserIcon />
                          <span>{owner?.fullName || owner?.username || 'לא ידוע'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon />
                          <span>נוצר {getTimeAgo(project.createdAt || '')}</span>
                        </div>
                      </div>
                      
                      {project.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">תקציב:</span>
                          <span className="font-medium text-gray-900 mr-1">
                            {formatCurrency(project.contractAmount || 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">הכנסות:</span>
                          <span className="font-medium text-green-600 mr-1">
                            {formatCurrency(stats.revenue)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">הוצאות:</span>
                          <span className="font-medium text-red-600 mr-1">
                            {formatCurrency(stats.expenses)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">רווח:</span>
                          <span className={`font-medium mr-1 ${
                            stats.profit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(stats.profit)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mr-4">
                      <button
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('navigate', { 
                            detail: { view: 'projectView', projectId: project.id } 
                          }));
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="צפה בפרויקט"
                      >
                        <EyeIcon />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AllProjectsView;
