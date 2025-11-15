import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { ActivityLog, User, Project } from '../types';
import { activityApi, usersApi, projectsApi } from '../services/serverApi';
import { 
  ClockIcon, 
  UserIcon, 
  ProjectIcon, 
  FilterIcon, 
  CalendarIcon,
  EyeIcon,
  TrendingUpIcon,
  TrendingDownIcon 
} from './Icons';

interface ActivityFilter {
  userId?: string;
  projectId?: string;
  entityType?: 'project' | 'income' | 'expense' | 'user' | 'category' | 'supplier' | '';
  dateRange?: {
    start: string;
    end: string;
  };
  searchText?: string;
}

const AdvancedActivityTracker: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<ActivityFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [activitiesData, usersData, projectsData] = await Promise.all([
        activityApi.getAll(),
        isAdmin ? usersApi.getAll() : Promise.resolve([]),
        projectsApi.getAll()
      ]);

      setActivities(activitiesData);
      setUsers(usersData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading activity data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredActivities = useMemo(() => {
    let filtered = activities;

    // Filter by user (only if admin or specific user)
    if (filter.userId) {
      filtered = filtered.filter(activity => activity.userId === filter.userId);
    } else if (!isAdmin) {
      // Non-admin users see only their activities
      filtered = filtered.filter(activity => activity.userId === user?.id);
    }

    // Filter by project
    if (filter.projectId) {
      filtered = filtered.filter(activity => activity.entityId === filter.projectId);
    }

    // Filter by entity type
    if (filter.entityType) {
      filtered = filtered.filter(activity => activity.entityType === filter.entityType);
    }

    // Filter by search text
    if (filter.searchText) {
      const searchLower = filter.searchText.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.action.toLowerCase().includes(searchLower) ||
        activity.details.toLowerCase().includes(searchLower) ||
        activity.username.toLowerCase().includes(searchLower)
      );
    }

    // Filter by time range
    const now = new Date();
    let startDate: Date;
    
    switch (selectedTimeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0);
    }

    if (selectedTimeRange !== 'all') {
      filtered = filtered.filter(activity => 
        new Date(activity.timestamp) >= startDate
      );
    }

    // Filter by custom date range
    if (filter.dateRange) {
      const start = new Date(filter.dateRange.start);
      const end = new Date(filter.dateRange.end);
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        return activityDate >= start && activityDate <= end;
      });
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activities, filter, selectedTimeRange, isAdmin, user?.id]);

  const getActivityIcon = (entityType: string) => {
    switch (entityType) {
      case 'project': return <ProjectIcon />;
      case 'user': return <UserIcon />;
      case 'income': return <TrendingUpIcon />;
      case 'expense': return <TrendingDownIcon />;
      default: return <ClockIcon />;
    }
  };

  const getActivityColor = (entityType: string) => {
    switch (entityType) {
      case 'project': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'user': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'income': return 'text-green-600 bg-green-50 border-green-200';
      case 'expense': return 'text-red-600 bg-red-50 border-red-200';
      case 'category': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'supplier': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'עכשיו';
    if (diffMinutes < 60) return `לפני ${diffMinutes} דקות`;
    if (diffHours < 24) return `לפני ${diffHours} שעות`;
    if (diffDays < 7) return `לפני ${diffDays} ימים`;
    
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserName = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser?.fullName || foundUser?.username || 'משתמש לא ידוע';
  };

  const getProjectName = (projectId: string) => {
    const foundProject = projects.find(p => p.id === projectId);
    return foundProject?.name || 'פרויקט לא ידוע';
  };

  const activityStats = useMemo(() => {
    const stats = {
      total: filteredActivities.length,
      byType: {} as Record<string, number>,
      byUser: {} as Record<string, number>,
      recentActions: filteredActivities.slice(0, 5)
    };

    filteredActivities.forEach(activity => {
      stats.byType[activity.entityType] = (stats.byType[activity.entityType] || 0) + 1;
      stats.byUser[activity.userId] = (stats.byUser[activity.userId] || 0) + 1;
    });

    return stats;
  }, [filteredActivities]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">מעקב פעילות מתקדם</h1>
            <p className="text-gray-600 mt-1">
              עקוב אחר כל הפעולות במערכת עם timestamps מפורטים
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <FilterIcon />
              {showFilters ? 'הסתר מסננים' : 'הצג מסננים'}
            </button>
            <button
              onClick={loadData}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              רענן
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{activityStats.total}</div>
          <div className="text-gray-600">סך פעולות</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600">
            {activityStats.byType['income'] || 0}
          </div>
          <div className="text-gray-600">פעולות הכנסה</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-red-600">
            {activityStats.byType['expense'] || 0}
          </div>
          <div className="text-gray-600">פעולות הוצאה</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">
            {Object.keys(activityStats.byUser).length}
          </div>
          <div className="text-gray-600">משתמשים פעילים</div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">מסננים</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Time Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                טווח זמן
              </label>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">היום</option>
                <option value="week">השבוע</option>
                <option value="month">החודש</option>
                <option value="all">הכל</option>
              </select>
            </div>

            {/* User Filter (only for admin) */}
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  משתמש
                </label>
                <select
                  value={filter.userId || ''}
                  onChange={(e) => setFilter(prev => ({ ...prev, userId: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">כל המשתמשים</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.fullName || user.username}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Project Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                פרויקט
              </label>
              <select
                value={filter.projectId || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, projectId: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">כל הפרויקטים</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Entity Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                סוג פעולה
              </label>
              <select
                value={filter.entityType || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, entityType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">כל הפעולות</option>
                <option value="project">פרויקטים</option>
                <option value="income">הכנסות</option>
                <option value="expense">הוצאות</option>
                <option value="user">משתמשים</option>
                <option value="category">קטגוריות</option>
                <option value="supplier">ספקים</option>
              </select>
            </div>

            {/* Search */}
            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                חיפוש טקסט
              </label>
              <input
                type="text"
                value={filter.searchText || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, searchText: e.target.value || undefined }))}
                placeholder="חפש בפעולות, פרטים או משתמשים..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Activities List */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            פעילות אחרונה ({filteredActivities.length} פעולות)
          </h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ClockIcon />
              <p className="mt-2">אין פעילות להצגה</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredActivities.map(activity => (
                <div
                  key={activity.id}
                  className="p-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg border ${getActivityColor(activity.entityType)}`}>
                      {getActivityIcon(activity.entityType)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.details}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <UserIcon />
                              {getUserName(activity.userId)}
                            </span>
                            {activity.entityType === 'project' && (
                              <span className="flex items-center gap-1">
                                <ProjectIcon />
                                {getProjectName(activity.entityId)}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <ClockIcon />
                              {formatTimestamp(activity.timestamp)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString('he-IL')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedActivityTracker;
