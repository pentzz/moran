import React, { useMemo } from 'react';
import { Project } from '../types';

const formatCurrency = (num: number) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(num);

const StatCard: React.FC<{ title: string; value: string; colorClass: string }> = ({ title, value, colorClass }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-gray-500 text-md">{title}</h3>
    <p className={`font-bold text-3xl ${colorClass}`}>{value}</p>
  </div>
);

const GlobalDashboard: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const globalStats = useMemo(() => {
    let totalContractValue = 0;
    let totalIncomes = 0;
    let totalExpenses = 0;

    projects.forEach(project => {
      totalContractValue += project.contractAmount;
      totalIncomes += project.incomes.reduce((sum, i) => sum + i.amount, 0);
      totalExpenses += project.expenses.reduce((sum, e) => sum + e.amount, 0);
    });
    
    const totalProfit = totalIncomes - totalExpenses;

    return { totalContractValue, totalIncomes, totalExpenses, totalProfit, projectCount: projects.length };
  }, [projects]);

  return (
    <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">תמונת מצב כללית</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard title="מספר פרויקטים" value={globalStats.projectCount.toString()} colorClass="text-blue-600" />
            <StatCard title="שווי חוזים כולל" value={formatCurrency(globalStats.totalContractValue)} colorClass="text-gray-700" />
            <StatCard title="סך הכנסות" value={formatCurrency(globalStats.totalIncomes)} colorClass="text-green-600" />
            <StatCard title="סך הוצאות" value={formatCurrency(globalStats.totalExpenses)} colorClass="text-red-600" />
            <StatCard title="רווח כולל" value={formatCurrency(globalStats.totalProfit)} colorClass={globalStats.totalProfit >= 0 ? 'text-green-700' : 'text-red-700'} />
        </div>
    </div>
  );
};

export default GlobalDashboard;
