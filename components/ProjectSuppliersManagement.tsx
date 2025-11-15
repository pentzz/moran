import React, { useState, useEffect, useMemo } from 'react';
import { useSuppliers } from '../context/SuppliersContext';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../context/UsersContext';
import { Project, ProjectSupplier, Supplier } from '../types';
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  SearchIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  SaveIcon,
  CancelIcon
} from './Icons';
import Modal from './Modal';

interface ProjectSuppliersManagementProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
}

const ProjectSuppliersManagement: React.FC<ProjectSuppliersManagementProps> = ({
  project,
  onUpdateProject
}) => {
  const { suppliers: globalSuppliers } = useSuppliers();
  const { user } = useAuth();
  const { logActivity } = useUsers();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<ProjectSupplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [selectedGlobalSupplier, setSelectedGlobalSupplier] = useState<Supplier | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contactPerson: '',
    phone: '',
    email: '',
    vatNumber: '',
    businessNumber: '',
    address: '',
    notes: '',
    agreementAmount: '',
    paidAmount: ''
  });

  const projectSuppliers = project.suppliers || [];

  // Filter global suppliers for search
  const filteredGlobalSuppliers = useMemo(() => {
    if (!searchTerm) return [];
    return globalSuppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.includes(searchTerm)
    );
  }, [globalSuppliers, searchTerm]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      contactPerson: '',
      phone: '',
      email: '',
      vatNumber: '',
      businessNumber: '',
      address: '',
      notes: '',
      agreementAmount: '',
      paidAmount: ''
    });
    setEditingSupplier(null);
    setSelectedGlobalSupplier(null);
    setSearchTerm('');
    setShowGlobalSearch(false);
  };

  const openModal = (supplier?: ProjectSupplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        description: supplier.description || '',
        contactPerson: supplier.contactPerson || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        vatNumber: supplier.vatNumber || '',
        businessNumber: supplier.businessNumber || '',
        address: supplier.address || '',
        notes: supplier.notes || '',
        agreementAmount: supplier.agreementAmount?.toString() || '',
        paidAmount: supplier.paidAmount?.toString() || ''
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

  const selectGlobalSupplier = (supplier: Supplier) => {
    setSelectedGlobalSupplier(supplier);
    setFormData({
      name: supplier.name,
      description: supplier.description || '',
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      vatNumber: supplier.vatNumber || '',
      businessNumber: supplier.businessNumber || '',
      address: supplier.address || '',
      notes: '',
      agreementAmount: '',
      paidAmount: ''
    });
    setSearchTerm('');
    setShowGlobalSearch(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const now = new Date().toISOString();
    
    if (editingSupplier) {
      // Update existing supplier
      const updatedSuppliers = projectSuppliers.map(supplier =>
        supplier.id === editingSupplier.id
          ? {
              ...supplier,
              name: formData.name,
              description: formData.description,
              contactPerson: formData.contactPerson,
              phone: formData.phone,
              email: formData.email,
              vatNumber: formData.vatNumber,
              businessNumber: formData.businessNumber,
              address: formData.address,
              notes: formData.notes,
              agreementAmount: formData.agreementAmount ? parseFloat(formData.agreementAmount) : undefined,
              paidAmount: formData.paidAmount ? parseFloat(formData.paidAmount) : undefined,
              updatedAt: now
            }
          : supplier
      );
      
      const updatedProject = {
        ...project,
        suppliers: updatedSuppliers
      };
      
      onUpdateProject(updatedProject);
      logActivity(user.id, user.username, 'עדכן ספק בפרויקט', 'supplier', editingSupplier.id, `עדכן ספק "${formData.name}" בפרויקט "${project.name}"`);
    } else {
      // Add new supplier
    const newSupplier: ProjectSupplier = {
      id: `proj-supplier-${Date.now()}`,
      projectId: project.id,
      supplierId: selectedGlobalSupplier?.id,
      name: formData.name,
      description: formData.description,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      email: formData.email,
      vatNumber: formData.vatNumber,
      businessNumber: formData.businessNumber,
      address: formData.address,
      notes: formData.notes,
      agreementAmount: formData.agreementAmount ? parseFloat(formData.agreementAmount) : undefined,
      paidAmount: formData.paidAmount ? parseFloat(formData.paidAmount) : undefined,
      createdAt: now,
      isFromGlobal: !!selectedGlobalSupplier
    };
      
      const updatedProject = {
        ...project,
        suppliers: [...projectSuppliers, newSupplier]
      };
      
      onUpdateProject(updatedProject);
      logActivity(user.id, user.username, 'הוסיף ספק לפרויקט', 'supplier', newSupplier.id, `הוסיף ספק "${formData.name}" לפרויקט "${project.name}"`);
    }
    
    closeModal();
  };

  const deleteSupplier = (supplierId: string) => {
    if (!user) return;
    
    const supplier = projectSuppliers.find(s => s.id === supplierId);
    if (!supplier) return;
    
    if (confirm(`האם אתה בטוח שברצונך למחוק את הספק "${supplier.name}"?`)) {
      const updatedSuppliers = projectSuppliers.filter(s => s.id !== supplierId);
      const updatedProject = {
        ...project,
        suppliers: updatedSuppliers
      };
      
      onUpdateProject(updatedProject);
      logActivity(user.id, user.username, 'מחק ספק מפרויקט', 'supplier', supplierId, `מחק ספק "${supplier.name}" מפרויקט "${project.name}"`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">ספקי הפרויקט</h3>
          <p className="text-sm text-gray-600 mt-1">
            ניהול ספקים ייחודיים לפרויקט זה
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
        >
          <PlusIcon />
          הוסף ספק
        </button>
      </div>

      {/* Suppliers List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {projectSuppliers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <UserIcon />
            <p className="mt-2">לא נוספו ספקים עדיין</p>
            <p className="text-sm">לחץ "הוסף ספק" כדי להתחיל</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {projectSuppliers.map(supplier => (
              <div key={supplier.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{supplier.name}</h4>
                      {supplier.isFromGlobal && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          מספקים כלליים
                        </span>
                      )}
                    </div>
                    
                    {supplier.description && (
                      <p className="text-gray-600 text-sm mb-2">{supplier.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {supplier.contactPerson && (
                        <div className="flex items-center gap-2">
                          <UserIcon />
                          <span>{supplier.contactPerson}</span>
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center gap-2">
                          <PhoneIcon />
                          <span>{supplier.phone}</span>
                        </div>
                      )}
                      {supplier.email && (
                        <div className="flex items-center gap-2">
                          <MailIcon />
                          <span>{supplier.email}</span>
                        </div>
                      )}
                      {supplier.vatNumber && (
                        <div>
                          <span className="text-gray-500">ע.מ:</span>
                          <span className="mr-1">{supplier.vatNumber}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Agreement and Payment Info */}
                    {(supplier.agreementAmount || supplier.paidAmount) && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {supplier.agreementAmount && (
                            <div>
                              <span className="text-gray-600 font-medium">סכום הסכם:</span>
                              <span className="mr-2 font-bold text-blue-700">
                                {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(supplier.agreementAmount)}
                              </span>
                            </div>
                          )}
                          {supplier.paidAmount !== undefined && (
                            <div>
                              <span className="text-gray-600 font-medium">שולם בפועל:</span>
                              <span className={`mr-2 font-bold ${(supplier.paidAmount || 0) > (supplier.agreementAmount || 0) ? 'text-red-600' : 'text-green-600'}`}>
                                {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(supplier.paidAmount || 0)}
                              </span>
                            </div>
                          )}
                          {(supplier.agreementAmount && supplier.paidAmount !== undefined) && (
                            <div className="col-span-2">
                              <span className="text-gray-600 font-medium">הפרש:</span>
                              <span className={`mr-2 font-bold ${(supplier.paidAmount || 0) > (supplier.agreementAmount || 0) ? 'text-red-600' : (supplier.paidAmount || 0) < (supplier.agreementAmount || 0) ? 'text-yellow-600' : 'text-green-600'}`}>
                                {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format((supplier.paidAmount || 0) - (supplier.agreementAmount || 0))}
                              </span>
                              {(supplier.paidAmount || 0) > (supplier.agreementAmount || 0) && (
                                <span className="text-xs text-red-600 mr-2">⚠️ חריגה מההסכם</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {supplier.notes && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded border-r-4 border-yellow-400">
                        <p className="text-sm text-yellow-800">
                          <strong>הערות:</strong> {supplier.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mr-4">
                    <button
                      onClick={() => openModal(supplier)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="ערוך ספק"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => deleteSupplier(supplier.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="מחק ספק"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingSupplier ? 'ערוך ספק' : 'הוסף ספק חדש'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Global Suppliers Search */}
          {!editingSupplier && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">חיפוש בספקים קיימים</h4>
              <div className="relative">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="חפש ספק קיים לחיפוש..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowGlobalSearch(e.target.value.length > 0);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {showGlobalSearch && filteredGlobalSuppliers.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto border border-blue-300 rounded-lg bg-white">
                  {filteredGlobalSuppliers.map(supplier => (
                    <button
                      key={supplier.id}
                      type="button"
                      onClick={() => selectGlobalSupplier(supplier)}
                      className="w-full text-right p-3 hover:bg-blue-50 border-b border-blue-100 last:border-b-0"
                    >
                      <div className="font-medium text-blue-900">{supplier.name}</div>
                      {supplier.contactPerson && (
                        <div className="text-sm text-blue-600">{supplier.contactPerson}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              {selectedGlobalSupplier && (
                <div className="mt-2 p-2 bg-green-50 rounded border border-green-300">
                  <p className="text-sm text-green-800">
                    ✅ נבחר: <strong>{selectedGlobalSupplier.name}</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Supplier Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                שם הספק *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                איש קשר
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                טלפון
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                אימייל
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ח.פ / ע.מ
              </label>
              <input
                type="text"
                value={formData.businessNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, businessNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                מספר עוסק מורשה
              </label>
              <input
                type="text"
                value={formData.vatNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, vatNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              כתובת
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              תיאור
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              הערות לפרויקט זה
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              placeholder="הערות ספציפיות לפרויקט זה..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Agreement and Payment Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">💰 הסכם ותשלומים</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  סכום הסכם (₪)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.agreementAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, agreementAmount: e.target.value }))}
                  placeholder="לדוגמה: 200000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">סכום ההסכם שנסגר עם הספק</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שולם בפועל (₪)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.paidAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, paidAmount: e.target.value }))}
                  placeholder="לדוגמה: 220000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">סכום ששולם בפועל במצטבר</p>
              </div>
            </div>
            {(formData.agreementAmount && formData.paidAmount) && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm">
                  <span className="font-medium text-gray-700">הפרש:</span>
                  <span className={`mr-2 font-bold ${
                    parseFloat(formData.paidAmount || '0') > parseFloat(formData.agreementAmount || '0') 
                      ? 'text-red-600' 
                      : parseFloat(formData.paidAmount || '0') < parseFloat(formData.agreementAmount || '0')
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}>
                    {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(
                      parseFloat(formData.paidAmount || '0') - parseFloat(formData.agreementAmount || '0')
                    )}
                  </span>
                  {parseFloat(formData.paidAmount || '0') > parseFloat(formData.agreementAmount || '0') && (
                    <span className="text-xs text-red-600 mr-2">⚠️ חריגה מההסכם</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
            >
              <CancelIcon />
              ביטול
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <SaveIcon />
              {editingSupplier ? 'עדכן ספק' : 'הוסף ספק'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectSuppliersManagement;
