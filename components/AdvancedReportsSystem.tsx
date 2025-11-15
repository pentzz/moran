import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectsContext';
import { Project, User, Income, Expense } from '../types';
import { projectsApi, usersApi } from '../services/serverApi';
import { 
  DownloadIcon, 
  CalendarIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  StatsIcon,
  ProjectIcon,
  UserIcon
} from './Icons';

interface ReportFilter {
  dateRange: {
    start: string;
    end: string;
  };
  projectIds: string[];
  userIds: string[];
  includeArchived: boolean;
}

interface ReportData {
  totalProjects: number;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  profitMargin: number;
  projectBreakdown: {
    project: Project;
    revenue: number;
    expenses: number;
    profit: number;
    profitMargin: number;
  }[];
  monthlyData: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

const AdvancedReportsSystem: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { projects } = useProjects();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  
  const [filter, setFilter] = useState<ReportFilter>({
    dateRange: {
      start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // תחילת השנה
      end: new Date().toISOString().split('T')[0] // היום
    },
    projectIds: [],
    userIds: [],
    includeArchived: false
  });

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
    generateReport();
  }, [filter, projects]);

  const loadUsers = async () => {
    try {
      const usersData = await usersApi.getAll();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const generateReport = () => {
    setIsLoading(true);
    
    try {
      // Filter projects based on criteria
      let filteredProjects = projects.filter(project => {
        // Archive filter
        if (!filter.includeArchived && project.isArchived) return false;
        
        // Project filter
        if (filter.projectIds.length > 0 && !filter.projectIds.includes(project.id)) return false;
        
        // User filter (only for admin)
        if (isAdmin && filter.userIds.length > 0 && !filter.userIds.includes(project.ownerId || '')) return false;
        
        // Non-admin users see only their projects
        if (!isAdmin && project.ownerId !== user?.id) return false;
        
        return true;
      });

      // Date range filter
      const startDate = new Date(filter.dateRange.start);
      const endDate = new Date(filter.dateRange.end);
      
      const projectBreakdown = filteredProjects.map(project => {
        // Filter incomes and expenses by date range
        const filteredIncomes = project.incomes.filter(income => {
          const incomeDate = new Date(income.date);
          return incomeDate >= startDate && incomeDate <= endDate;
        });
        
        const filteredExpenses = project.expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= startDate && expenseDate <= endDate;
        });
        
        const revenue = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
        const expenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const profit = revenue - expenses;
        const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
        
        return {
          project,
          revenue,
          expenses,
          profit,
          profitMargin
        };
      });

      // Calculate totals
      const totalRevenue = projectBreakdown.reduce((sum, item) => sum + item.revenue, 0);
      const totalExpenses = projectBreakdown.reduce((sum, item) => sum + item.expenses, 0);
      const profit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

      // Generate monthly data
      const monthlyData: { [key: string]: { revenue: number; expenses: number } } = {};
      
      filteredProjects.forEach(project => {
        project.incomes.forEach(income => {
          const incomeDate = new Date(income.date);
          if (incomeDate >= startDate && incomeDate <= endDate) {
            const monthKey = incomeDate.toISOString().slice(0, 7); // YYYY-MM
            if (!monthlyData[monthKey]) monthlyData[monthKey] = { revenue: 0, expenses: 0 };
            monthlyData[monthKey].revenue += income.amount;
          }
        });
        
        project.expenses.forEach(expense => {
          const expenseDate = new Date(expense.date);
          if (expenseDate >= startDate && expenseDate <= endDate) {
            const monthKey = expenseDate.toISOString().slice(0, 7); // YYYY-MM
            if (!monthlyData[monthKey]) monthlyData[monthKey] = { revenue: 0, expenses: 0 };
            monthlyData[monthKey].expenses += expense.amount;
          }
        });
      });

      const monthlyDataArray = Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          revenue: data.revenue,
          expenses: data.expenses,
          profit: data.revenue - data.expenses
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      // Category breakdown
      const categoryTotals: { [key: string]: number } = {};
      
      filteredProjects.forEach(project => {
        project.expenses.forEach(expense => {
          const expenseDate = new Date(expense.date);
          if (expenseDate >= startDate && expenseDate <= endDate) {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
          }
        });
      });

      const categoryBreakdown = Object.entries(categoryTotals)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount);

      setReportData({
        totalProjects: filteredProjects.length,
        totalRevenue,
        totalExpenses,
        profit,
        profitMargin,
        projectBreakdown: projectBreakdown.sort((a, b) => b.profit - a.profit),
        monthlyData: monthlyDataArray,
        categoryBreakdown
      });
      
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = () => {
    // Create a simple PDF export functionality
    const reportContent = `
דוח פיננסי מתקדם
תאריך: ${new Date().toLocaleDateString('he-IL')}
טווח תאריכים: ${new Date(filter.dateRange.start).toLocaleDateString('he-IL')} - ${new Date(filter.dateRange.end).toLocaleDateString('he-IL')}

סיכום כללי:
- סך פרויקטים: ${reportData?.totalProjects || 0}
- סך הכנסות: ₪${(reportData?.totalRevenue || 0).toLocaleString()}
- סך הוצאות: ₪${(reportData?.totalExpenses || 0).toLocaleString()}
- רווח נקי: ₪${(reportData?.profit || 0).toLocaleString()}
- שיעור רווחיות: ${(reportData?.profitMargin || 0).toFixed(2)}%

פירוט לפי פרויקטים:
${reportData?.projectBreakdown.map(item => 
  `${item.project.name}: רווח ₪${item.profit.toLocaleString()} (${item.profitMargin.toFixed(2)}%)`
).join('\n') || ''}

פירוט לפי קטגוריות:
${reportData?.categoryBreakdown.map(item => 
  `${item.category}: ₪${item.amount.toLocaleString()} (${item.percentage.toFixed(2)}%)`
).join('\n') || ''}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `דוח-פיננסי-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', { 
      style: 'currency', 
      currency: 'ILS',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">מערכת דוחות מתקדמת</h1>
            <p className="text-gray-600 mt-1">
              דוחות פיננסיים מפורטים ואנליזה עסקית
            </p>
          </div>
          <button
            onClick={exportToPDF}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
          >
            <DownloadIcon />
            ייצא דוח
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">מסננים</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              טווח תאריכים
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filter.dateRange.start}
                onChange={(e) => setFilter(prev => ({ 
                  ...prev, 
                  dateRange: { ...prev.dateRange, start: e.target.value } 
                }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={filter.dateRange.end}
                onChange={(e) => setFilter(prev => ({ 
                  ...prev, 
                  dateRange: { ...prev.dateRange, end: e.target.value } 
                }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Projects Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              פרויקטים
            </label>
            <select
              multiple
              value={filter.projectIds}
              onChange={(e) => setFilter(prev => ({
                ...prev,
                projectIds: Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Users Filter (Admin only) */}
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                משתמשים
              </label>
              <select
                multiple
                value={filter.userIds}
                onChange={(e) => setFilter(prev => ({
                  ...prev,
                  userIds: Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value)
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fullName || user.username}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Include Archived */}
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filter.includeArchived}
                onChange={(e) => setFilter(prev => ({ ...prev, includeArchived: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="mr-2 text-sm text-gray-700">כלול פרויקטים ארכיוניים</span>
            </label>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ProjectIcon />
            </div>
            <div className="text-2xl font-bold text-blue-600">{reportData.totalProjects}</div>
            <div className="text-gray-600">פרויקטים</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUpIcon />
            </div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(reportData.totalRevenue)}</div>
            <div className="text-gray-600">סך הכנסות</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingDownIcon />
            </div>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(reportData.totalExpenses)}</div>
            <div className="text-gray-600">סך הוצאות</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
              reportData.profit >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <StatsIcon />
            </div>
            <div className={`text-2xl font-bold ${
              reportData.profit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(reportData.profit)}
            </div>
            <div className="text-gray-600">רווח נקי ({reportData.profitMargin.toFixed(1)}%)</div>
          </div>
        </div>
      )}

      {/* Detailed Reports */}
      {reportData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Breakdown */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">פירוט לפי פרויקטים</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {reportData.projectBreakdown.slice(0, 5).map((item, index) => (
                  <div key={item.project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.project.name}</p>
                      <p className="text-sm text-gray-600">
                        הכנסות: {formatCurrency(item.revenue)} | הוצאות: {formatCurrency(item.expenses)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(item.profit)}
                      </p>
                      <p className="text-sm text-gray-600">{item.profitMargin.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">פירוט לפי קטגוריות</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {reportData.categoryBreakdown.slice(0, 5).map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-gray-900">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(item.amount)}</p>
                      <p className="text-sm text-gray-600">{item.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Trend */}
      {reportData && reportData.monthlyData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">מגמה חודשית</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {reportData.monthlyData.map((month) => (
                <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(month.month + '-01').toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}
                    </p>
                  </div>
                  <div className="flex space-x-6 text-sm">
                    <div className="text-center">
                      <p className="text-green-600 font-medium">{formatCurrency(month.revenue)}</p>
                      <p className="text-gray-600">הכנסות</p>
                    </div>
                    <div className="text-center">
                      <p className="text-red-600 font-medium">{formatCurrency(month.expenses)}</p>
                      <p className="text-gray-600">הוצאות</p>
                    </div>
                    <div className="text-center">
                      <p className={`font-medium ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(month.profit)}
                      </p>
                      <p className="text-gray-600">רווח</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedReportsSystem;
