import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Project, PaymentStatus } from '../types';
import { DownloadIcon } from './Icons';
import { useCategories } from '../context/CategoriesContext';
import { useSettings } from '../context/SettingsContext';
import ExportExcelModal from './ExportExcelModal';
import DateFilter, { DateRange } from './DateFilter';


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
  const { settings } = useSettings();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateRange | null>(null);

  const summaryData = useMemo(() => {
    // Filter data by date if filter is active
    const filteredIncomes = dateFilter ? 
      project.incomes.filter(income => {
        const incomeDate = new Date(income.date);
        const startDate = new Date(dateFilter.startDate);
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999);
        return incomeDate >= startDate && incomeDate <= endDate;
      }) : project.incomes;

    const filteredExpenses = dateFilter ?
      project.expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const startDate = new Date(dateFilter.startDate);
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999);
        return expenseDate >= startDate && expenseDate <= endDate;
      }) : project.expenses;

    // Income calculations with payment status
    const totalIncomes = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);
    const totalPaidAmount = filteredIncomes.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
    const totalRemainingAmount = filteredIncomes.reduce((sum, i) => sum + (i.remainingAmount || 0), 0);
    
    const incomesByStatus = {
      paid: filteredIncomes.filter(i => i.paymentStatus === PaymentStatus.Paid).reduce((sum, i) => sum + i.amount, 0),
      partiallyPaid: filteredIncomes.filter(i => i.paymentStatus === PaymentStatus.PartiallyPaid).reduce((sum, i) => sum + i.amount, 0),
      pending: filteredIncomes.filter(i => i.paymentStatus === PaymentStatus.Pending).reduce((sum, i) => sum + i.amount, 0)
    };
    
    // Expense calculations with categories and types
    const expensesByCategory = categories.reduce((acc, category) => {
        const categoryTotal = filteredExpenses
            .filter(e => e.category === category.name)
            .reduce((sum, e) => sum + e.amount, 0);
        acc[category.name] = categoryTotal;
        return acc;
    }, {} as {[key: string]: number});

    const expensesByType = {
      regular: filteredExpenses.filter(e => e.expenseType === 'regular' || !e.expenseType).reduce((sum, e) => sum + e.amount, 0),
      addition: filteredExpenses.filter(e => e.expenseType === 'addition').reduce((sum, e) => sum + e.amount, 0),
      exception: filteredExpenses.filter(e => e.expenseType === 'exception').reduce((sum, e) => sum + e.amount, 0),
      dailyWorker: filteredExpenses.filter(e => e.expenseType === 'daily-worker').reduce((sum, e) => sum + e.amount, 0)
    };

    const totalExpenses = Object.values(expensesByCategory).reduce((sum: number, amount: number) => sum + amount, 0);
    const totalExpensesWithVat = filteredExpenses.reduce((sum, e) => sum + (Number(e.amountWithVat) || e.amount), 0);
    
    // Milestones calculations
    const milestones = project.milestones || [];
    const totalMilestonesAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
    const completedMilestonesAmount = milestones
      .filter(m => m.status === 'completed')
      .reduce((sum, m) => sum + m.amount, 0);
    const milestonesProgress = totalMilestonesAmount > 0 ? (completedMilestonesAmount / totalMilestonesAmount) * 100 : 0;
    
    // Financial calculations
    const grossProfit = Number(totalPaidAmount) - Number(totalExpenses);
    const totalProfit = Number(totalIncomes) - Number(totalExpenses);
    const remainingBudget = Number(project.contractAmount || 0) - Number(totalExpenses);
    const profitMargin = totalIncomes > 0 ? (totalProfit / totalIncomes) * 100 : 0;
    
    // Tax calculations
    const taxAmount = (settings.taxRate || 0) > 0 ? 
      (grossProfit * (settings.taxRate || 0) / 100) : 
      (settings.taxAmount || 0);
    const netProfit = grossProfit - taxAmount;

    return { 
      totalIncomes, 
      totalPaidAmount,
      totalRemainingAmount,
      incomesByStatus,
      expensesByCategory, 
      expensesByType,
      totalExpenses,
      totalExpensesWithVat,
      totalProfit,
      grossProfit,
      netProfit,
      taxAmount,
      remainingBudget, 
      profitMargin, 
      contractAmount: Number(project.contractAmount || 0),
      totalMilestonesAmount,
      completedMilestonesAmount,
      milestonesProgress,
      settings
    };
  }, [project, categories, settings, dateFilter]);

  const expenseChartData = Object.entries(summaryData.expensesByCategory)
    .map(([name, value]) => ({ name, value: Number(value) }))
    .filter(d => d.value > 0);

  const incomeExpenseChartData = [
    { name: 'השוואה', הכנסות: summaryData.totalIncomes, הוצאות: summaryData.totalExpenses },
  ];

  const expenseTypeChartData = [
    { name: 'רגילות', value: summaryData.expensesByType.regular },
    { name: 'תוספות', value: summaryData.expensesByType.addition },
    { name: 'חריגות', value: summaryData.expensesByType.exception },
    { name: 'עובדים יומיים', value: summaryData.expensesByType.dailyWorker }
  ].filter(d => d.value > 0);

  const incomeStatusChartData = [
    { name: 'שולם', value: summaryData.incomesByStatus.paid },
    { name: 'שולם חלקי', value: summaryData.incomesByStatus.partiallyPaid },
    { name: 'לגבייה', value: summaryData.incomesByStatus.pending }
  ].filter(d => d.value > 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19AF'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <h2 className="text-2xl font-bold text-gray-800">סיכום פרויקט</h2>
        <div className="flex items-center space-x-4">
          <DateFilter onFilterChange={setDateFilter} placeholder="סנן דוח לפי תאריך" />
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300 inline-flex items-center"
          >
            <DownloadIcon />
            <span className="mr-2">ייצוא לאקסל</span>
          </button>
        </div>
      </div>

      {dateFilter && (
        <div className="bg-blue-50 p-4 rounded-lg border-r-4 border-blue-400">
          <p className="text-blue-700 font-medium">
            📅 הדוח מסונן לתקופה: {new Date(dateFilter.startDate).toLocaleDateString('he-IL')} - {new Date(dateFilter.endDate).toLocaleDateString('he-IL')}
          </p>
        </div>
      )}
      
      {/* Main Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="סכום חוזה" value={summaryData.contractAmount} colorClass="text-gray-700" />
        <SummaryCard title="יתרת תקציב" value={summaryData.remainingBudget} colorClass={summaryData.remainingBudget >= 0 ? 'text-blue-600' : 'text-red-700'} />
        <SummaryCard title="שולי רווח" value={`${summaryData.profitMargin.toFixed(1)}%`} colorClass={summaryData.profitMargin >= 0 ? 'text-green-600' : 'text-red-700'} />
        <SummaryCard title="רווח נקי (אחרי מס)" value={summaryData.netProfit} colorClass={summaryData.netProfit >= 0 ? 'text-green-700' : 'text-red-700'} isLarge={true}/>
      </div>

      {/* Income Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="סה״כ הכנסות" value={summaryData.totalIncomes} colorClass="text-blue-600" />
        <SummaryCard title="שולם בפועל" value={summaryData.totalPaidAmount} colorClass="text-green-600" />
        <SummaryCard title="יתרה לגבייה" value={summaryData.totalRemainingAmount} colorClass="text-red-600" />
        <SummaryCard title="מס הכנסה משוער" value={summaryData.taxAmount} colorClass="text-orange-600" />
      </div>

      {/* Milestones Progress */}
      {summaryData.totalMilestonesAmount > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">התקדמות מיילסטונים</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <SummaryCard title="סה״כ אבני דרך" value={summaryData.totalMilestonesAmount} colorClass="text-blue-600" />
            <SummaryCard title="הושלמו" value={summaryData.completedMilestonesAmount} colorClass="text-green-600" />
            <SummaryCard title="התקדמות" value={`${summaryData.milestonesProgress.toFixed(1)}%`} colorClass="text-purple-600" />
          </div>
          <div className="bg-gray-200 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${summaryData.milestonesProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Expense Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="הוצאות רגילות" value={summaryData.expensesByType.regular} colorClass="text-blue-600" />
        <SummaryCard title="תוספות" value={summaryData.expensesByType.addition} colorClass="text-yellow-600" />
        <SummaryCard title="חריגות" value={summaryData.expensesByType.exception} colorClass="text-red-600" />
        <SummaryCard title="עובדים יומיים" value={summaryData.expensesByType.dailyWorker} colorClass="text-purple-600" />
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
        
        {/* New Charts for Advanced Data */}
        {incomeStatusChartData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-center">סטטוס הכנסות</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeStatusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomeStatusChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {expenseTypeChartData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-center">סוגי הוצאות</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseTypeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseTypeChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Financial Summary Box */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">סיכום פיננסי מתקדם</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-blue-100 text-sm">רווח ברוטו</p>
            <p className="text-2xl font-bold">{formatCurrency(summaryData.grossProfit)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">מס הכנסה</p>
            <p className="text-2xl font-bold">{formatCurrency(summaryData.taxAmount)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">רווח נקי</p>
            <p className="text-2xl font-bold">{formatCurrency(summaryData.netProfit)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">הוצאות כולל מע"מ</p>
            <p className="text-2xl font-bold">{formatCurrency(summaryData.totalExpensesWithVat)}</p>
          </div>
        </div>
        
        {summaryData.settings && (
          <div className="mt-4 pt-4 border-t border-blue-400">
            <p className="text-blue-100 text-sm">
              {summaryData.settings.taxRate > 0 ? 
                `מס הכנסה: ${summaryData.settings.taxRate}%` : 
                `מס הכנסה: ${formatCurrency(summaryData.settings.taxAmount || 0)} (סכום קבוע)`
              } | מע"מ: ${summaryData.settings.vatRate}%
            </p>
          </div>
        )}
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
