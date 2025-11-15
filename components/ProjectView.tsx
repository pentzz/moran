import React, { useState } from 'react';
import { Project } from '../types';
import SummaryTab from './SummaryTab';
import IncomeTab from './IncomeTab';
import ExpensesTab from './ExpensesTab';
import MilestonesManagement from './MilestonesManagement';
import ProjectSuppliersManagement from './ProjectSuppliersManagement';
import { useProjects } from '../context/ProjectsContext';

const ProjectView: React.FC<{ project: Project }> = ({ project }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const { updateProject } = useProjects();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'incomes':
        return <IncomeTab project={project} />;
      case 'expenses':
        return <ExpensesTab project={project} />;
      case 'milestones':
        return <MilestonesManagement project={project} />;
      case 'suppliers':
        return <ProjectSuppliersManagement project={project} onUpdateProject={updateProject} />;
      case 'summary':
      default:
        return <SummaryTab project={project} />;
    }
  };

  const getTabClass = (tabName: string) =>
    `px-2 xs:px-3 sm:px-4 py-2 sm:py-3 text-xs xs:text-sm font-medium rounded-t-lg transition-colors duration-200 whitespace-nowrap ${
      activeTab === tabName
      ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
    }`;

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="border-b border-gray-200 -mx-2 sm:mx-0">
        <nav className="-mb-px flex space-x-1 xs:space-x-2 sm:space-x-4 overflow-x-auto scrollbar-hide px-2 sm:px-0" aria-label="Tabs">
          <button onClick={() => setActiveTab('summary')} className={getTabClass('summary')}>דוח מסכם</button>
          <button onClick={() => setActiveTab('incomes')} className={getTabClass('incomes')}>הכנסות</button>
          <button onClick={() => setActiveTab('expenses')} className={getTabClass('expenses')}>הוצאות</button>
          <button onClick={() => setActiveTab('milestones')} className={getTabClass('milestones')}>אבני דרך</button>
          <button onClick={() => setActiveTab('suppliers')} className={getTabClass('suppliers')}>ספקים</button>
        </nav>
      </div>
      <div className="pb-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProjectView;
