import React, { useMemo, useState } from 'react';
import { useProjects } from '../context/ProjectsContext';
import { useUsers } from '../context/UsersContext';
import { useAuth } from '../context/AuthContext';
import { Project, User, ActivityLog } from '../types';
import AdvancedActivityTracker from './AdvancedActivityTracker';
import AdvancedReportsSystem from './AdvancedReportsSystem';
import AdvancedPermissionsSystem from './AdvancedPermissionsSystem';
import { 
  ProjectIcon, 
  UserIcon, 
  ActivityIcon, 
  StatsIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SettingsIcon,
  DownloadIcon
} from './Icons';

const formatCurrency = (num: number) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(num);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('he-IL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  subtitle?: string;
  colorClass: string; 
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
}> = ({ title, value, subtitle, colorClass, icon, trend }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className={`font-bold text-3xl mt-2 ${colorClass}`}>{value}</p>
        {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        {trend && (
          <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
            <span className="mr-1">{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="text-gray-400">
        {icon}
      </div>
    </div>
  </div>
);

const AdminProfessionalDashboard: React.FC = () => {
  const { projects } = useProjects();
  const { users, activityLogs } = useUsers();
  const { user: currentUser } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  // Simplified - no tabs, just one dashboard

  const dashboardStats = useMemo(() => {
    const now = new Date();
    const timeRangeMs = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000
    }[timeRange];

    const cutoffDate = new Date(now.getTime() - timeRangeMs);

    // פרויקטים
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => !p.isArchived).length;
    const archivedProjects = projects.filter(p => p.isArchived).length;
    const recentProjects = projects.filter(p => new Date(p.createdAt) > cutoffDate).length;

    // משתמשים
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const recentUsers = users.filter(u => new Date(u.createdAt) > cutoffDate).length;
    const onlineUsers = users.filter(u => 
      u.lastLogin && new Date(u.lastLogin) > new Date(now.getTime() - 5 * 60 * 1000)
    ).length;

    // פעילות
    const totalActivity = activityLogs.length;
    const recentActivity = activityLogs.filter(log => new Date(log.timestamp) > cutoffDate).length;
    const todayActivity = activityLogs.filter(log => 
      new Date(log.timestamp).toDateString() === now.toDateString()
    ).length;

    // כספים
    const totalContractValue = projects.reduce((sum, p) => sum + p.contractAmount, 0);
    const totalIncomes = projects.reduce((sum, p) => 
      sum + p.incomes.reduce((incSum, inc) => incSum + inc.amount, 0), 0);
    const totalExpenses = projects.reduce((sum, p) => 
      sum + p.expenses.reduce((expSum, exp) => expSum + exp.amount, 0), 0);
    const totalProfit = totalIncomes - totalExpenses;

    // מיילסטונס
    const totalMilestones = projects.reduce((sum, p) => sum + (p.milestones?.length || 0), 0);
    const completedMilestones = projects.reduce((sum, p) => 
      sum + (p.milestones?.filter(m => m.status === 'completed').length || 0), 0);
    const milestoneCompletionRate = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

    return {
      projects: { total: totalProjects, active: activeProjects, archived: archivedProjects, recent: recentProjects },
      users: { total: totalUsers, active: activeUsers, recent: recentUsers, online: onlineUsers },
      activity: { total: totalActivity, recent: recentActivity, today: todayActivity },
      finances: { contracts: totalContractValue, incomes: totalIncomes, expenses: totalExpenses, profit: totalProfit },
      milestones: { total: totalMilestones, completed: completedMilestones, completionRate: milestoneCompletionRate }
    };
  }, [projects, users, activityLogs, timeRange]);

  const recentActivity = useMemo(() => {
    return activityLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }, [activityLogs]);

  const topUsers = useMemo(() => {
    return users
      .map(user => {
        const userProjects = projects.filter(p => p.ownerId === user.id);
        const userIncomes = userProjects.reduce((sum, p) => 
          sum + p.incomes.reduce((incSum, inc) => incSum + inc.amount, 0), 0);
        const userExpenses = userProjects.reduce((sum, p) => 
          sum + p.expenses.reduce((expSum, exp) => expSum + exp.amount, 0), 0);
        const userProfit = userIncomes - userExpenses;
        
        return { ...user, projectsCount: userProjects.length, incomes: userIncomes, expenses: userExpenses, profit: userProfit };
      })
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  }, [users, projects]);

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              סקירה כללית
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              מעקב פעילות מתקדם
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              דוחות מתקדמים
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'permissions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ניהול הרשאות
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'activity' ? (
        <AdvancedActivityTracker />
      ) : activeTab === 'reports' ? (
        <AdvancedReportsSystem />
      ) : activeTab === 'permissions' ? (
        <AdvancedPermissionsSystem />
      ) : (
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">לוח בקרה מנהל עליון</h1>
              <p className="text-gray-600 mt-2">סקירה מקיפה של פעילות המערכת</p>
            </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">7 ימים אחרונים</option>
            <option value="30d">30 ימים אחרונים</option>
            <option value="90d">90 ימים אחרונים</option>
            <option value="1y">שנה אחרונה</option>
          </select>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="פרויקטים פעילים"
          value={dashboardStats.projects.active.toString()}
          subtitle={`מתוך ${dashboardStats.projects.total} פרויקטים`}
          colorClass="text-blue-600"
          icon={<ProjectIcon />}
        />
        <StatCard
          title="משתמשים פעילים"
          value={dashboardStats.users.active.toString()}
          subtitle={`${dashboardStats.users.online} מחוברים עכשיו`}
          colorClass="text-green-600"
          icon={<UserIcon />}
        />
        <StatCard
          title="פעילות היום"
          value={dashboardStats.activity.today.toString()}
          subtitle={`${dashboardStats.activity.recent} פעולות ב-${timeRange === '7d' ? '7 ימים' : timeRange === '30d' ? '30 ימים' : timeRange === '90d' ? '90 ימים' : 'שנה'}`}
          colorClass="text-purple-600"
          icon={<ActivityIcon />}
        />
        <StatCard
          title="רווח כולל"
          value={formatCurrency(dashboardStats.finances.profit)}
          subtitle={`הכנסות: ${formatCurrency(dashboardStats.finances.incomes)}`}
          colorClass={dashboardStats.finances.profit >= 0 ? 'text-green-600' : 'text-red-600'}
          icon={<StatsIcon />}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="שווי חוזים כולל"
          value={formatCurrency(dashboardStats.finances.contracts)}
          colorClass="text-gray-700"
          icon={<ProjectIcon />}
        />
        <StatCard
          title="מיילסטונס הושלמו"
          value={`${dashboardStats.milestones.completed}/${dashboardStats.milestones.total}`}
          subtitle={`${dashboardStats.milestones.completionRate.toFixed(1)}% השלמה`}
          colorClass="text-blue-600"
          icon={<CheckCircleIcon />}
        />
        <StatCard
          title="פרויקטים חדשים"
          value={dashboardStats.projects.recent.toString()}
          subtitle={`ב-${timeRange === '7d' ? '7 ימים' : timeRange === '30d' ? '30 ימים' : timeRange === '90d' ? '90 ימים' : 'שנה'}`}
          colorClass="text-green-600"
          icon={<TrendingUpIcon />}
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Users */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">משתמשים מובילים</h3>
          <div className="space-y-4">
            {topUsers.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.fullName || user.username}</p>
                    <p className="text-sm text-gray-500">{user.projectsCount} פרויקטים</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-green-600">{formatCurrency(user.profit)}</p>
                  <p className="text-sm text-gray-500">רווח</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">פעילות אחרונה</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentActivity.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ActivityIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{log.action}</p>
                  <p className="text-sm text-gray-500">{log.details}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(log.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">בריאות המערכת</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircleIcon />
            </div>
            <h4 className="font-semibold text-gray-900">משתמשים פעילים</h4>
            <p className="text-2xl font-bold text-green-600">{dashboardStats.users.active}</p>
            <p className="text-sm text-gray-500">מתוך {dashboardStats.users.total}</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ProjectIcon />
            </div>
            <h4 className="font-semibold text-gray-900">פרויקטים פעילים</h4>
            <p className="text-2xl font-bold text-blue-600">{dashboardStats.projects.active}</p>
            <p className="text-sm text-gray-500">מתוך {dashboardStats.projects.total}</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ActivityIcon />
            </div>
            <h4 className="font-semibold text-gray-900">פעילות היום</h4>
            <p className="text-2xl font-bold text-purple-600">{dashboardStats.activity.today}</p>
            <p className="text-sm text-gray-500">פעולות</p>
          </div>
        </div>
      </div>

      {/* Advanced Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">מדדי ביצועים</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">שיעור השלמת מיילסטונס</span>
              <span className="text-lg font-bold text-blue-600">
                {dashboardStats.milestones.completionRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${dashboardStats.milestones.completionRate}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">שיעור רווחיות</span>
              <span className={`text-lg font-bold ${dashboardStats.finances.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dashboardStats.finances.contracts > 0 ? 
                  ((dashboardStats.finances.profit / dashboardStats.finances.contracts) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${dashboardStats.finances.profit >= 0 ? 'bg-green-600' : 'bg-red-600'}`}
                style={{ width: `${Math.min(Math.abs(dashboardStats.finances.profit / dashboardStats.finances.contracts) * 100, 100)}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">פעילות משתמשים</span>
              <span className="text-lg font-bold text-purple-600">
                {dashboardStats.users.total > 0 ? 
                  ((dashboardStats.users.active / dashboardStats.users.total) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${dashboardStats.users.total > 0 ? (dashboardStats.users.active / dashboardStats.users.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">פעולות מהירות</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'users' } }))}
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 text-center"
            >
              <UserIcon />
              <p className="text-sm font-medium text-blue-700 mt-2">ניהול משתמשים</p>
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'settings' } }))}
              className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 text-center"
            >
              <SettingsIcon />
              <p className="text-sm font-medium text-green-700 mt-2">הגדרות מערכת</p>
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'projectsList' } }))}
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 text-center"
            >
              <ProjectIcon />
              <p className="text-sm font-medium text-purple-700 mt-2">כל הפרויקטים</p>
            </button>
            <button 
              onClick={() => {
                // Export system data
                const data = {
                  users: users.length,
                  projects: projects.length,
                  activity: activityLogs.length,
                  timestamp: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `system-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors duration-200 text-center"
            >
              <DownloadIcon />
              <p className="text-sm font-medium text-yellow-700 mt-2">גיבוי מערכת</p>
            </button>
          </div>
        </div>
      </div>

      {/* System Notifications */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">התראות מערכת</h3>
        <div className="space-y-3">
          {dashboardStats.users.total === 0 && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <ExclamationTriangleIcon />
              <div className="mr-3">
                <p className="text-sm font-medium text-red-800">אין משתמשים במערכת</p>
                <p className="text-xs text-red-600">מומלץ להוסיף משתמשים חדשים</p>
              </div>
            </div>
          )}
          
          {dashboardStats.projects.total === 0 && (
            <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <ExclamationTriangleIcon />
              <div className="mr-3">
                <p className="text-sm font-medium text-yellow-800">אין פרויקטים במערכת</p>
                <p className="text-xs text-yellow-600">מומלץ ליצור פרויקטים חדשים</p>
              </div>
            </div>
          )}
          
          {dashboardStats.finances.profit < 0 && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <ExclamationTriangleIcon />
              <div className="mr-3">
                <p className="text-sm font-medium text-red-800">הפסד במערכת</p>
                <p className="text-xs text-red-600">סך ההוצאות עולה על ההכנסות</p>
              </div>
            </div>
          )}
          
          {dashboardStats.milestones.completionRate < 50 && dashboardStats.milestones.total > 0 && (
            <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <ExclamationTriangleIcon />
              <div className="mr-3">
                <p className="text-sm font-medium text-orange-800">שיעור השלמה נמוך</p>
                <p className="text-xs text-orange-600">פחות מ-50% מהמיילסטונס הושלמו</p>
              </div>
            </div>
          )}
          
          {dashboardStats.activity.today === 0 && (
            <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <ClockIcon />
              <div className="mr-3">
                <p className="text-sm font-medium text-blue-800">אין פעילות היום</p>
                <p className="text-xs text-blue-600">לא נרשמה פעילות במערכת היום</p>
              </div>
            </div>
          )}
          
          {dashboardStats.users.active === dashboardStats.users.total && dashboardStats.users.total > 0 && (
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircleIcon />
              <div className="mr-3">
                <p className="text-sm font-medium text-green-800">כל המשתמשים פעילים</p>
                <p className="text-xs text-green-600">מצב מעולה - כל המשתמשים פעילים</p>
              </div>
            </div>
          )}
        </div>
      </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfessionalDashboard;
