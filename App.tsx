import React, { useState } from 'react';
import { useProjects } from './context/ProjectsContext';
import { useAuth } from './context/AuthContext';
import ProjectsList from './components/ProjectsList';
import ProjectView from './components/ProjectView';
import LoginPage from './components/LoginPage';
import { SettingsIcon } from './components/Icons';
import SettingsPage from './components/SettingsPage';

type View = 'projectsList' | 'projectView' | 'settings';

const Header: React.FC<{ title: string; onBack?: () => void; onOpenSettings: () => void; onLogout: () => void; user?: { username: string } | null; }> = ({ title, onBack, onOpenSettings, onLogout, user }) => (
  <header className="bg-white shadow-md sticky top-0 z-10">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          {onBack && (
             <button
              onClick={onBack}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ml-4"
              aria-label="חזור"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          )}
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="לוגו" 
              className="w-8 h-8 object-contain rounded-full"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
            {user && (
              <span className="text-sm text-gray-600 hidden sm:block">
                שלום, {user.username}
              </span>
            )}
            <button 
                onClick={onOpenSettings}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="הגדרות"
            >
                <SettingsIcon />
            </button>
            <button 
                onClick={onLogout}
                className="p-2 rounded-full text-gray-600 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                aria-label="יציאה"
                title="יציאה מהמערכת"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  const { isAuthenticated, logout, user } = useAuth();

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
      case 'projectsList':
      default:
        return <ProjectsList onSelectProject={handleSelectProject} />;
    }
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      <Header 
        onBack={currentView !== 'projectsList' ? handleBack : undefined} 
        title={getTitle()} 
        onOpenSettings={() => setCurrentView('settings')}
        onLogout={logout}
        user={user}
      />
      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
      </main>
      <footer className="text-center p-4 text-sm text-gray-500">
        נבנה עבור קבלני בנייה © {new Date().getFullYear()} | כל הזכויות שמורות לאופיר ברנס
      </footer>
    </div>
  );
};

export default App;