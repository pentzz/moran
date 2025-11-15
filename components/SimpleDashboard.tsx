import React, { useMemo } from 'react';
import { useProjects } from '../context/ProjectsContext';
import { useUsers } from '../context/UsersContext';
import { useAuth } from '../context/AuthContext';
import { Project, User } from '../types';
import { 
  ProjectIcon, 
  UserIcon, 
  StatsIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  ActivityIcon,
  SettingsIcon,
  DownloadIcon,
  BellIcon
} from './Icons';

const SimpleDashboard: React.FC = () => {
  const { projects } = useProjects();
  const { users } = useUsers();
  const { user: currentUser } = useAuth();

  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => !p.isArchived);
    const totalUsers = users.length;
    
    const totalRevenue = projects.reduce((sum, project) => 
      sum + project.incomes.reduce((incSum, income) => incSum + income.amount, 0), 0
    );
    
    const totalExpenses = projects.reduce((sum, project) => 
      sum + project.expenses.reduce((expSum, expense) => expSum + expense.amount, 0), 0
    );
    
    const profit = totalRevenue - totalExpenses;
    
    return {
      activeProjects: activeProjects.length,
      totalUsers,
      totalRevenue,
      totalExpenses,
      profit
    };
  }, [projects, users]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', { 
      style: 'currency', 
      currency: 'ILS',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const quickActions = [
    { 
      title: 'ניהול משתמשים', 
      description: 'הוסף או ערוך משתמשים', 
      icon: UserIcon,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate', { 
          detail: { view: 'users' } 
        }));
      }
    },
    { 
      title: 'הגדרות מערכת', 
      description: 'ערוך הגדרות כלליות', 
      icon: SettingsIcon,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate', { 
          detail: { view: 'settings' } 
        }));
      }
    },
    { 
      title: 'כל הפרויקטים', 
      description: 'צפה בכל הפרויקטים עם חיפוש', 
      icon: ProjectIcon,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate', { 
          detail: { view: 'allProjects' } 
        }));
      }
    },
    { 
      title: 'הפרויקטים שלי', 
      description: 'חזור לרשימת הפרויקטים האישיים', 
      icon: ProjectIcon,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate', { 
          detail: { view: 'projectsList' } 
        }));
      }
    },
    { 
      title: 'מעקב פעילות', 
      description: 'צפה בכל הפעולות במערכת', 
      icon: ActivityIcon,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate', { 
          detail: { view: 'activityLog' } 
        }));
      }
    },
    { 
      title: 'התראות מותאמות', 
      description: 'שלח התראות למשתמשים ספציפיים', 
      icon: BellIcon,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate', { 
          detail: { view: 'adminNotifications' } 
        }));
      }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">לוח בקרה מנהל עליון</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              ברוך הבא {currentUser?.fullName || currentUser?.username}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ActivityIcon />
            <span className="text-xs sm:text-sm text-gray-600">דאשבורד פשוט</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
            <ProjectIcon />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.activeProjects}</div>
          <div className="text-sm sm:text-base text-gray-600">פרויקטים פעילים</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
            <UserIcon />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.totalUsers}</div>
          <div className="text-sm sm:text-base text-gray-600">משתמשים במערכת</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
            <TrendingUpIcon />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
          <div className="text-sm sm:text-base text-gray-600">סך הכנסות</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
            <TrendingDownIcon />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-red-600">{formatCurrency(stats.totalExpenses)}</div>
          <div className="text-sm sm:text-base text-gray-600">סך הוצאות</div>
        </div>
      </div>

      {/* Profit/Loss Summary */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">סיכום פיננסי</h3>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg gap-4">
          <div>
            <p className="text-sm text-gray-600">רווח/הפסד כולל</p>
            <p className={`text-xl sm:text-2xl font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.profit)}
            </p>
          </div>
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${
            stats.profit >= 0 ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <StatsIcon />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">פעולות מהירות</h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="p-4 sm:p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-right"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                    <action.icon />
                  </div>
                  <div className="text-center sm:text-right">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">{action.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">פרויקטים אחרונים</h3>
        </div>
        <div className="p-4 sm:p-6">
          {projects.length === 0 ? (
            <p className="text-gray-600 text-center py-8 text-sm sm:text-base">אין פרויקטים עדיין</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {projects.slice(0, 5).map((project) => {
                const revenue = project.incomes.reduce((sum, income) => sum + income.amount, 0);
                const expenses = project.expenses.reduce((sum, expense) => sum + expense.amount, 0);
                const profit = revenue - expenses;
                
                return (
                  <div key={project.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{project.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        תקציב: {formatCurrency(project.contractAmount || 0)}
                        {project.isArchived && <span className="text-orange-600 mr-2">(ארכיון)</span>}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className={`font-medium text-sm sm:text-base ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(profit)}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">רווח</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
