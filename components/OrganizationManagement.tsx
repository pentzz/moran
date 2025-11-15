import React, { useState } from 'react';
import { useOrganizations } from '../context/OrganizationsContext';
import { useAuth } from '../context/AuthContext';
import { Organization } from '../types';
import Modal from './Modal';
import LogoUpload from './LogoUpload';
import { PlusIcon, EditIcon, TrashIcon, BuildingIcon } from './Icons';

const OrganizationManagement: React.FC = () => {
  const { organizations, addOrganization, updateOrganization, deleteOrganization, toggleOrganizationActive, loading } = useOrganizations();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    vatNumber: '',
    businessNumber: '',
    logo: '',
    settings: {
      vatRate: 18,
      taxRate: 0,
      currency: 'ILS',
      companyName: '',
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      vatNumber: '',
      businessNumber: '',
      logo: '',
      settings: {
        vatRate: 18,
        taxRate: 0,
        currency: 'ILS',
        companyName: '',
      },
    });
    setEditingOrg(null);
  };

  const openModal = (org?: Organization) => {
    if (org) {
      setEditingOrg(org);
      setFormData({
        name: org.name,
        contactPerson: org.contactPerson,
        email: org.email,
        phone: org.phone,
        address: org.address || '',
        vatNumber: org.vatNumber || '',
        businessNumber: org.businessNumber || '',
        logo: org.logo || '',
        settings: org.settings,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contactPerson || !formData.email || !formData.phone) {
      alert('אנא מלא את כל השדות החובה');
      return;
    }

    try {
      if (editingOrg) {
        await updateOrganization(editingOrg.id, formData);
      } else {
        await addOrganization({
          ...formData,
          createdBy: user?.id || '',
          isActive: true,
        });
      }
      closeModal();
    } catch (error) {
      console.error('Error saving organization:', error);
      alert('שגיאה בשמירת הארגון');
    }
  };

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ניהול ארגונים</h1>
            <p className="text-gray-600 mt-1">
              ניהול קבלנים ומערכות נפרדות
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon />
            ארגון חדש
          </button>
        </div>

        {/* Search */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="חיפוש לפי שם ארגון או איש קשר..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Organizations Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">טוען ארגונים...</p>
        </div>
      ) : filteredOrgs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <BuildingIcon className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">אין ארגונים</h3>
          <p className="mt-2 text-gray-600">
            {searchTerm ? 'לא נמצאו תוצאות חיפוש' : 'התחל ביצירת ארגון ראשון'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrgs.map(org => (
            <div
              key={org.id}
              className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow ${
                !org.isActive ? 'opacity-60' : ''
              }`}
            >
              {/* Logo & Status */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-shrink-0">
                  {org.logo ? (
                    <img src={org.logo} alt={org.name} className="h-16 w-16 rounded-lg object-cover" />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                      <BuildingIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      org.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {org.isActive ? 'פעיל' : 'לא פעיל'}
                  </span>
                </div>
              </div>

              {/* Info */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">{org.name}</h3>
              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <p>👤 {org.contactPerson}</p>
                <p>📧 {org.email}</p>
                <p>📞 {org.phone}</p>
                {org.vatNumber && <p>ע.מ: {org.vatNumber}</p>}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => openModal(org)}
                  className="flex-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
                  title="ערוך"
                >
                  <EditIcon />
                  ערוך
                </button>
                <button
                  onClick={() => toggleOrganizationActive(org.id)}
                  className="flex-1 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                >
                  {org.isActive ? 'השבת' : 'הפעל'}
                </button>
                <button
                  onClick={() => deleteOrganization(org.id)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="מחק"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingOrg ? 'ערוך ארגון' : 'ארגון חדש'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo */}
          <LogoUpload
            currentLogo={formData.logo}
            onLogoChange={(logo) => setFormData(prev => ({ ...prev, logo }))}
          />

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              שם הארגון *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="שם הקבלן/ארגון"
            />
          </div>

          {/* Contact Person */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              איש קשר *
            </label>
            <input
              type="text"
              required
              value={formData.contactPerson}
              onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                אימייל *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                טלפון *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* VAT & Business Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ע.מ / ח.פ
              </label>
              <input
                type="text"
                value={formData.vatNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, vatNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                מספר עוסק
              </label>
              <input
                type="text"
                value={formData.businessNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, businessNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              כתובת
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Settings */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">הגדרות ארגון</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  מע"מ (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.settings.vatRate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, vatRate: parseFloat(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  מס הכנסה (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.settings.taxRate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, taxRate: parseFloat(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingOrg ? 'עדכן' : 'צור ארגון'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrganizationManagement;
