import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Project } from '../types';
import { DownloadIcon } from './Icons';
import { useCategories } from '../context/CategoriesContext';
import ExportExcelModal from './ExportExcelModal';


const formatCurrency = (num: number) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(num);

const SummaryCard: React.FC<{ title: string; value: string | number; colorClass?: string; isLarge?: boolean; subtext?: string }> = ({ title, value, colorClass = 'text-gray-800', isLarge = false, subtext }) => (
  <div className={`bg-white p-6 rounded-lg shadow`}>
    <h3 className={`text-gray-500 ${isLarge ? 'text-lg' : 'text-sm'}`}>{title}</h3>
    <p className={`font-bold ${colorClass} ${isLarge ? 'text-4xl' : 'text-2xl'}`}>{typeof value === 'number' ? formatCurrency(value) : value}</p>
    {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
  </div>
);

const SummaryTab: React.FC<{ project: Project }> = ({ project }) => {
  const { categories } = useCategories();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const summaryData = useMemo(() => {
    const totalIncomes = project.incomes.reduce((sum, i) => sum + i.amount, 0);
    
    const expensesByCategory = categories.reduce((acc, category) => {
        const categoryTotal = project.expenses
            .filter(e => e.category === category.name)
            .reduce((sum, e) => sum + e.amount, 0);
        acc[category.name] = categoryTotal;
        return acc;
    }, {} as {[key: string]: number});

    const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
    const profit = totalIncomes - totalExpenses;
    const remainingBudget = project.contractAmount - totalExpenses;
    const profitMargin = totalIncomes > 0 ? (profit / totalIncomes) * 100 : 0;


    return { totalIncomes, expensesByCategory, totalExpenses, profit, remainingBudget, profitMargin, contractAmount: project.contractAmount };
  }, [project, categories]);

  const expenseChartData = Object.entries(summaryData.expensesByCategory)
    .map(([name, value]) => ({ name, value }))
    .filter(d => d.value > 0);

  const incomeExpenseChartData = [
    { name: 'השוואה', הכנסות: summaryData.totalIncomes, הוצאות: summaryData.totalExpenses },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19AF'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <h2 className="text-2xl font-bold text-gray-800">סיכום פרויקט</h2>
        <button 
          onClick={() => setIsExportModalOpen(true)}
          className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300 inline-flex items-center"
        >
          <DownloadIcon />
          <span className="mr-2">ייצוא לאקסל</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="סכום חוזה" value={summaryData.contractAmount} colorClass="text-gray-700" />
        <SummaryCard title="יתרת תקציב" value={summaryData.remainingBudget} colorClass={summaryData.remainingBudget >= 0 ? 'text-blue-600' : 'text-red-700'} />
        <SummaryCard title="שולי רווח" value={`${summaryData.profitMargin.toFixed(1)}%`} colorClass={summaryData.profitMargin >= 0 ? 'text-green-600' : 'text-red-700'} />
        <SummaryCard title="רווח / הפסד" value={summaryData.profit} colorClass={summaryData.profit >= 0 ? 'text-green-700' : 'text-red-700'} isLarge={true}/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="סך הכל הכנסות" value={summaryData.totalIncomes} colorClass="text-green-600" />
        <SummaryCard title="סך הכל הוצאות" value={summaryData.totalExpenses} colorClass="text-red-600" />
        <SummaryCard title="הוצאות לפי קטגוריות" value={Object.keys(summaryData.expensesByCategory).length} subtext="קטגוריות פעילות" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-center">התפלגות הוצאות</h3>
          {expenseChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={expenseChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {expenseChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-500 py-20">אין נתוני הוצאות להצגה</p>}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-center">הכנסות מול הוצאות</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incomeExpenseChartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
               <YAxis type="category" dataKey="name" hide />
               <Tooltip formatter={(value: number) => formatCurrency(value)} />
               <Legend />
               <Bar dataKey="הכנסות" fill="#22c55e" />
               <Bar dataKey="הוצאות" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <ExportExcelModal 
        project={project}
        summaryData={summaryData}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};

export default SummaryTab;
