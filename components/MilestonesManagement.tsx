import React, { useState } from 'react';
import { Project, Milestone } from '../types';
import { useProjects } from '../context/ProjectsContext';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../context/UsersContext';
import { PlusIcon, TrashIcon, EditIcon } from './Icons';
import Modal from './Modal';

const formatCurrency = (num: number) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(num);

const MilestoneForm: React.FC<{
  project: Project;
  milestone?: Milestone;
  isEditing?: boolean;
  onSave: () => void;
  onCancel: () => void;
}> = ({ project, milestone, isEditing = false, onSave, onCancel }) => {
  const { addMilestone, updateMilestone } = useProjects();
  const { user } = useAuth();
  const { logActivity } = useUsers();

  const [formData, setFormData] = useState({
    name: milestone?.name || '',
    description: milestone?.description || '',
    amount: milestone?.amount?.toString() || '',
    percentage: milestone?.percentage?.toString() || '',
    targetDate: milestone?.targetDate || '',
    status: milestone?.status || 'pending' as Milestone['status']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !user) return;

    const milestoneData = {
      ...formData,
      amount: parseFloat(formData.amount),
      percentage: parseFloat(formData.percentage) || 0,
      targetDate: formData.targetDate || undefined,
      projectId: project.id
    };

    try {
      if (isEditing && milestone) {
        await updateMilestone(project.id, milestone.id, milestoneData);
        logActivity(user.id, user.username, 'עדכון אבן דרך פרויקט', 'milestone', milestone.id, `עודכן אבן דרך פרויקט: ${formData.name}`);
      } else {
        await addMilestone(project.id, milestoneData);
        logActivity(user.id, user.username, 'הוספת אבן דרך פרויקט', 'milestone', project.id, `נוסף אבן דרך פרויקט: ${formData.name}`);
      }
      onSave();
    } catch (error) {
      console.error('Error saving milestone:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="milestone-name" className="block text-sm font-medium text-gray-700">
            שם אבן הדרך
          </label>
          <input
            type="text"
            id="milestone-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        
        <div>
          <label htmlFor="milestone-amount" className="block text-sm font-medium text-gray-700">
            סכום (₪)
          </label>
          <input
            type="number"
            step="0.01"
            id="milestone-amount"
            value={formData.amount}
            onChange={(e) => {
              const amount = parseFloat(e.target.value) || 0;
              const percentage = project.contractAmount > 0 ? ((amount / project.contractAmount) * 100).toFixed(2) : '0';
              setFormData({ ...formData, amount: e.target.value, percentage });
            }}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        
        <div>
          <label htmlFor="milestone-percentage" className="block text-sm font-medium text-gray-700">
            אחוז מהתקציב (%)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            id="milestone-percentage"
            value={formData.percentage}
            onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        
        <div>
          <label htmlFor="milestone-target-date" className="block text-sm font-medium text-gray-700">
            תאריך יעד
          </label>
          <input
            type="date"
            id="milestone-target-date"
            value={formData.targetDate}
            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        
        <div>
          <label htmlFor="milestone-status" className="block text-sm font-medium text-gray-700">
            סטטוס
          </label>
          <select
            id="milestone-status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Milestone['status'] })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="pending">בהמתנה</option>
            <option value="in-progress">בביצוע</option>
            <option value="completed">הושלם</option>
          </select>
        </div>
      </div>
      
      <div className="col-span-2">
        <label htmlFor="milestone-description" className="block text-sm font-medium text-gray-700">
          תיאור
        </label>
        <textarea
          id="milestone-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          ביטול
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          {isEditing ? 'עדכן' : 'הוסף'} אבן דרך
        </button>
      </div>
    </form>
  );
};

const MilestonesManagement: React.FC<{ project: Project }> = ({ project }) => {
  const { deleteMilestone } = useProjects();
  const { logActivity } = useUsers();
  const [showForm, setShowForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | undefined>();

  const milestones = project.milestones || [];
  const totalMilestonesAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
  const completedMilestonesAmount = milestones
    .filter(m => m.status === 'completed')
    .reduce((sum, m) => sum + m.amount, 0);

  const getStatusBadge = (status: Milestone['status']) => {
    const statusConfig = {
      'pending': { text: 'בהמתנה', className: 'bg-gray-100 text-gray-800' },
      'in-progress': { text: 'בביצוע', className: 'bg-blue-100 text-blue-800' },
      'completed': { text: 'הושלם', className: 'bg-green-100 text-green-800' }
    };
    
    const config = statusConfig[status];
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setShowForm(true);
  };

  const handleDeleteMilestone = async (milestoneId: string, name: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את אבן הדרך?')) {
      try {
        await deleteMilestone(project.id, milestoneId);
        logActivity('מחיקת אבן דרך פרויקט', 'project', milestoneId, `נמחק אבן דרך פרויקט: ${name}`);
      } catch (error) {
        console.error('Error deleting milestone:', error);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMilestone(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">מיילסטונים</h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 inline-flex items-center"
        >
          <PlusIcon />
          <span className="mr-2">הוסף אבן דרך</span>
        </button>
      </div>

      {/* Progress Summary */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">סה"כ מיילסטונים: </span>
            <span className="font-bold text-blue-600">{formatCurrency(totalMilestonesAmount)}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">הושלמו: </span>
            <span className="font-bold text-green-600">{formatCurrency(completedMilestonesAmount)}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">נותר: </span>
            <span className="font-bold text-red-600">
              {formatCurrency(totalMilestonesAmount - completedMilestonesAmount)}
            </span>
          </div>
        </div>
        
        {totalMilestonesAmount > 0 && (
          <div className="mt-3">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedMilestonesAmount / totalMilestonesAmount) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {((completedMilestonesAmount / totalMilestonesAmount) * 100).toFixed(1)}% הושלם
            </p>
          </div>
        )}
      </div>

      {/* Milestones Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {milestones.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    שם
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סכום
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    אחוז מהתקציב
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    תאריך יעד
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סטטוס
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {milestones.map((milestone) => (
                  <tr key={milestone.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{milestone.name}</div>
                        {milestone.description && (
                          <div className="text-sm text-gray-500">{milestone.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                      {formatCurrency(milestone.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {milestone.percentage || 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {milestone.targetDate ? 
                        new Date(milestone.targetDate).toLocaleDateString('he-IL') : 
                        '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(milestone.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditMilestone(milestone)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDeleteMilestone(milestone.id, milestone.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500 p-8">לא הוגדרו מיילסטונים עבור פרוייקט זה</p>
          )}
        </div>
      </div>

      {/* Milestone Form Modal */}
      {showForm && (
        <Modal
          isOpen={showForm}
          onClose={handleCloseForm}
          title={editingMilestone ? 'עריכת אבן דרך פרויקט' : 'הוספת אבן דרך פרויקט חדשה'}
        >
          <MilestoneForm
            project={project}
            milestone={editingMilestone}
            isEditing={!!editingMilestone}
            onSave={handleCloseForm}
            onCancel={handleCloseForm}
          />
        </Modal>
      )}
    </div>
  );
};

export default MilestonesManagement;
