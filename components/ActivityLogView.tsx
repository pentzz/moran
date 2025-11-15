import React, { useState, useMemo } from 'react';
import { useUsers } from '../context/UsersContext';
import { useProjects } from '../context/ProjectsContext';
import { useAuth } from '../context/AuthContext';
import { ActivityLog, User, Project } from '../types';
import { 
  SearchIcon, 
  FilterIcon, 
  CalendarIcon,
  UserIcon,
  ProjectIcon,
  ActivityIcon,
  EyeIcon
} from './Icons';

const ActivityLogView: React.FC = () => {
  const { users, activityLogs } = useUsers();
  const { projects } = useProjects();
  const { isAdmin } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'all'>('7d');

  // Only admin can access this view
  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="text-lg font-semibold text-red-800 mb-2">🚫 גישה מוגבלת</h3>
            <p className="text-red-600">
              רק מנהל המערכת יכול לצפות בלוג הפעילות.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getUserById = (userId: string): User | undefined => {
    return users.find(user => user.id === userId);
  };

  const getProjectById = (projectId: string): Project | undefined => {
    return projects.find(project => project.id === projectId);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'זה עתה';
    if (diffMinutes < 60) return `לפני ${diffMinutes} דקות`;
    if (diffHours < 24) return `לפני ${diffHours} שעות`;
    if (diffDays < 7) return `לפני ${diffDays} ימים`;
    if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;
    return `לפני ${Math.floor(diffDays / 30)} חודשים`;
  };

  const filteredLogs = useMemo(() => {
    let filtered = [...activityLogs];

    // Date range filter
    const now = new Date();
    let dateThreshold: Date | null = null;
    
    switch (dateRange) {
      case 'today':
        dateThreshold = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7d':
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        dateThreshold = null;
        break;
    }

    if (dateThreshold) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= dateThreshold!);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getUserById(log.userId)?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // User filter
    if (selectedUser !== 'all') {
      filtered = filtered.filter(log => log.userId === selectedUser);
    }

    // Project filter
    if (selectedProject !== 'all') {
      filtered = filtered.filter(log => {
        if (log.entityType === 'project') return log.entityId === selectedProject;
        // For income/expense/milestone, we need to find the project they belong to
        const project = projects.find(p => 
          p.incomes.some(i => i.id === log.entityId) ||
          p.expenses.some(e => e.id === log.entityId) ||
          p.milestones.some(m => m.id === log.entityId)
        );
        return project?.id === selectedProject;
      });
    }

    // Action filter
    if (selectedAction !== 'all') {
      filtered = filtered.filter(log => log.action.includes(selectedAction));
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return filtered;
  }, [activityLogs, searchTerm, selectedUser, selectedProject, selectedAction, dateRange, users, projects]);

  const actionTypes = [
    'יצר', 'עדכן', 'מחק', 'הוסיף', 'ארכב', 'שחזר', 'התחבר', 'התנתק'
  ];

  const getActionIcon = (action: string) => {
    if (action.includes('יצר') || action.includes('הוסיף')) return '✅';
    if (action.includes('עדכן')) return '📝';
    if (action.includes('מחק')) return '🗑️';
    if (action.includes('ארכב')) return '📦';
    if (action.includes('שחזר')) return '♻️';
    if (action.includes('התחבר')) return '🔑';
    if (action.includes('התנתק')) return '🚪';
    return '📋';
  };

  const getEntityTypeIcon = (entityType: string) => {
    switch (entityType) {
      case 'project': return <ProjectIcon />;
      case 'user': return <UserIcon />;
      case 'income': return '💰';
      case 'expense': return '💸';
      case 'milestone': return '🎯';
      case 'supplier': return '🏢';
      case 'category': return '📁';
      default: return <ActivityIcon />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">מעקב פעילות מתקדם</h1>
            <p className="text-gray-600 mt-1">
              צפייה בכל הפעולות שבוצעו במערכת עם מסננים חכמים
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ActivityIcon />
            <span className="text-sm text-gray-600">{filteredLogs.length} פעולות</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <SearchIcon />
            <input
              type="text"
              placeholder="חפש פעולה או משתמש..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">היום</option>
            <option value="7d">7 ימים אחרונים</option>
            <option value="30d">30 ימים אחרונים</option>
            <option value="all">כל הזמן</option>
          </select>

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

          {/* Project Filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">כל הפרויקטים</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          {/* Action Filter */}
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">כל הפעולות</option>
            {actionTypes.map(action => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">לוג פעילות</h3>
        </div>
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ActivityIcon />
              <p className="mt-2">לא נמצאו פעולות התואמות לחיפוש</p>
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const user = getUserById(log.userId);
              const project = log.entityType === 'project' ? getProjectById(log.entityId) : null;
              
              return (
                <div key={`${log.id}-${index}`} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {getEntityTypeIcon(log.entityType)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getActionIcon(log.action)}</span>
                        <span className="font-medium text-gray-900">{log.action}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <UserIcon />
                          <span>{user?.fullName || log.username}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 text-sm mb-2">{log.details}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <CalendarIcon />
                          <span>{getTimeAgo(log.timestamp)}</span>
                        </div>
                        <span>•</span>
                        <span>{new Date(log.timestamp).toLocaleString('he-IL')}</span>
                        {project && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <ProjectIcon />
                              <span>{project.name}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {log.entityType === 'project' && project && (
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
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">{filteredLogs.length}</div>
          <div className="text-gray-600">פעולות נמצאו</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-2xl font-bold text-green-600">
            {filteredLogs.filter(log => log.action.includes('יצר') || log.action.includes('הוסיף')).length}
          </div>
          <div className="text-gray-600">יצירות/הוספות</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {filteredLogs.filter(log => log.action.includes('עדכן')).length}
          </div>
          <div className="text-gray-600">עדכונים</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-2xl font-bold text-red-600">
            {filteredLogs.filter(log => log.action.includes('מחק')).length}
          </div>
          <div className="text-gray-600">מחיקות</div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogView;
