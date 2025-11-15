import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, UserRole } from '../types';
import { usersApi } from '../services/serverApi';
import { 
  UserIcon, 
  ShieldIcon, 
  EditIcon, 
  SaveIcon, 
  CancelIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from './Icons';
import Modal from './Modal';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'projects' | 'users' | 'reports' | 'settings' | 'system';
}

interface UserPermissions {
  userId: string;
  permissions: string[];
  customLimits?: {
    maxProjects?: number;
    canViewOthersProjects?: boolean;
    canEditSystemSettings?: boolean;
    canExportData?: boolean;
    canManageUsers?: boolean;
  };
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  // Projects
  { id: 'projects.view', name: 'צפייה בפרויקטים', description: 'יכולת לצפות בפרויקטים', category: 'projects' },
  { id: 'projects.create', name: 'יצירת פרויקטים', description: 'יכולת ליצור פרויקטים חדשים', category: 'projects' },
  { id: 'projects.edit', name: 'עריכת פרויקטים', description: 'יכולת לערוך פרויקטים קיימים', category: 'projects' },
  { id: 'projects.delete', name: 'מחיקת פרויקטים', description: 'יכולת למחוק פרויקטים', category: 'projects' },
  { id: 'projects.archive', name: 'ארכוב פרויקטים', description: 'יכולת לארכב פרויקטים', category: 'projects' },
  { id: 'projects.view_others', name: 'צפייה בפרויקטים של אחרים', description: 'יכולת לצפות בפרויקטים של משתמשים אחרים', category: 'projects' },
  
  // Users
  { id: 'users.view', name: 'צפייה במשתמשים', description: 'יכולת לצפות ברשימת המשתמשים', category: 'users' },
  { id: 'users.create', name: 'יצירת משתמשים', description: 'יכולת ליצור משתמשים חדשים', category: 'users' },
  { id: 'users.edit', name: 'עריכת משתמשים', description: 'יכולת לערוך פרטי משתמשים', category: 'users' },
  { id: 'users.delete', name: 'מחיקת משתמשים', description: 'יכולת למחוק משתמשים', category: 'users' },
  { id: 'users.impersonate', name: 'התחזות למשתמש', description: 'יכולת להתחזות למשתמש אחר', category: 'users' },
  
  // Reports
  { id: 'reports.view', name: 'צפייה בדוחות', description: 'יכולת לצפות בדוחות בסיסיים', category: 'reports' },
  { id: 'reports.advanced', name: 'דוחות מתקדמים', description: 'יכולת לצפות בדוחות מתקדמים', category: 'reports' },
  { id: 'reports.export', name: 'ייצוא דוחות', description: 'יכולת לייצא דוחות', category: 'reports' },
  { id: 'reports.financial', name: 'דוחות פיננסיים', description: 'יכולת לצפות בדוחות פיננסיים', category: 'reports' },
  
  // Settings
  { id: 'settings.view', name: 'צפייה בהגדרות', description: 'יכולת לצפות בהגדרות המערכת', category: 'settings' },
  { id: 'settings.edit', name: 'עריכת הגדרות', description: 'יכולת לערוך הגדרות המערכת', category: 'settings' },
  { id: 'settings.categories', name: 'ניהול קטגוריות', description: 'יכולת לנהל קטגוריות', category: 'settings' },
  { id: 'settings.suppliers', name: 'ניהול ספקים', description: 'יכולת לנהל ספקים', category: 'settings' },
  
  // System
  { id: 'system.logs', name: 'לוגי מערכת', description: 'יכולת לצפות בלוגי המערכת', category: 'system' },
  { id: 'system.backup', name: 'גיבוי מערכת', description: 'יכולת לבצע גיבוי למערכת', category: 'system' },
  { id: 'system.restore', name: 'שחזור מערכת', description: 'יכולת לשחזר את המערכת', category: 'system' },
  { id: 'system.admin', name: 'ניהול מערכת', description: 'גישה מלאה לניהול המערכת', category: 'system' }
];

const DEFAULT_PERMISSIONS_BY_ROLE = {
  admin: AVAILABLE_PERMISSIONS.map(p => p.id),
  user: [
    'projects.view', 'projects.create', 'projects.edit', 'projects.archive',
    'reports.view', 'settings.view'
  ]
};

const AdvancedPermissionsSystem: React.FC = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [editingLimits, setEditingLimits] = useState<UserPermissions['customLimits']>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!isAdmin) return;
    
    setIsLoading(true);
    try {
      const usersData = await usersApi.getAll();
      setUsers(usersData);
      
      // Initialize permissions from localStorage or defaults
      const savedPermissions = localStorage.getItem('userPermissions');
      let permissions: UserPermissions[] = [];
      
      if (savedPermissions) {
        permissions = JSON.parse(savedPermissions);
      } else {
        // Initialize default permissions
        permissions = usersData.map(user => ({
          userId: user.id,
          permissions: DEFAULT_PERMISSIONS_BY_ROLE[user.role as keyof typeof DEFAULT_PERMISSIONS_BY_ROLE] || DEFAULT_PERMISSIONS_BY_ROLE.user,
          customLimits: user.role === 'admin' ? {
            maxProjects: undefined,
            canViewOthersProjects: true,
            canEditSystemSettings: true,
            canExportData: true,
            canManageUsers: true
          } : {
            maxProjects: 10,
            canViewOthersProjects: false,
            canEditSystemSettings: false,
            canExportData: false,
            canManageUsers: false
          }
        }));
        localStorage.setItem('userPermissions', JSON.stringify(permissions));
      }
      
      setUserPermissions(permissions);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserPermissions = (userId: string): UserPermissions => {
    return userPermissions.find(up => up.userId === userId) || {
      userId,
      permissions: DEFAULT_PERMISSIONS_BY_ROLE.user,
      customLimits: {}
    };
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    const userPerms = getUserPermissions(user.id);
    setEditingPermissions([...userPerms.permissions]);
    setEditingLimits({ ...userPerms.customLimits });
    setIsModalOpen(true);
  };

  const savePermissions = () => {
    if (!selectedUser) return;
    
    const updatedPermissions = userPermissions.map(up => 
      up.userId === selectedUser.id 
        ? { ...up, permissions: editingPermissions, customLimits: editingLimits }
        : up
    );
    
    // If user doesn't exist in permissions array, add them
    if (!userPermissions.find(up => up.userId === selectedUser.id)) {
      updatedPermissions.push({
        userId: selectedUser.id,
        permissions: editingPermissions,
        customLimits: editingLimits
      });
    }
    
    setUserPermissions(updatedPermissions);
    localStorage.setItem('userPermissions', JSON.stringify(updatedPermissions));
    setIsModalOpen(false);
  };

  const togglePermission = (permissionId: string) => {
    if (editingPermissions.includes(permissionId)) {
      setEditingPermissions(prev => prev.filter(p => p !== permissionId));
    } else {
      setEditingPermissions(prev => [...prev, permissionId]);
    }
  };

  const getCategoryPermissions = (category: Permission['category']) => {
    return AVAILABLE_PERMISSIONS.filter(p => p.category === category);
  };

  const getPermissionCategoryName = (category: Permission['category']) => {
    const names = {
      projects: 'פרויקטים',
      users: 'משתמשים',
      reports: 'דוחות',
      settings: 'הגדרות',
      system: 'מערכת'
    };
    return names[category];
  };

  const hasPermission = (userId: string, permissionId: string): boolean => {
    const userPerms = getUserPermissions(userId);
    return userPerms.permissions.includes(permissionId);
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon />
        <p className="mt-2 text-gray-600">אין לך הרשאה לצפות בעמוד זה</p>
      </div>
    );
  }

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">מערכת הרשאות מתקדמת</h1>
            <p className="text-gray-600 mt-1">
              ניהול הרשאות מפורט לכל משתמש במערכת
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ShieldIcon />
            <span className="text-sm text-gray-600">רמת אבטחה גבוהה</span>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">משתמשים והרשאות</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {users.map(user => {
            const userPerms = getUserPermissions(user.id);
            const permissionCount = userPerms.permissions.length;
            
            return (
              <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {user.fullName || user.username}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {user.role === 'admin' ? 'מנהל עליון' : 'משתמש רגיל'} • {user.email}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-500">
                          {permissionCount} הרשאות פעילות
                        </span>
                        {userPerms.customLimits?.maxProjects && (
                          <span className="text-sm text-gray-500">
                            מגבלת פרויקטים: {userPerms.customLimits.maxProjects}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex flex-wrap gap-1 max-w-md">
                      {['projects', 'users', 'reports', 'settings', 'system'].map(category => {
                        const categoryPerms = getCategoryPermissions(category as Permission['category']);
                        const userCategoryPerms = categoryPerms.filter(p => userPerms.permissions.includes(p.id));
                        const hasAnyInCategory = userCategoryPerms.length > 0;
                        
                        return hasAnyInCategory ? (
                          <span 
                            key={category} 
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                          >
                            {getPermissionCategoryName(category as Permission['category'])}
                          </span>
                        ) : null;
                      })}
                    </div>
                    
                    <button
                      onClick={() => openEditModal(user)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                    >
                      <EditIcon />
                      ערוך הרשאות
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Permissions Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`עריכת הרשאות - ${selectedUser?.fullName || selectedUser?.username}`}
      >
        <div className="space-y-6">
          {/* Permission Categories */}
          {['projects', 'users', 'reports', 'settings', 'system'].map(category => {
            const categoryPerms = getCategoryPermissions(category as Permission['category']);
            
            return (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  {getPermissionCategoryName(category as Permission['category'])}
                </h4>
                <div className="space-y-2">
                  {categoryPerms.map(permission => (
                    <label key={permission.id} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={editingPermissions.includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                        <div className="text-xs text-gray-600">{permission.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Custom Limits */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">מגבלות מותאמות אישית</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  מספר מקסימלי של פרויקטים
                </label>
                <input
                  type="number"
                  value={editingLimits?.maxProjects || ''}
                  onChange={(e) => setEditingLimits(prev => ({ 
                    ...prev, 
                    maxProjects: e.target.value ? Number(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ללא מגבלה"
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingLimits?.canViewOthersProjects || false}
                    onChange={(e) => setEditingLimits(prev => ({ 
                      ...prev, 
                      canViewOthersProjects: e.target.checked 
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="mr-2 text-sm text-gray-700">יכולת לצפות בפרויקטים של אחרים</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingLimits?.canEditSystemSettings || false}
                    onChange={(e) => setEditingLimits(prev => ({ 
                      ...prev, 
                      canEditSystemSettings: e.target.checked 
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="mr-2 text-sm text-gray-700">יכולת לערוך הגדרות מערכת</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingLimits?.canExportData || false}
                    onChange={(e) => setEditingLimits(prev => ({ 
                      ...prev, 
                      canExportData: e.target.checked 
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="mr-2 text-sm text-gray-700">יכולת לייצא נתונים</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingLimits?.canManageUsers || false}
                    onChange={(e) => setEditingLimits(prev => ({ 
                      ...prev, 
                      canManageUsers: e.target.checked 
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="mr-2 text-sm text-gray-700">יכולת לנהל משתמשים</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
            >
              <CancelIcon />
              ביטול
            </button>
            <button
              onClick={savePermissions}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <SaveIcon />
              שמור הרשאות
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdvancedPermissionsSystem;
