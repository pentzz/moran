import React, { useState, useMemo } from 'react';
import { useUsers } from '../context/UsersContext';
import { useProjects } from '../context/ProjectsContext';
import { useAuth } from '../context/AuthContext';
import { User, UserRole, ActivityLog } from '../types';
import { EditIcon, EyeIcon, ProjectIcon, ActivityIcon, StatsIcon } from './Icons';
import Modal from './Modal';
import UserProjectsModal from './UserProjectsModal';
import UserMessageModal from './UserMessageModal';

const formatCurrency = (num: number) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(num);

const UserCard: React.FC<{
  user: User;
  onViewAsUser: (user: User) => void;
  onViewActivity: (user: User) => void;
  onViewProjects: (user: User) => void;
  onSendMessage: (user: User) => void;
  stats: {
    projectsCount: number;
    totalIncome: number;
    totalExpenses: number;
    lastLoginFormatted: string;
  };
}> = ({ user, onViewAsUser, onViewActivity, onViewProjects, onSendMessage, stats }) => {
  const isOnline = user.lastLogin && new Date(user.lastLogin) > new Date(Date.now() - 5 * 60 * 1000); // Last 5 minutes

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user.fullName ? user.fullName.charAt(0) : user.username.charAt(0).toUpperCase()}
            </div>
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-gray-900 truncate">{user.fullName || user.username}</h3>
            <p className="text-sm text-gray-500 truncate">@{user.username}</p>
            <div className="flex flex-wrap items-center mt-1 gap-1">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.role === UserRole.Admin 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user.role === UserRole.Admin ? 'אדמין' : 'משתמש'}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? 'פעיל' : 'לא פעיל'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-1 sm:space-x-2 self-end sm:self-start">
          <button
            onClick={() => onViewAsUser(user)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
            title="צפה כמשתמש"
          >
            <EyeIcon />
          </button>
          <button
            onClick={() => onViewActivity(user)}
            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors flex-shrink-0"
            title="יומן פעילות"
          >
            <ActivityIcon />
          </button>
          <button
            onClick={() => onViewProjects(user)}
            className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors flex-shrink-0"
            title="פרוייקטים"
          >
            <ProjectIcon />
          </button>
          <button
            onClick={() => onSendMessage(user)}
            className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors flex-shrink-0"
            title="שלח הודעה"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:gap-4 mb-4">
        <div className="bg-blue-50 p-2 lg:p-3 rounded-lg">
          <p className="text-xs text-blue-600 font-medium">פרוייקטים</p>
          <p className="text-base lg:text-lg font-bold text-blue-800">{stats.projectsCount}</p>
        </div>
        <div className="bg-green-50 p-2 lg:p-3 rounded-lg">
          <p className="text-xs text-green-600 font-medium">הכנסות</p>
          <p className="text-xs lg:text-sm font-bold text-green-800 truncate">{formatCurrency(stats.totalIncome)}</p>
        </div>
        <div className="bg-red-50 p-2 lg:p-3 rounded-lg">
          <p className="text-xs text-red-600 font-medium">הוצאות</p>
          <p className="text-xs lg:text-sm font-bold text-red-800 truncate">{formatCurrency(stats.totalExpenses)}</p>
        </div>
        <div className="bg-yellow-50 p-2 lg:p-3 rounded-lg">
          <p className="text-xs text-yellow-600 font-medium">רווח</p>
          <p className="text-xs lg:text-sm font-bold text-yellow-800 truncate">
            {formatCurrency(stats.totalIncome - stats.totalExpenses)}
          </p>
        </div>
      </div>

      <div className="border-t pt-3 space-y-1">
        <div className="flex items-center justify-between text-xs lg:text-sm text-gray-500">
          <span>כניסה אחרונה:</span>
          <span className="font-medium text-left truncate max-w-32 lg:max-w-none">{stats.lastLoginFormatted}</span>
        </div>
        {user.email && (
          <div className="flex items-center justify-between text-xs lg:text-sm text-gray-500">
            <span>אימייל:</span>
            <span className="font-medium text-left truncate max-w-32 lg:max-w-none">{user.email}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const UserActivityModal: React.FC<{
  user: User;
  isOpen: boolean;
  onClose: () => void;
}> = ({ user, isOpen, onClose }) => {
  const { activityLogs } = useUsers();
  
  const userLogs = activityLogs.filter(log => log.userId === user.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`יומן פעילות - ${user.fullName || user.username}`}>
      <div className="space-y-4">
        {userLogs.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            {userLogs.map((log) => (
              <div key={log.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-900">{log.action}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString('he-IL')}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{log.details}</p>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>סוג: {log.entityType}</span>
                  <span>מזהה: {log.entityId}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 p-8">אין פעילות נרשמת עבור משתמש זה</p>
        )}
      </div>
    </Modal>
  );
};

const AdminDashboard: React.FC = () => {
  const { users, activityLogs } = useUsers();
  const { projects } = useProjects();
  const { user: currentUser, impersonateUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Don't show the current super admin user
      if (user.username === 'moran') return false;
      
      if (filterRole !== 'all') {
        if (filterRole === 'admin' && user.role !== UserRole.Admin) return false;
        if (filterRole === 'user' && user.role !== UserRole.User) return false;
      }
      
      if (filterStatus !== 'all') {
        if (filterStatus === 'active' && !user.isActive) return false;
        if (filterStatus === 'inactive' && user.isActive) return false;
      }
      
      return true;
    });
  }, [users, filterRole, filterStatus]);

  const getUserStats = (user: User) => {
    const userProjects = projects.filter(p => p.ownerId === user.id);
    const totalIncome = userProjects.reduce((sum, p) => 
      sum + p.incomes.reduce((incSum, inc) => incSum + inc.amount, 0), 0);
    const totalExpenses = userProjects.reduce((sum, p) => 
      sum + p.expenses.reduce((expSum, exp) => expSum + exp.amount, 0), 0);
    
    const lastLoginFormatted = user.lastLogin 
      ? new Date(user.lastLogin).toLocaleString('he-IL')
      : 'מעולם לא נכנס';

    return {
      projectsCount: userProjects.length,
      totalIncome,
      totalExpenses,
      lastLoginFormatted
    };
  };

  const systemStats = useMemo(() => {
    const totalUsers = filteredUsers.length;
    const activeUsers = filteredUsers.filter(u => u.isActive).length;
    const totalProjects = projects.length;
    const recentActivity = activityLogs.filter(log => 
      new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;

    return { totalUsers, activeUsers, totalProjects, recentActivity };
  }, [filteredUsers, projects, activityLogs]);

  const handleViewAsUser = (user: User) => {
    if (window.confirm(`האם אתה בטוח שברצונך לצפות במערכת כמשתמש ${user.fullName || user.username}?`)) {
      impersonateUser(user);
    }
  };

  const handleViewActivity = (user: User) => {
    setSelectedUser(user);
    setShowActivityModal(true);
  };

  const handleViewProjects = (user: User) => {
    setSelectedUser(user);
    setShowProjectsModal(true);
  };

  const handleSendMessage = (user: User) => {
    setSelectedUser(user);
    setShowMessageModal(true);
  };

  const handleViewProject = (projectId: string) => {
    // Navigate to project view
    const event = new CustomEvent('navigate', { 
      detail: { 
        view: 'projectView', 
        projectId: projectId 
      } 
    });
    window.dispatchEvent(event);
  };

  if (!currentUser || currentUser.role !== UserRole.Admin) {
    return <div className="text-center text-red-500 p-8">אין לך הרשאה לצפות בעמוד זה.</div>;
  }

  return (
    <div className="space-y-4 lg:space-y-6 p-2 sm:p-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 lg:p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">לוח בקרה מנהל עליון</h1>
            <p className="text-blue-100 mt-1 lg:mt-2 text-xs sm:text-sm lg:text-base">ניהול משתמשים ומעקב פעילות מתקדם</p>
          </div>
          <StatsIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-blue-200 flex-shrink-0 mr-2 sm:mr-4" />
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 sm:p-2.5 lg:p-3 rounded-full flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="mr-2 sm:mr-3 lg:mr-4 min-w-0">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 truncate">סה״כ משתמשים</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 sm:p-2.5 lg:p-3 rounded-full flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mr-2 sm:mr-3 lg:mr-4 min-w-0">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{systemStats.activeUsers}</p>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 truncate">משתמשים פעילים</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 sm:p-2.5 lg:p-3 rounded-full flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="mr-2 sm:mr-3 lg:mr-4 min-w-0">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{systemStats.totalProjects}</p>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 truncate">סה״כ פרוייקטים</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 sm:p-2.5 lg:p-3 rounded-full flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="mr-2 sm:mr-3 lg:mr-4 min-w-0">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{systemStats.recentActivity}</p>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 truncate">פעילות ב-24 שעות</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">סינון משתמשים</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">סוג משתמש</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="w-full border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">הכל</option>
              <option value="admin">אדמינים</option>
              <option value="user">משתמשים רגילים</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">סטטוס</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">הכל</option>
              <option value="active">פעילים</option>
              <option value="inactive">לא פעילים</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterRole('all');
                setFilterStatus('all');
              }}
              className="w-full h-8 sm:h-10 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
            >
              נקה סינונים
            </button>
          </div>
          
          <div className="flex items-end">
            <div className="text-xs sm:text-sm text-gray-600 bg-blue-50 px-2 sm:px-3 py-1 sm:py-2 rounded-lg w-full text-center">
              <span className="font-medium">{filteredUsers.length}</span> משתמשים מוצגים
            </div>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onViewAsUser={handleViewAsUser}
            onViewActivity={handleViewActivity}
            onViewProjects={handleViewProjects}
            onSendMessage={handleSendMessage}
            stats={getUserStats(user)}
          />
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center text-gray-500 p-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <p className="text-xl font-semibold">לא נמצאו משתמשים</p>
          <p className="text-gray-400 mt-2">נסה לשנות את הסינונים או להוסיף משתמשים חדשים</p>
        </div>
      )}

      {/* Activity Modal */}
      {selectedUser && (
        <UserActivityModal
          user={selectedUser}
          isOpen={showActivityModal}
          onClose={() => {
            setShowActivityModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Projects Modal */}
      {selectedUser && (
        <UserProjectsModal
          user={selectedUser}
          isOpen={showProjectsModal}
          onClose={() => {
            setShowProjectsModal(false);
            setSelectedUser(null);
          }}
          onViewProject={handleViewProject}
        />
      )}

      {/* Message Modal */}
      {selectedUser && (
        <UserMessageModal
          user={selectedUser}
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
