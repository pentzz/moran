import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../context/UsersContext';
import { User } from '../types';
import { EditIcon, EyeIcon } from './Icons';
import Modal from './Modal';

interface QuickActionProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
}

const QuickActionCard: React.FC<QuickActionProps> = ({ icon, title, description, onClick, color }) => (
  <button 
    onClick={onClick}
    className="group p-4 lg:p-6 text-center border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
    <div className={`text-2xl lg:text-3xl mb-3 group-hover:scale-110 transition-transform duration-200 ${color}`}>
      {icon}
    </div>
    <h3 className="font-semibold text-gray-900 mb-2 text-sm lg:text-base">{title}</h3>
    <p className="text-xs lg:text-sm text-gray-500 leading-relaxed">{description}</p>
  </button>
);

const QuickActionsSection: React.FC = () => {
  const handleNavigateToUsers = () => {
    // Navigate to users management
    const event = new CustomEvent('navigate', { detail: { view: 'users' } });
    window.dispatchEvent(event);
  };

  const handleNavigateToDashboard = () => {
    // Navigate to admin dashboard
    const event = new CustomEvent('navigate', { detail: { view: 'adminDashboard' } });
    window.dispatchEvent(event);
  };

  const handleNavigateToSettings = () => {
    // Navigate to system settings
    const event = new CustomEvent('navigate', { detail: { view: 'settings', tab: 'system' } });
    window.dispatchEvent(event);
  };

  return (
    <div className="bg-white p-4 lg:p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 lg:mb-6">פעולות מהירות</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <QuickActionCard
          icon="👥"
          title="ניהול משתמשים"
          description="הוסף ונהל משתמשים במערכת"
          onClick={handleNavigateToUsers}
          color="text-blue-600"
        />
        
        <QuickActionCard
          icon="📊"
          title="לוח בקרה"
          description="צפה בנתונים ואנליטיקה"
          onClick={handleNavigateToDashboard}
          color="text-green-600"
        />
        
        <QuickActionCard
          icon="⚙️"
          title="הגדרות מערכת"
          description="נהל הגדרות כלליות"
          onClick={handleNavigateToSettings}
          color="text-purple-600"
        />
      </div>
    </div>
  );
};

const PasswordChangeForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (newPassword: string) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('יש למלא את כל השדות');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('הסיסמאות החדשות אינן תואמות');
      return;
    }

    if (newPassword.length < 6) {
      setError('הסיסמה החדשה חייבת להכיל לפחות 6 תווים');
      return;
    }

    onSave(newPassword);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="שינוי סיסמה">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
            סיסמה נוכחית
          </label>
          <div className="relative">
            <input
              type={showPasswords ? 'text' : 'password'}
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
            סיסמה חדשה
          </label>
          <input
            type={showPasswords ? 'text' : 'password'}
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
            אישור סיסמה חדשה
          </label>
          <input
            type={showPasswords ? 'text' : 'password'}
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="show-passwords"
            checked={showPasswords}
            onChange={(e) => setShowPasswords(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="show-passwords" className="mr-2 text-sm text-gray-600">
            הצג סיסמאות
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ביטול
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            שמור סיסמה חדשה
          </button>
        </div>
      </form>
    </Modal>
  );
};

const ProfileEditForm: React.FC<{
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<User>) => void;
}> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    username: user.username
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="עריכת פרופיל">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            שם משתמש
          </label>
          <input
            type="text"
            id="username"
            value={formData.username}
            disabled
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">לא ניתן לשנות שם משתמש</p>
        </div>

        <div>
          <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-1">
            שם מלא
          </label>
          <input
            type="text"
            id="full-name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            אימייל
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ביטול
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            שמור שינויים
          </button>
        </div>
      </form>
    </Modal>
  );
};

const AdminProfile: React.FC = () => {
  const { user } = useAuth();
  const { updateUser, logActivity } = useUsers();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  if (!user) {
    return <div className="text-center text-red-500 p-8">לא נמצא משתמש מחובר</div>;
  }

  const handlePasswordChange = async (newPassword: string) => {
    try {
      await updateUser(user.id, { password: newPassword });
      logActivity('שינוי סיסמה', 'user', user.id, 'הסיסמה שונתה בהצלחה');
      alert('הסיסמה שונתה בהצלחה');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('שגיאה בשינוי הסיסמה');
    }
  };

  const handleProfileUpdate = async (updates: Partial<User>) => {
    try {
      await updateUser(user.id, updates);
      logActivity('עדכון פרופיל', 'user', user.id, 'הפרופיל עודכן בהצלחה');
      alert('הפרופיל עודכן בהצלחה');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('שגיאה בעדכון הפרופיל');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 lg:p-8 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xl lg:text-2xl font-bold mx-auto sm:mx-0 flex-shrink-0 border-2 border-yellow-400 shadow-lg overflow-hidden">
                {user.username === 'moran' ? (
                  <img
                    src="/mechubarot_logo_M.png"
                    alt="מחוברות - לוגו"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      // Fallback to initials if logo fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span className={user.username === 'moran' ? 'hidden' : ''}>
                  {user.fullName ? user.fullName.charAt(0) : user.username.charAt(0).toUpperCase()}
                </span>
              </div>
          <div className="text-center sm:text-right min-w-0">
            <h1 className="text-2xl lg:text-3xl font-bold truncate">{user.fullName || user.username}</h1>
            <p className="text-purple-100 text-base lg:text-lg">מנהל עליון - מערכת מחוברות</p>
            <p className="text-purple-200 text-sm mt-1 truncate">@{user.username}</p>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">פרטים אישיים</h2>
            <button
              onClick={() => setShowProfileModal(true)}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
              title="ערוך פרטים"
            >
              <EditIcon />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">שם מלא</label>
              <p className="text-gray-900 font-medium">{user.fullName || 'לא הוגדר'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">שם משתמש</label>
              <p className="text-gray-900 font-medium">@{user.username}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">אימייל</label>
              <p className="text-gray-900 font-medium">{user.email || 'לא הוגדר'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">תפקיד</label>
              <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                מנהל עליון
              </span>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">הגדרות אבטחה</h2>
          
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">סיסמה</h3>
                  <p className="text-sm text-gray-500">שינוי סיסמת המשתמש</p>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  שנה סיסמה
                </button>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">כניסה אחרונה</h3>
                  <p className="text-sm text-gray-500">
                    {user.lastLogin ? 
                      new Date(user.lastLogin).toLocaleString('he-IL') : 
                      'לא זמין'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">תאריך יצירה</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('he-IL')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActionsSection />

      {/* Modals */}
      <PasswordChangeForm
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSave={handlePasswordChange}
      />
      
      <ProfileEditForm
        user={user}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSave={handleProfileUpdate}
      />
    </div>
  );
};

export default AdminProfile;
