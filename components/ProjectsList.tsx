import React, { useState, useMemo } from 'react';
import { useProjects } from '../context/ProjectsContext';
import { Project, SortKey } from '../types';
import Modal from './Modal';
import { EditIcon, ArchiveIcon, PlusIcon } from './Icons';
import GlobalDashboard from './GlobalDashboard';

const formatCurrency = (num: number) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(num);

const calculateProjectMetrics = (project: Project) => {
    const totalIncomes = project.incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = project.expenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = totalIncomes - totalExpenses;
    const remainingBudget = project.contractAmount - totalExpenses;
    const budgetUsedPercent = project.contractAmount > 0 ? (totalExpenses / project.contractAmount) * 100 : 0;
    const profitMargin = totalIncomes > 0 ? (profit / totalIncomes) * 100 : 0;
    return { totalIncomes, totalExpenses, profit, remainingBudget, budgetUsedPercent, profitMargin };
};


const ProjectCard: React.FC<{ project: Project; onSelect: (id: string) => void; onEdit: (project: Project) => void; onArchive: (id: string) => void; }> = ({ project, onSelect, onEdit, onArchive }) => {
  const { totalExpenses, remainingBudget, budgetUsedPercent, profitMargin } = useMemo(() => calculateProjectMetrics(project), [project]);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <div className="p-6 flex-grow">
        <div onClick={() => onSelect(project.id)} className="cursor-pointer">
            <h2 className="text-xl font-bold text-blue-700 mb-2">{project.name}</h2>
            <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden">{project.description}</p>
            
            <div className="space-y-2 text-sm mb-4">
                 <div className="flex justify-between">
                    <span className="font-semibold">סכום חוזה:</span>
                    <span className="font-bold">{formatCurrency(project.contractAmount)}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="font-semibold">יתרת תקציב:</span>
                    <span className={`font-bold ${remainingBudget >=0 ? 'text-gray-800' : 'text-red-600'}`}>{formatCurrency(remainingBudget)}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="font-semibold">שולי רווח:</span>
                    <span className={`font-bold ${profitMargin >= 0 ? 'text-green-700' : 'text-red-700'}`}>{profitMargin.toFixed(1)}%</span>
                </div>
            </div>

            <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>ניצול תקציב</span>
                    <span>{formatCurrency(totalExpenses)} / {formatCurrency(project.contractAmount)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}></div>
                </div>
            </div>
        </div>
      </div>
      <div className="bg-gray-50 p-3 flex justify-end space-i-2 rounded-b-lg">
        <button onClick={(e) => { e.stopPropagation(); onEdit(project); }} className="p-2 text-gray-500 hover:text-blue-600" aria-label={`ערוך את פרויקט ${project.name}`}>
          <EditIcon />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onArchive(project.id); }} className="p-2 text-gray-500 hover:text-yellow-600" aria-label={`העבר לארכיון את פרויקט ${project.name}`}>
          <ArchiveIcon />
        </button>
      </div>
    </div>
  );
};

const ProjectForm: React.FC<{ project?: Project; onSave: (name: string, description: string, contractAmount: number) => void; onCancel: () => void; }> = ({ project, onSave, onCancel }) => {
    const [name, setName] = useState(project?.name || '');
    const [description, setDescription] = useState(project?.description || '');
    const [contractAmount, setContractAmount] = useState(project?.contractAmount || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(name.trim() && contractAmount) {
            onSave(name, description, Number(contractAmount));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">שם הפרויקט</label>
                <input type="text" id="projectName" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
                <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700">תיאור</label>
                <textarea id="projectDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            <div>
                <label htmlFor="contractAmount" className="block text-sm font-medium text-gray-700">סכום חוזה (₪)</label>
                <input type="number" id="contractAmount" value={contractAmount} onChange={(e) => setContractAmount(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div className="flex justify-end space-i-2 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">ביטול</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">שמור</button>
            </div>
        </form>
    );
};


const ProjectsList: React.FC<{ onSelectProject: (id: string) => void }> = ({ onSelectProject }) => {
  const { projects, addProject, updateProject, archiveProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [archivingProjectId, setArchivingProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  
  const activeProjects = useMemo(() => projects.filter(p => !p.isArchived), [projects]);

  const handleAddClick = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };
  
  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleSave = (name: string, description: string, contractAmount: number) => {
    if (editingProject) {
      updateProject(editingProject.id, { name, description, contractAmount });
    } else {
      addProject({ name, description, contractAmount });
    }
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleArchiveConfirm = () => {
    if(archivingProjectId) {
      archiveProject(archivingProjectId);
      setArchivingProjectId(null);
    }
  };

  const sortedAndFilteredProjects = useMemo(() => {
      const filtered = activeProjects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      return filtered.sort((a, b) => {
          const metricsA = calculateProjectMetrics(a);
          const metricsB = calculateProjectMetrics(b);

          switch (sortKey) {
              case 'contractAmount':
                  return b.contractAmount - a.contractAmount;
              case 'remainingBudget':
                  return metricsB.remainingBudget - metricsA.remainingBudget;
              case 'profitMargin':
                  return metricsB.profitMargin - metricsA.profitMargin;
              case 'name':
              default:
                  return a.name.localeCompare(b.name);
          }
      });
  }, [activeProjects, searchTerm, sortKey]);


  if (activeProjects.length === 0 && !isModalOpen) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">לא נמצאו פרויקטים פעילים</h2>
        <p className="text-gray-500 mb-6">התחל על ידי יצירת פרויקט חדש, או שחזר פרויקט מהארכיון בהגדרות.</p>
        <button onClick={handleAddClick} className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 inline-flex items-center">
            <PlusIcon />
            <span className="mr-2">צור פרויקט חדש</span>
        </button>
        <Modal isOpen={isModalOpen} title="צור פרויקט חדש" onClose={() => setIsModalOpen(false)}>
            <ProjectForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <GlobalDashboard projects={activeProjects} />

        <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <label htmlFor="search-project" className="sr-only">חיפוש פרויקט</label>
                    <input
                        id="search-project"
                        type="text"
                        placeholder="חיפוש לפי שם פרויקט..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                     <label htmlFor="sort-project" className="sr-only">מיון פרויקטים</label>
                     <select
                        id="sort-project"
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value as SortKey)}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                     >
                         <option value="name">מיון לפי: שם</option>
                         <option value="contractAmount">מיון לפי: סכום חוזה</option>
                         <option value="remainingBudget">מיון לפי: יתרת תקציב</option>
                         <option value="profitMargin">מיון לפי: שולי רווח</option>
                     </select>
                </div>
            </div>
        </div>

        <div className="flex justify-end">
            <button onClick={handleAddClick} className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 inline-flex items-center">
                <PlusIcon />
                <span className="mr-2">הוסף פרויקט</span>
            </button>
        </div>

        {sortedAndFilteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedAndFilteredProjects.map(p => (
                    <ProjectCard key={p.id} project={p} onSelect={onSelectProject} onEdit={handleEditClick} onArchive={setArchivingProjectId} />
                ))}
            </div>
        ) : (
            <p className="text-center text-gray-500 py-8">לא נמצאו פרויקטים התואמים את החיפוש.</p>
        )}
        
        <Modal isOpen={isModalOpen} title={editingProject ? 'ערוך פרויקט' : 'צור פרויקט חדש'} onClose={() => setIsModalOpen(false)}>
            <ProjectForm project={editingProject || undefined} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
        </Modal>
        <Modal isOpen={archivingProjectId !== null} title="אישור העברה לארכיון" onClose={() => setArchivingProjectId(null)}>
            <p>האם להעביר פרויקט זה לארכיון? תוכל לשחזר אותו מאוחר יותר דרך מסך ההגדרות.</p>
            <div className="flex justify-end space-i-2 pt-4">
                <button onClick={() => setArchivingProjectId(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">ביטול</button>
                <button onClick={handleArchiveConfirm} className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700">העבר לארכיון</button>
            </div>
        </Modal>
    </div>
  );
};

export default ProjectsList;