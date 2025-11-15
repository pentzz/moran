import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, UserProfile } from '../types';
import { userProfileApi } from '../services/serverApi';
import { EditIcon, CameraIcon, UserIcon, SaveIcon, CancelIcon } from './Icons';
import Modal from './Modal';

const UserProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || '',
    profilePicture: user?.profilePicture || '',
    preferences: {
      theme: 'light' as 'light' | 'dark',
      language: 'he' as 'he' | 'en',
      notifications: true,
      emailNotifications: true,
    }
  });

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const profileData = await userProfileApi.get(user.id);
      setProfile(profileData);
      setFormData({
        fullName: profileData.fullName || user?.fullName || '',
        email: profileData.email || user?.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        bio: profileData.bio || '',
        profilePicture: profileData.profilePicture || user?.profilePicture || '',
        preferences: profileData.preferences || {
          theme: 'light',
          language: 'he',
          notifications: true,
          emailNotifications: true,
        }
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      await userProfileApi.update(user.id, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
        profilePicture: formData.profilePicture,
        preferences: formData.preferences,
      });

      await refreshUser?.();
      await loadProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('שגיאה בשמירת הפרופיל');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, profilePicture: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, profilePicture: '' }));
    setIsImageModalOpen(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
              {formData.profilePicture ? (
                <img
                  src={formData.profilePicture}
                  alt="תמונת פרופיל"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white bg-opacity-20 flex items-center justify-center text-2xl lg:text-3xl font-bold">
                  {formData.fullName ? getInitials(formData.fullName) : <UserIcon />}
                </div>
              )}
            </div>
            {isEditing && (
              <button
                onClick={() => setIsImageModalOpen(true)}
                className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors duration-200"
              >
                <CameraIcon />
              </button>
            )}
          </div>

          {/* User Info */}
          <div className="text-center sm:text-right flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold">
              {formData.fullName || user?.username}
            </h1>
            <p className="text-blue-100 text-lg">
              {user?.role === 'admin' ? 'מנהל עליון' : 'משתמש'}
            </p>
            {formData.email && (
              <p className="text-blue-100 mt-2">{formData.email}</p>
            )}
            {formData.bio && (
              <p className="text-blue-100 mt-2 italic">{formData.bio}</p>
            )}
          </div>

          {/* Edit Button */}
          <div className="flex flex-col gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200 flex items-center gap-2"
              >
                <EditIcon />
                ערוך פרופיל
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  <SaveIcon />
                  {isSaving ? 'שומר...' : 'שמור'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    loadProfile();
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <CancelIcon />
                  ביטול
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">מידע אישי</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                שם מלא
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{formData.fullName || 'לא הוגדר'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                כתובת אימייל
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{formData.email || 'לא הוגדר'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                טלפון
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{formData.phone || 'לא הוגדר'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                כתובת
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{formData.address || 'לא הוגדר'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                תיאור אישי
              </label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ספר על עצמך..."
                />
              ) : (
                <p className="text-gray-900">{formData.bio || 'לא הוגדר'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">העדפות</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ערכת נושא
              </label>
              {isEditing ? (
                <select
                  value={formData.preferences.theme}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    preferences: { 
                      ...prev.preferences, 
                      theme: e.target.value as 'light' | 'dark' 
                    } 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">בהיר</option>
                  <option value="dark">כהה</option>
                </select>
              ) : (
                <p className="text-gray-900">
                  {formData.preferences.theme === 'light' ? 'בהיר' : 'כהה'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שפה
              </label>
              {isEditing ? (
                <select
                  value={formData.preferences.language}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    preferences: { 
                      ...prev.preferences, 
                      language: e.target.value as 'he' | 'en' 
                    } 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="he">עברית</option>
                  <option value="en">English</option>
                </select>
              ) : (
                <p className="text-gray-900">
                  {formData.preferences.language === 'he' ? 'עברית' : 'English'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.preferences.notifications}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    preferences: { 
                      ...prev.preferences, 
                      notifications: e.target.checked 
                    } 
                  }))}
                  disabled={!isEditing}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="mr-2 text-sm text-gray-700">התראות במערכת</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.preferences.emailNotifications}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    preferences: { 
                      ...prev.preferences, 
                      emailNotifications: e.target.checked 
                    } 
                  }))}
                  disabled={!isEditing}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="mr-2 text-sm text-gray-700">התראות במייל</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Modal */}
      <Modal 
        isOpen={isImageModalOpen} 
        onClose={() => setIsImageModalOpen(false)} 
        title="עריכת תמונת פרופיל"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-200 mb-4">
              {formData.profilePicture ? (
                <img
                  src={formData.profilePicture}
                  alt="תמונת פרופיל"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-3xl">
                  <UserIcon />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              העלה תמונה חדשה
            </button>
            
            {formData.profilePicture && (
              <button
                onClick={handleImageRemove}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                הסר תמונה
              </button>
            )}
            
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200"
            >
              ביטול
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </Modal>
    </div>
  );
};

export default UserProfilePage;
