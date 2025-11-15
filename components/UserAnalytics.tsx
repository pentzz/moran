import React, { useMemo } from 'react';
import { useProjects } from '../context/ProjectsContext';
import { useUsers } from '../context/UsersContext';
import { User, PaymentStatus } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface UserAnalyticsProps {
  user: User;
}

const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('he-IL', { 
    style: 'currency', 
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  }).format(amount);

const COLORS = {
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#EF4444',
  purple: '#8B5CF6',
  indigo: '#6366F1'
};

const UserAnalytics: React.FC<UserAnalyticsProps> = ({ user }) => {
  const { projects } = useProjects();
  const { activityLogs } = useUsers();

  const userProjects = projects.filter(project => project.ownerId === user.id);
  const userActivityLogs = activityLogs.filter(log => log.userId === user.id);

  const analytics = useMemo(() => {
    // Financial metrics
    const totalProjects = userProjects.length;
    const totalContractValue = userProjects.reduce((sum, p) => sum + p.contractAmount, 0);
    const totalIncome = userProjects.reduce((sum, p) => 
      sum + p.incomes.reduce((incSum, inc) => incSum + inc.amount, 0), 0);
    const totalExpenses = userProjects.reduce((sum, p) => 
      sum + p.expenses.reduce((expSum, exp) => expSum + exp.amount, 0), 0);
    const totalPaid = userProjects.reduce((sum, p) => 
      sum + p.incomes.reduce((incSum, inc) => incSum + (inc.paidAmount || 0), 0), 0);
    const totalRemaining = totalIncome - totalPaid;
    const totalProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (totalProfit / totalIncome) * 100 : 0;

    // Project status distribution
    const projectsByStatus = userProjects.reduce((acc, project) => {
      const projectPaid = project.incomes.reduce((sum, inc) => sum + (inc.paidAmount || 0), 0);
      const projectIncome = project.incomes.reduce((sum, inc) => sum + inc.amount, 0);
      
      if (projectPaid === 0) {
        acc.pending++;
      } else if (projectPaid >= projectIncome) {
        acc.completed++;
      } else {
        acc.inProgress++;
      }
      return acc;
    }, { pending: 0, inProgress: 0, completed: 0 });

    // Income vs Expenses by project
    const projectFinancials = userProjects.map(project => {
      const income = project.incomes.reduce((sum, inc) => sum + inc.amount, 0);
      const expenses = project.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      return {
        name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
        income,
        expenses,
        profit: income - expenses
      };
    });

    // Monthly activity (last 6 months)
    const monthlyActivity = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthLogs = userActivityLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        const logKey = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`;
        return logKey === monthKey;
      });

      return {
        month: date.toLocaleDateString('he-IL', { month: 'short', year: 'numeric' }),
        activities: monthLogs.length
      };
    });

    // Category expenses
    const expensesByCategory = userProjects.reduce((acc, project) => {
      project.expenses.forEach(expense => {
        if (!acc[expense.category]) {
          acc[expense.category] = 0;
        }
        acc[expense.category] += expense.amount;
      });
      return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(expensesByCategory).map(([category, amount]) => ({
      category,
      amount: amount as number,
      percentage: totalExpenses > 0 ? (((amount as number) / totalExpenses) * 100).toFixed(1) : '0'
    }));

    return {
      totalProjects,
      totalContractValue,
      totalIncome,
      totalExpenses,
      totalPaid,
      totalRemaining,
      totalProfit,
      profitMargin,
      projectsByStatus,
      projectFinancials,
      monthlyActivity,
      categoryData
    };
  }, [userProjects, userActivityLogs]);

  const statusChartData = [
    { name: 'הושלמו', value: analytics.projectsByStatus.completed, color: COLORS.green },
    { name: 'בביצוע', value: analytics.projectsByStatus.inProgress, color: COLORS.yellow },
    { name: 'בהמתנה', value: analytics.projectsByStatus.pending, color: COLORS.red }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm sm:text-lg font-semibold text-blue-800">פרוייקטים</h3>
          <p className="text-xl sm:text-2xl font-bold text-blue-900">{analytics.totalProjects}</p>
          <p className="text-xs sm:text-sm text-blue-600">סה"כ פעילים</p>
        </div>
        
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
          <h3 className="text-sm sm:text-lg font-semibold text-green-800">רווחיות</h3>
          <p className="text-xl sm:text-2xl font-bold text-green-900">{analytics.profitMargin.toFixed(1)}%</p>
          <p className="text-xs sm:text-sm text-green-600">אחוז רווח ממוצע</p>
        </div>
        
        <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border border-yellow-200">
          <h3 className="text-sm sm:text-lg font-semibold text-yellow-800">לגבייה</h3>
          <p className="text-base sm:text-xl font-bold text-yellow-900">{formatCurrency(analytics.totalRemaining)}</p>
          <p className="text-xs sm:text-sm text-yellow-600">יתרת תשלומים</p>
        </div>
        
        <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-200">
          <h3 className="text-sm sm:text-lg font-semibold text-purple-800">רווח נטו</h3>
          <p className="text-base sm:text-xl font-bold text-purple-900">{formatCurrency(analytics.totalProfit)}</p>
          <p className="text-xs sm:text-sm text-purple-600">סה"כ רווח</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Project Status Distribution */}
        {statusChartData.length > 0 && (
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">התפלגות סטטוס פרוייקטים</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, 'פרוייקטים']}
                  labelStyle={{ textAlign: 'right', direction: 'rtl' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-3 sm:mt-4">
              {statusChartData.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-1 sm:mr-2" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-xs sm:text-sm text-gray-600">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly Activity */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">פעילות חודשית</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={analytics.monthlyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip 
                formatter={(value: number) => [value, 'פעולות']}
                labelStyle={{ textAlign: 'right', direction: 'rtl' }}
              />
              <Line 
                type="monotone" 
                dataKey="activities" 
                stroke={COLORS.blue} 
                strokeWidth={2}
                dot={{ fill: COLORS.blue, strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project Financials */}
      {analytics.projectFinancials.length > 0 && (
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">השוואה פיננסית - פרוייקטים</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.projectFinancials} margin={{ top: 20, right: 10, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value), 
                  name === 'income' ? 'הכנסות' : name === 'expenses' ? 'הוצאות' : 'רווח'
                ]}
                labelStyle={{ textAlign: 'right', direction: 'rtl' }}
              />
              <Bar dataKey="income" fill={COLORS.green} name="הכנסות" />
              <Bar dataKey="expenses" fill={COLORS.red} name="הוצאות" />
              <Bar dataKey="profit" fill={COLORS.blue} name="רווח" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Expenses */}
      {analytics.categoryData.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">הוצאות לפי קטגורית</h3>
          <div className="space-y-3">
            {analytics.categoryData
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 8)
              .map((item, index) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: Object.values(COLORS)[index % Object.values(COLORS).length] }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900 truncate">{item.category}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{item.percentage}%</span>
                    <span className="text-sm font-semibold text-gray-900 min-w-20 text-left">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Activity Summary */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">פעילות אחרונה</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {userActivityLogs.filter(log => 
                new Date(log.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </p>
            <p className="text-xs sm:text-sm text-blue-800">פעולות השבוע</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {userActivityLogs.filter(log => 
                new Date(log.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              ).length}
            </p>
            <p className="text-xs sm:text-sm text-green-800">פעולות החודש</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
            <p className="text-xl sm:text-2xl font-bold text-purple-600">{userActivityLogs.length}</p>
            <p className="text-xs sm:text-sm text-purple-800">סה"כ פעולות</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
