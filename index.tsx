import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ProjectsProvider } from './context/ProjectsContext';
import { CategoriesProvider } from './context/CategoriesContext';
import { SuppliersProvider } from './context/SuppliersContext';
import { AuthProvider } from './context/AuthContext';
import { UsersProvider } from './context/UsersContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import { OrganizationsProvider } from './context/OrganizationsContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <OrganizationsProvider>
          <UsersProvider>
            <SettingsProvider>
              <ProjectsProvider>
                <CategoriesProvider>
                  <SuppliersProvider>
                    <App />
                  </SuppliersProvider>
                </CategoriesProvider>
              </ProjectsProvider>
            </SettingsProvider>
          </UsersProvider>
        </OrganizationsProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);
