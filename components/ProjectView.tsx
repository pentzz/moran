import React, { useState } from 'react';
import { Project } from '../types';
import SummaryTab from './SummaryTab';
import IncomeTab from './IncomeTab';
import ExpensesTab from './ExpensesTab';

const ProjectView: React.FC<{ project: Project }> = ({ project }) => {
  const [activeTab, setActiveTab] = useState('summary');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'incomes':
        return <IncomeTab project={project} />;
      case 'expenses':
        return <ExpensesTab project={project} />;
      case 'summary':
      default:
        return <SummaryTab project={project} />;
    }
  };

  const getTabClass = (tabName: string) => 
    `px-4 py-3 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
      activeTab === tabName 
      ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50' 
      : 'text-gray-500 hover:text-gray-700'
    }`;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-i-4" aria-label="Tabs">
          <button onClick={() => setActiveTab('summary')} className={getTabClass('summary')}>דוח מסכם</button>
          <button onClick={() => setActiveTab('incomes')} className={getTabClass('incomes')}>הכנסות</button>
          <button onClick={() => setActiveTab('expenses')} className={getTabClass('expenses')}>הוצאות</button>
        </nav>
      </div>
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProjectView;
