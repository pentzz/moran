import React, { useState } from 'react';
import { useProjects } from './context/ProjectsContext';
import { useAuth } from './context/AuthContext';
import ProjectsList from './components/ProjectsList';
import ProjectView from './components/ProjectView';
import LoginPage from './components/LoginPage';
import { SettingsIcon } from './components/Icons';
import SettingsPage from './components/SettingsPage';
import UsersManagement from './components/UsersManagement';
import DetailedUserGuide from './components/DetailedUserGuide';
import AdminDashboard from './components/AdminDashboard';
import SimpleDashboard from './components/SimpleDashboard';
import AllProjectsView from './components/AllProjectsView';
import ActivityLogView from './components/ActivityLogView';
import NotificationsSystem from './components/NotificationsSystem';
import UserNotificationSystem from './components/UserNotificationSystem';
import AdminNotificationSystem from './components/AdminNotificationSystem';
import UserProfilePage from './components/UserProfilePage';
import KeyboardShortcuts from './components/KeyboardShortcuts';

type View = 'projectsList' | 'projectView' | 'settings' | 'users' | 'guide' | 'adminDashboard' | 'adminProfessionalDashboard' | 'profile' | 'allProjects' | 'activityLog' | 'adminNotifications';

const Header: React.FC<{
  title: string;
  onBack?: () => void;
  onOpenSettings: () => void;
  onOpenUsers?: () => void;
  onOpenAdminDashboard?: () => void;
  onOpenAdminProfessionalDashboard?: () => void;
  onOpenGuide: () => void;
  onLogout: () => void;
  user?: { username: string } | null;
  isAdmin?: boolean;
  isImpersonating?: boolean;
  onStopImpersonation?: () => void;
}> = ({ title, onBack, onOpenSettings, onOpenUsers, onOpenAdminDashboard, onOpenAdminProfessionalDashboard, onOpenGuide, onLogout, user, isAdmin, isImpersonating, onStopImpersonation }) => (
  <header className="bg-white shadow-md sticky top-0 z-10">
    <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="flex items-center justify-between h-14 sm:h-16">
        <div className="flex items-center min-w-0 flex-1">
          {onBack && (
             <button
              onClick={onBack}
              className="p-1.5 sm:p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ml-1 sm:ml-2 lg:ml-4 flex-shrink-0 touch-manipulation"
              aria-label="חזור"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          )}
          <div className="flex items-center space-x-1.5 sm:space-x-2 lg:space-x-3 min-w-0">
            <img
              src="/mechubarot_logo_M.png"
              alt="מחוברות - לוגו"
              className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 object-contain rounded-full border-2 border-yellow-400 shadow-lg hover:scale-110 transition-transform duration-300 animate-pulse flex-shrink-0"
              onError={(e) => {
                // Fallback to original logo
                e.currentTarget.src = "/logo.png";
                e.currentTarget.className = "w-6 h-6 lg:w-8 lg:h-8 object-contain rounded-full";
              }}
            />
            <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 truncate">{title}</h1>
          </div>
        </div>
        <div className="flex items-center space-x-0.5 xs:space-x-1 sm:space-x-2 lg:space-x-3">
            {user && (
              <span className="text-xs lg:text-sm text-gray-600 hidden md:block truncate max-w-24 lg:max-w-none">
                שלום, {user.username}
              </span>
            )}
            {user && (
              <UserNotificationSystem />
            )}
            {isAdmin && !isImpersonating && (
              <>
                {onOpenAdminProfessionalDashboard && (
                  <button
                      onClick={onOpenAdminProfessionalDashboard}
                      className="p-1 xs:p-1.5 sm:p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-shrink-0 transition-colors duration-200 touch-manipulation hidden xs:flex"
                      aria-label="לוח בקרה מקצועי"
                      title="לוח בקרה מקצועי"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                  </button>
                )}
                {onOpenUsers && (
                  <button
                      onClick={onOpenUsers}
                      className="p-1 xs:p-1.5 sm:p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-shrink-0 touch-manipulation hidden sm:flex"
                      aria-label="ניהול משתמשים"
                      title="ניהול משתמשים"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                  </button>
                )}
              </>
            )}
            
            {isImpersonating && (
              <div className="flex items-center space-x-2 lg:space-x-3 bg-yellow-100 px-2 lg:px-3 py-1 rounded-full">
                <span className="text-xs lg:text-sm font-medium text-yellow-800 hidden sm:block">צופה כמשתמש</span>
                <span className="text-xs lg:text-sm font-medium text-yellow-800 sm:hidden">צופה</span>
                <button
                  onClick={onStopImpersonation}
                  className="text-yellow-600 hover:text-yellow-800 text-xs lg:text-sm font-medium"
                >
                  חזור
                </button>
              </div>
            )}
            <button
                onClick={onOpenGuide}
                className="p-1 xs:p-1.5 sm:p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-shrink-0 transition-colors duration-200 touch-manipulation"
                aria-label="מדריך למשתמש"
                title="מדריך למשתמש"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
            <button
              onClick={() => {
                console.log('Profile button clicked'); // Debug
                window.dispatchEvent(new CustomEvent('navigate', {
                  detail: { view: 'profile' }
                }));
              }}
              className="p-1 xs:p-1.5 sm:p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex-shrink-0 transition-colors duration-200 touch-manipulation hidden xs:flex"
              aria-label="פרופיל אישי"
              title="פרופיל אישי"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button
                onClick={onOpenSettings}
                className="p-1 xs:p-1.5 sm:p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-shrink-0 transition-colors duration-200 touch-manipulation"
                aria-label="הגדרות"
            >
                <SettingsIcon />
            </button>
            <button
                onClick={onLogout}
                className="p-1 xs:p-1.5 sm:p-2 rounded-full text-gray-600 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex-shrink-0 transition-colors duration-200 touch-manipulation"
                aria-label="יציאה"
                title="יציאה מהמערכת"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </button>
        </div>
      </div>
    </div>
  </header>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('projectsList');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { getProject } = useProjects();
  const { isAuthenticated, logout, user, isAdmin, isImpersonating, stopImpersonation } = useAuth();

  // Listen for navigation events from quick actions
  React.useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      const { view, tab, projectId } = event.detail;
      setCurrentView(view);
      if (projectId) {
        setSelectedProjectId(projectId);
      }
      if (tab && view === 'settings') {
        // Handle tab switching for settings - this would need to be passed to SettingsPage
        // For now, just navigate to settings
      }
    };

    window.addEventListener('navigate', handleNavigation as EventListener);
    return () => window.removeEventListener('navigate', handleNavigation as EventListener);
  }, []);

  // Auto-navigate moran to admin dashboard - REMOVED for simplicity
  // Let moran choose where to go manually

  const selectedProject = selectedProjectId ? getProject(selectedProjectId) : null;

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setCurrentView('projectView');
  };

  const handleBack = () => {
    setSelectedProjectId(null);
    setCurrentView('projectsList');
  };

  const getTitle = () => {
    switch (currentView) {
      case 'projectView':
        return selectedProject?.name || 'פרויקט';
      case 'settings':
        return 'הגדרות';
      case 'users':
        return 'ניהול משתמשים';
      case 'guide':
        return 'מדריך למשתמש';
      case 'adminDashboard':
        return 'לוח בקרה מנהל עליון';
      case 'adminProfessionalDashboard':
        return 'לוח בקרה פשוט';
      case 'allProjects':
        return 'כל הפרויקטים';
      case 'activityLog':
        return 'מעקב פעילות';
      case 'adminNotifications':
        return 'התראות מותאמות';
      case 'profile':
        return 'פרופיל אישי';
      case 'projectsList':
      default:
        return 'ניהול פרויקטים';
    }
  };

  const renderContent = () => {
     switch (currentView) {
      case 'projectView':
        return selectedProject ? <ProjectView project={selectedProject} /> : <p>Project not found.</p>;
      case 'settings':
        return <SettingsPage />;
      case 'users':
        return <UsersManagement />;
      case 'guide':
        return <DetailedUserGuide />;
      case 'adminDashboard':
        return <AdminDashboard />;
      case 'adminProfessionalDashboard':
        return <SimpleDashboard />;
      case 'allProjects':
        return <AllProjectsView />;
      case 'activityLog':
        return <ActivityLogView />;
      case 'adminNotifications':
        return <AdminNotificationSystem />;
      case 'profile':
        return <UserProfilePage />;
      case 'projectsList':
      default:
        return <ProjectsList onSelectProject={handleSelectProject} />;
    }
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const keyboardShortcuts = [
    { key: 'h', description: 'חזור לדף הבית', action: () => setCurrentView('projectsList') },
    { key: 's', ctrl: true, description: 'הגדרות', action: () => setCurrentView('settings') },
    { key: 'g', description: 'מדריך למשתמש', action: () => setCurrentView('guide') },
    { key: 'p', description: 'פרופיל אישי', action: () => setCurrentView('profile') },
    ...(isAdmin && !isImpersonating ? [
      { key: 'd', description: 'לוח בקרה פשוט', action: () => setCurrentView('adminProfessionalDashboard') },
      { key: 'u', description: 'ניהול משתמשים', action: () => setCurrentView('users') },
      { key: 'a', description: 'כל הפרויקטים', action: () => setCurrentView('allProjects') },
      { key: 'l', description: 'מעקב פעילות', action: () => setCurrentView('activityLog') },
      { key: 'n', description: 'התראות מותאמות', action: () => setCurrentView('adminNotifications') },
    ] : []),
    { key: 'Escape', description: 'חזור', action: () => currentView !== 'projectsList' && handleBack() },
  ];

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      <Header
        onBack={currentView !== 'projectsList' ? handleBack : undefined}
        title={getTitle()}
        onOpenSettings={() => setCurrentView('settings')}
        onOpenUsers={isAdmin && !isImpersonating ? () => setCurrentView('users') : undefined}
        onOpenAdminDashboard={isAdmin && !isImpersonating ? () => setCurrentView('adminDashboard') : undefined}
        onOpenAdminProfessionalDashboard={isAdmin && !isImpersonating ? () => setCurrentView('adminProfessionalDashboard') : undefined}
        onOpenGuide={() => setCurrentView('guide')}
        onLogout={logout}
        user={user}
        isAdmin={isAdmin}
        isImpersonating={isImpersonating}
        onStopImpersonation={stopImpersonation}
      />
      <main className="container mx-auto p-2 sm:p-4 md:p-6 lg:p-8">
        {renderContent()}
      </main>
      <footer className="text-center p-2 sm:p-4 text-xs sm:text-sm text-gray-500">
      נבנה עבור מחוברות © {new Date().getFullYear()} | כל הזכויות שמורות לאופיר ברנס
      </footer>
      <KeyboardShortcuts shortcuts={keyboardShortcuts} />
    </div>
  );
};

export default App;