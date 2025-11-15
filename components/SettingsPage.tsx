import React, { useState } from 'react';
import { useCategories } from '../context/CategoriesContext';
import { useProjects } from '../context/ProjectsContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../context/UsersContext';
import { SuppliersManagement } from './SuppliersManagement';
import AdminProfile from './AdminProfile';
import Modal from './Modal';
import { Category, Project } from '../types';
import { EditIcon, TrashIcon, PlusIcon, UnarchiveIcon } from './Icons';

const SystemSettings = () => {
    const { settings, updateSettings } = useSettings();
    const { user, isAdmin } = useAuth();
    const { logActivity } = useUsers();
    
    // Only admin can access system settings
    if (!isAdmin) {
        return (
            <div className="text-center py-8">
                <div className="max-w-md mx-auto">
                    <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                        <h3 className="text-lg font-semibold text-red-800 mb-2">🚫 גישה מוגבלת</h3>
                        <p className="text-red-600">
                            רק מנהל המערכת יכול לגשת להגדרות המערכת.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    const [formData, setFormData] = useState({
        taxRate: settings.taxRate?.toString() || '0',
        taxAmount: settings.taxAmount?.toString() || '0',
        vatRate: settings.vatRate?.toString() || '18',
        companyName: settings.companyName || '',
        companyAddress: settings.companyAddress || '',
        companyPhone: settings.companyPhone || '',
        companyEmail: settings.companyEmail || ''
    });
    const [useTaxRate, setUseTaxRate] = useState(settings.taxRate > 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const newSettings = {
            taxRate: useTaxRate ? parseFloat(formData.taxRate) || 0 : 0,
            taxAmount: !useTaxRate ? parseFloat(formData.taxAmount) || 0 : 0,
            vatRate: parseFloat(formData.vatRate) || 18,
            companyName: formData.companyName,
            companyAddress: formData.companyAddress,
            companyPhone: formData.companyPhone,
            companyEmail: formData.companyEmail,
            updatedBy: user.id
        };

        updateSettings(newSettings);
        logActivity('עדכון הגדרות מערכת', 'project', 'settings', 'עודכנו הגדרות המערכת');
    };

    return (
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">הגדרות מערכת</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Company Information */}
                <div className="border-b border-gray-200 pb-4 sm:pb-6">
                    <h4 className="text-sm sm:text-md font-medium text-gray-900 mb-3 sm:mb-4">פרטי חברה</h4>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        <div>
                            <label htmlFor="company-name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                שם החברה
                            </label>
                            <input
                                type="text"
                                id="company-name"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                className="block w-full border border-gray-300 rounded-md shadow-sm p-1.5 sm:p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="company-phone" className="block text-sm font-medium text-gray-700">
                                טלפון
                            </label>
                            <input
                                type="tel"
                                id="company-phone"
                                value={formData.companyPhone}
                                onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="company-email" className="block text-sm font-medium text-gray-700">
                                אימייל
                            </label>
                            <input
                                type="email"
                                id="company-email"
                                value={formData.companyEmail}
                                onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="company-address" className="block text-sm font-medium text-gray-700">
                                כתובת
                            </label>
                            <input
                                type="text"
                                id="company-address"
                                value={formData.companyAddress}
                                onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                    </div>
                </div>

                {/* Tax Settings */}
                <div className="border-b border-gray-200 pb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">הגדרות מס</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="vat-rate" className="block text-sm font-medium text-gray-700">
                                מע"מ (%)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                id="vat-rate"
                                value={formData.vatRate}
                                onChange={(e) => setFormData({ ...formData, vatRate: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                מס הכנסה
                            </label>
                            
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="tax-rate"
                                        name="tax-type"
                                        checked={useTaxRate}
                                        onChange={() => setUseTaxRate(true)}
                                        className="h-4 w-4 text-blue-600 border-gray-300"
                                    />
                                    <label htmlFor="tax-rate" className="mr-2 text-sm text-gray-900">
                                        באחוזים
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.taxRate}
                                        onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                                        disabled={!useTaxRate}
                                        className="mr-2 w-20 border border-gray-300 rounded-md shadow-sm p-1 disabled:bg-gray-100"
                                    />
                                    <span className="text-sm text-gray-500">%</span>
                                </div>
                                
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="tax-amount"
                                        name="tax-type"
                                        checked={!useTaxRate}
                                        onChange={() => setUseTaxRate(false)}
                                        className="h-4 w-4 text-blue-600 border-gray-300"
                                    />
                                    <label htmlFor="tax-amount" className="mr-2 text-sm text-gray-900">
                                        סכום קבוע
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.taxAmount}
                                        onChange={(e) => setFormData({ ...formData, taxAmount: e.target.value })}
                                        disabled={useTaxRate}
                                        className="mr-2 w-24 border border-gray-300 rounded-md shadow-sm p-1 disabled:bg-gray-100"
                                    />
                                    <span className="text-sm text-gray-500">₪</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-blue-700"
                    >
                        שמור הגדרות
                    </button>
                </div>
            </form>
        </div>
    );
};

const CategorySettings = () => {
    const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
    const { projects } = useProjects();
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [error, setError] = useState('');

    const isCategoryInUse = (categoryName: string): boolean => {
        return projects.some(p => p.expenses.some(e => e.category === categoryName));
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (categories.some(c => c.name === newCategoryName.trim())) {
            setError('קטגוריה בשם זה כבר קיימת.');
            return;
        }
        addCategory(newCategoryName.trim());
        setNewCategoryName('');
        setError('');
    };
    
    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        if (categories.some(c => c.name === newCategoryName.trim() && c.id !== editingCategory.id)) {
            setError('קטגוריה בשם זה כבר קיימת.');
            return;
        }
        
        updateCategory(editingCategory.id, newCategoryName.trim());
        setNewCategoryName('');
        setEditingCategory(null);
        setError('');
    };

    const handleDelete = (category: Category) => {
        if (isCategoryInUse(category.name)) {
            alert('לא ניתן למחוק קטגוריה הנמצאת בשימוש בפרויקט אחד או יותר.');
        } else if (window.confirm(`האם אתה בטוח שברצונך למחוק את הקטגוריה "${category.name}"?`)) {
            deleteCategory(category.id);
        }
    };

    const handleEditClick = (category: Category) => {
        setEditingCategory(category);
        setNewCategoryName(category.name);
    }

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setNewCategoryName('');
        setError('');
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">ניהול קטגוריות הוצאה</h3>
            <p className="text-sm text-gray-500">נהל את רשימת הקטגוריות עבור רישום הוצאות בפרויקטים.</p>
            <form onSubmit={editingCategory ? handleUpdate : handleAdd} className="flex items-center space-x-2">
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => { setNewCategoryName(e.target.value); setError(''); }}
                    placeholder={editingCategory ? 'שנה שם קטגוריה' : 'שם קטגוריה חדשה'}
                    className="flex-grow border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    {editingCategory ? 'עדכן' : 'הוסף'}
                </button>
                {editingCategory && (
                    <button type="button" onClick={handleCancelEdit} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">ביטול</button>
                )}
            </form>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <div className="max-h-60 overflow-y-auto border rounded-md">
                <ul className="divide-y divide-gray-200">
                    {categories.map(cat => (
                        <li key={cat.id} className="p-3 flex justify-between items-center">
                            <span className="text-gray-800">{cat.name}</span>
                            <div className="space-x-2">
                                <button onClick={() => handleEditClick(cat)} className="p-1 text-gray-500 hover:text-blue-600" aria-label={`ערוך ${cat.name}`}>
                                    <EditIcon />
                                </button>
                                <button onClick={() => handleDelete(cat)} className="p-1 text-gray-500 hover:text-red-600" aria-label={`מחק ${cat.name}`}>
                                    <TrashIcon />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

const ArchivedProjects = () => {
    const { projects, unarchiveProject, deleteProject } = useProjects();
    const archivedProjects = projects.filter(p => p.isArchived);

    return (
         <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">פרויקטים בארכיון</h3>
            <p className="text-sm text-gray-500">פרויקטים שהועברו לארכיון אינם מופיעים ברשימה הראשית. ניתן לשחזר אותם או למחוק אותם לצמיתות.</p>
             <div className="max-h-80 overflow-y-auto border rounded-md">
                {archivedProjects.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {archivedProjects.map(p => (
                            <li key={p.id} className="p-3 flex justify-between items-center">
                                <div>
                                    <p className="text-gray-800 font-semibold">{p.name}</p>
                                    <p className="text-xs text-gray-500">{p.description}</p>
                                </div>
                                <div className="space-x-2 flex-shrink-0">
                                    <button onClick={() => unarchiveProject(p.id)} className="p-2 text-gray-500 hover:text-green-600 inline-flex items-center" aria-label={`שחזר את ${p.name}`}>
                                        <UnarchiveIcon />
                                        <span className="mr-1 text-xs hidden sm:inline">שחזר</span>
                                    </button>
                                    <button onClick={() => window.confirm(`האם אתה בטוח שברצונך למחוק את פרויקט "${p.name}" לצמיתות? פעולה זו אינה הפיכה.`) && deleteProject(p.id)} className="p-2 text-gray-500 hover:text-red-600 inline-flex items-center" aria-label={`מחק לצמיתות את ${p.name}`}>
                                        <TrashIcon />
                                        <span className="mr-1 text-xs hidden sm:inline">מחק לצמיתות</span>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center p-8 text-gray-500">אין פרויקטים בארכיון.</p>
                )}
            </div>
         </div>
    )
}

const DangerZone = () => {
    const { deleteAllProjects } = useProjects();

    const handleDeleteAll = () => {
        const confirmation = prompt('פעולה זו תמחק את כל הפרויקטים, ההכנסות וההוצאות לצמיתות. לא ניתן יהיה לשחזר את הנתונים.\nלאישור, הקלד "מחק הכל" ולחץ על אישור.');
        if(confirmation === 'מחק הכל') {
            deleteAllProjects();
            alert('כל הנתונים נמחקו בהצלחה.');
        } else {
            alert('המחיקה בוטלה.');
        }
    }
    
    return (
        <div className="space-y-4 p-4 border-2 border-red-500 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold text-red-700">אזור סכנה</h3>
            <p className="text-sm text-gray-600">פעולות אלו הן הרסניות ואינן ניתנות לשחזור. אנא המשך בזהירות.</p>
            <div className="text-right">
                <button onClick={handleDeleteAll} className="bg-red-600 text-white font-bold px-4 py-2 rounded-md hover:bg-red-800">
                    מחק את כל הנתונים
                </button>
            </div>
        </div>
    )
}


const SettingsPage: React.FC = () => {
    const { isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState(isAdmin ? 'profile' : 'system');

    const getTabClass = (tabName: string) => 
        `px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
        activeTab === tabName 
        ? 'bg-blue-600 text-white' 
        : 'text-gray-600 hover:bg-gray-200'
        }`;
    
    const renderContent = () => {
        switch(activeTab) {
            case 'profile': return <AdminProfile />;
            case 'categories': return <CategorySettings />;
            case 'suppliers': return <SuppliersManagement />;
            case 'archived': return <ArchivedProjects />;
            case 'danger': return <DangerZone />;
            case 'system':
            default: return <SystemSettings />;
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 mb-6">
                 <h2 className="text-2xl font-bold text-gray-900">הגדרות מערכת</h2>
                 <nav className="flex flex-wrap gap-2 mt-4 sm:mt-0" aria-label="Tabs">
                    {isAdmin && <button onClick={() => setActiveTab('profile')} className={getTabClass('profile')}>פרופיל אישי</button>}
                    <button onClick={() => setActiveTab('system')} className={getTabClass('system')}>הגדרות מערכת</button>
                    <button onClick={() => setActiveTab('categories')} className={getTabClass('categories')}>קטגוריות</button>
                    <button onClick={() => setActiveTab('suppliers')} className={getTabClass('suppliers')}>ספקים</button>
                    <button onClick={() => setActiveTab('archived')} className={getTabClass('archived')}>ארכיון</button>
                    <button onClick={() => setActiveTab('danger')} className={getTabClass('danger')}>ניהול נתונים</button>
                </nav>
            </div>
            <div>
               {renderContent()}
            </div>
        </div>
    );
};

export default SettingsPage;