import React, { useState, useMemo } from 'react';
import { useProjects } from '../context/ProjectsContext';
import { User, Project, PaymentStatus } from '../types';
import { EyeIcon, ProjectIcon } from './Icons';
import Modal from './Modal';
import UserAnalytics from './UserAnalytics';

interface UserProjectsModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onViewProject?: (projectId: string) => void;
}

const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('he-IL', { 
    style: 'currency', 
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  }).format(amount);

const getStatusBadge = (status: PaymentStatus) => {
  const badges = {
    [PaymentStatus.Paid]: 'bg-green-100 text-green-800',
    [PaymentStatus.PartiallyPaid]: 'bg-yellow-100 text-yellow-800',
    [PaymentStatus.Pending]: 'bg-red-100 text-red-800'
  };
  
  const labels = {
    [PaymentStatus.Paid]: 'שולם',
    [PaymentStatus.PartiallyPaid]: 'שולם חלקי',
    [PaymentStatus.Pending]: 'לגבייה'
  };
  
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badges[status]}`}>
      {labels[status]}
    </span>
  );
};

const ProjectCard: React.FC<{
  project: Project;
  onViewProject: (projectId: string) => void;
}> = ({ project, onViewProject }) => {
  const totalIncome = project.incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = project.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalPaid = project.incomes.reduce((sum, income) => sum + (income.paidAmount || 0), 0);
  const totalRemaining = totalIncome - totalPaid;
  const profit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((profit / totalIncome) * 100) : 0;
  
  const completedMilestones = project.milestones?.filter(m => m.status === 'completed').length || 0;
  const totalMilestones = project.milestones?.length || 0;
  const milestonesProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  const getPaymentStatus = () => {
    if (totalPaid === 0) return PaymentStatus.Pending;
    if (totalPaid >= totalIncome) return PaymentStatus.Paid;
    return PaymentStatus.PartiallyPaid;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
          <div className="flex flex-col sm:flex-row sm:items-center mt-2 space-y-1 sm:space-y-0 sm:space-x-2">
            <span className="text-xs text-gray-400">
              נוצר: {new Date(project.createdAt).toLocaleDateString('he-IL')}
            </span>
            {project.updatedAt && project.updatedAt !== project.createdAt && (
              <span className="text-xs text-gray-400">
                עודכן: {new Date(project.updatedAt).toLocaleDateString('he-IL')}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => onViewProject(project.id)}
          className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
          title="צפה בפרוייקט"
        >
          <EyeIcon />
        </button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
        <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
          <p className="text-xs text-blue-600 font-medium">סכום חוזה</p>
          <p className="text-xs sm:text-sm font-bold text-blue-800">{formatCurrency(project.contractAmount)}</p>
        </div>
        <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
          <p className="text-xs text-green-600 font-medium">נשארו לגבייה</p>
          <p className="text-xs sm:text-sm font-bold text-green-800">{formatCurrency(totalRemaining)}</p>
        </div>
        <div className="bg-purple-50 p-2 sm:p-3 rounded-lg">
          <p className="text-xs text-purple-600 font-medium">רווח צפוי</p>
          <p className="text-xs sm:text-sm font-bold text-purple-800">{formatCurrency(profit)}</p>
        </div>
        <div className="bg-yellow-50 p-2 sm:p-3 rounded-lg">
          <p className="text-xs text-yellow-600 font-medium">אחוז רווח</p>
          <p className="text-xs sm:text-sm font-bold text-yellow-800">{profitMargin.toFixed(1)}%</p>
        </div>
      </div>

      {/* Progress & Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">סטטוס תשלום:</span>
          {getPaymentStatus()}
        </div>
        
        {totalMilestones > 0 && (
          <div>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>התקדמות מיילסטונים:</span>
              <span>{completedMilestones}/{totalMilestones}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${milestonesProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{milestonesProgress.toFixed(0)}% הושלמו</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="border-t mt-3 pt-3 flex justify-between text-xs text-gray-500">
        <span>הכנסות: {project.incomes.length}</span>
        <span>הוצאות: {project.expenses.length}</span>
        <span>מיילסטונים: {totalMilestones}</span>
      </div>
    </div>
  );
};

const UserProjectsModal: React.FC<UserProjectsModalProps> = ({
  user,
  isOpen,
  onClose,
  onViewProject
}) => {
  const { projects } = useProjects();
  const [activeTab, setActiveTab] = useState<'projects' | 'analytics'>('projects');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'amount'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

  const userProjects = useMemo(() => {
    let filtered = projects.filter(project => project.ownerId === user.id);

    // Apply status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter(project => {
        const totalPaid = project.incomes.reduce((sum, income) => sum + (income.paidAmount || 0), 0);
        const totalIncome = project.incomes.reduce((sum, income) => sum + income.amount, 0);
        return totalPaid < totalIncome;
      });
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter(project => {
        const totalPaid = project.incomes.reduce((sum, income) => sum + (income.paidAmount || 0), 0);
        const totalIncome = project.incomes.reduce((sum, income) => sum + income.amount, 0);
        return totalPaid >= totalIncome;
      });
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'he');
        case 'amount':
          return b.contractAmount - a.contractAmount;
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [projects, user.id, sortBy, filterStatus]);

  const projectsStats = useMemo(() => {
    const totalProjects = userProjects.length;
    const totalValue = userProjects.reduce((sum, p) => sum + p.contractAmount, 0);
    const totalIncome = userProjects.reduce((sum, p) => 
      sum + p.incomes.reduce((incSum, inc) => incSum + inc.amount, 0), 0);
    const totalExpenses = userProjects.reduce((sum, p) => 
      sum + p.expenses.reduce((expSum, exp) => expSum + exp.amount, 0), 0);
    const totalProfit = totalIncome - totalExpenses;
    const totalPaid = userProjects.reduce((sum, p) => 
      sum + p.incomes.reduce((incSum, inc) => incSum + (inc.paidAmount || 0), 0), 0);
    const totalRemaining = totalIncome - totalPaid;

    return {
      totalProjects,
      totalValue,
      totalIncome,
      totalExpenses,
      totalProfit,
      totalPaid,
      totalRemaining
    };
  }, [userProjects]);

  const handleViewProject = (projectId: string) => {
    if (onViewProject) {
      onViewProject(projectId);
      onClose();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`פרוייקטים של ${user.fullName || user.username}`}
      size="large"
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              פרוייקטים ({userProjects.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              אנליטיקה
            </button>
          </nav>
        </div>
        {/* Tab Content */}
        {activeTab === 'projects' ? (
          <>
            {/* Stats Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">סיכום כללי</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{projectsStats.totalProjects}</p>
                  <p className="text-sm text-gray-600">פרוייקטים</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">{formatCurrency(projectsStats.totalValue)}</p>
                  <p className="text-sm text-gray-600">ערך כולל</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-purple-600">{formatCurrency(projectsStats.totalProfit)}</p>
                  <p className="text-sm text-gray-600">רווח כולל</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(projectsStats.totalRemaining)}</p>
                  <p className="text-sm text-gray-600">לגבייה</p>
                </div>
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">מיון לפי:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="date">תאריך יצירה</option>
                    <option value="name">שם פרוייקט</option>
                    <option value="amount">סכום חוזה</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">סטטוס:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">כל הפרוייקטים</option>
                    <option value="active">פעילים</option>
                    <option value="completed">הושלמו</option>
                  </select>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                מציג {userProjects.length} פרוייקטים
              </div>
            </div>

            {/* Projects Grid */}
            {userProjects.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 max-h-80 sm:max-h-96 overflow-y-auto">
                {userProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onViewProject={handleViewProject}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ProjectIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">אין פרוייקטים</h3>
                <p className="text-gray-500">
                  {filterStatus === 'all' 
                    ? 'המשתמש עדיין לא יצר פרוייקטים במערכת'
                    : `לא נמצאו פרוייקטים ${filterStatus === 'active' ? 'פעילים' : 'שהושלמו'}`
                  }
                </p>
              </div>
            )}
          </>
        ) : (
          <UserAnalytics user={user} />
        )}
      </div>
    </Modal>
  );
};

export default UserProjectsModal;
