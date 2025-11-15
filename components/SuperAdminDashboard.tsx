import React, { useMemo } from 'react';
import { useOrganizations } from '../context/OrganizationsContext';
import { useUsers } from '../context/UsersContext';
import { useProjects } from '../context/ProjectsContext';
import { BuildingIcon, UserIcon, ProjectIcon, StatsIcon } from './Icons';

interface Props {
  onNavigate: (view: string) => void;
}

const SuperAdminDashboard: React.FC<Props> = ({ onNavigate }) => {
  const { organizations } = useOrganizations();
  const { users } = useUsers();
  const { projects } = useProjects();

  const stats = useMemo(() => {
    const activeOrgs = organizations.filter(org => org.isActive).length;
    const totalUsers = users.length;
    const totalProjects = projects.length;

    // Stats per organization
    const orgStats = organizations.map(org => {
      const orgUsers = users.filter(u => u.organizationId === org.id).length;
      const orgProjects = projects.filter(p => p.organizationId === org.id).length;
      const orgValue = projects
        .filter(p => p.organizationId === org.id)
        .reduce((sum, p) => sum + p.contractAmount, 0);

      return {
        ...org,
        users: orgUsers,
        projects: orgProjects,
        totalValue: orgValue,
      };
    });

    return {
      activeOrgs,
      totalOrgs: organizations.length,
      totalUsers,
      totalProjects,
      orgStats: orgStats.sort((a, b) => b.totalValue - a.totalValue),
    };
  }, [organizations, users, projects]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    colorClass: string;
    onClick?: () => void;
  }> = ({ title, value, subtitle, icon, colorClass, onClick }) => (
    <div
      onClick={onClick}
      className={`bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className={`font-bold text-3xl mt-2 ${colorClass}`}>{value}</p>
          {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold">ברוכה הבאה, מורן! 👋</h1>
        <p className="mt-2 text-blue-100">
          לוח הבקרה הראשי - סקירה כוללת של כל המערכות והארגונים
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="ארגונים פעילים"
          value={stats.activeOrgs}
          subtitle={`מתוך ${stats.totalOrgs} ארגונים`}
          colorClass="text-blue-600"
          icon={<BuildingIcon className="h-12 w-12" />}
          onClick={() => onNavigate('organizations')}
        />
        <StatCard
          title='סה"כ משתמשים'
          value={stats.totalUsers}
          subtitle="בכל המערכות"
          colorClass="text-green-600"
          icon={<UserIcon />}
          onClick={() => onNavigate('users')}
        />
        <StatCard
          title='סה"כ פרויקטים'
          value={stats.totalProjects}
          subtitle="בכל הארגונים"
          colorClass="text-purple-600"
          icon={<ProjectIcon />}
        />
        <StatCard
          title="ארגונים"
          value={stats.totalOrgs}
          subtitle='סה"כ מערכות'
          colorClass="text-orange-600"
          icon={<StatsIcon />}
        />
      </div>

      {/* Organizations Overview */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">סקירת ארגונים</h3>
            <p className="text-sm text-gray-600 mt-1">ביצועים ופעילות לפי ארגון</p>
          </div>
          <button
            onClick={() => onNavigate('organizations')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            נהל ארגונים
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {stats.orgStats.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <BuildingIcon className="mx-auto h-16 w-16 text-gray-300" />
              <p className="mt-4">אין ארגונים עדיין</p>
              <button
                onClick={() => onNavigate('organizations')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                צור ארגון ראשון
              </button>
            </div>
          ) : (
            stats.orgStats.map(org => (
              <div key={org.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      {org.logo ? (
                        <img
                          src={org.logo}
                          alt={org.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <BuildingIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-medium text-gray-900">{org.name}</h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            org.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {org.isActive ? 'פעיל' : 'לא פעיל'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{org.contactPerson} • {org.email}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-gray-900">{org.users}</div>
                      <div className="text-gray-500">משתמשים</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-900">{org.projects}</div>
                      <div className="text-gray-500">פרויקטים</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-blue-600">
                        {new Intl.NumberFormat('he-IL', {
                          style: 'currency',
                          currency: 'ILS',
                          maximumFractionDigits: 0,
                        }).format(org.totalValue)}
                      </div>
                      <div className="text-gray-500">ערך כולל</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigate('organizations')}
          className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500 text-right"
        >
          <BuildingIcon className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">ניהול ארגונים</h3>
          <p className="text-sm text-gray-600 mt-1">צור, ערוך ונהל ארגונים</p>
        </button>

        <button
          onClick={() => onNavigate('users')}
          className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-green-500 text-right"
        >
          <UserIcon />
          <h3 className="text-lg font-semibold text-gray-900 mt-3">ניהול משתמשים</h3>
          <p className="text-sm text-gray-600 mt-1">צור ונהל משתמשים בכל הארגונים</p>
        </button>

        <button
          onClick={() => onNavigate('allProjects')}
          className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-500 text-right"
        >
          <ProjectIcon />
          <h3 className="text-lg font-semibold text-gray-900 mt-3">כל הפרויקטים</h3>
          <p className="text-sm text-gray-600 mt-1">צפה בכל הפרויקטים בכל המערכות</p>
        </button>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
