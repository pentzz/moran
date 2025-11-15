import React, { useState, useMemo } from 'react';
import { Project, Income, PaymentMethod, PaymentStatus } from '../types';
import { useProjects } from '../context/ProjectsContext';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../context/UsersContext';
import { PAYMENT_METHODS } from '../constants';
import { TrashIcon, PlusIcon, EditIcon } from './Icons';
import Modal from './Modal';
import DateFilter, { DateRange } from './DateFilter';

const formatCurrency = (num: number) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(num);

const IncomeForm: React.FC<{ 
  projectId: string; 
  onAdd: () => void; 
  income?: Income;
  isEditing?: boolean;
}> = ({ projectId, onAdd, income, isEditing = false }) => {
    const { addIncome, updateIncome } = useProjects();
    const { user } = useAuth();
    const { logActivity } = useUsers();
    
    const [date, setDate] = useState(income?.date || new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState(income?.description || '');
    const [amount, setAmount] = useState(income?.amount?.toString() || '');
    const [paymentMethod, setPaymentMethod] = useState(income?.paymentMethod || PaymentMethod.Transfer);
    const [paymentStatus, setPaymentStatus] = useState(income?.paymentStatus || PaymentStatus.Pending);
    const [paidAmount, setPaidAmount] = useState(income?.paidAmount?.toString() || '0');
    const [actualPaymentDate, setActualPaymentDate] = useState(income?.actualPaymentDate || '');
    const [notes, setNotes] = useState(income?.notes || '');

    const calculateRemainingAmount = (totalAmount: number, paid: number) => {
        return Math.max(0, totalAmount - paid);
    };

    const handlePaidAmountChange = (value: string) => {
        setPaidAmount(value);
        const total = parseFloat(amount) || 0;
        const paid = parseFloat(value) || 0;
        
        if (paid === 0) {
            setPaymentStatus(PaymentStatus.Pending);
        } else if (paid >= total) {
            setPaymentStatus(PaymentStatus.Paid);
            setPaidAmount(total.toString());
        } else {
            setPaymentStatus(PaymentStatus.PartiallyPaid);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !user) return;
        
        const totalAmount = parseFloat(amount);
        const paid = parseFloat(paidAmount) || 0;
        const remaining = calculateRemainingAmount(totalAmount, paid);
        
        const incomeData = {
            date,
            description,
            amount: totalAmount,
            paymentMethod,
            paymentStatus,
            paidAmount: paid,
            remainingAmount: remaining,
            actualPaymentDate: actualPaymentDate || undefined,
            notes: notes || undefined,
            createdAt: income?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: income?.createdBy || user.id,
        };
        
        if (isEditing && income) {
            updateIncome(projectId, income.id, incomeData);
            logActivity('עדכון הכנסה', 'income', income.id, `עודכנה הכנסה: ${description}`);
        } else {
            addIncome(projectId, incomeData);
            logActivity('הוספת הכנסה', 'income', 'new', `נוספה הכנסה: ${description}`);
        }
        
        // Reset form
        if (!isEditing) {
            setDescription('');
            setAmount('');
            setPaidAmount('0');
            setActualPaymentDate('');
            setNotes('');
            setPaymentStatus(PaymentStatus.Pending);
        }
        onAdd();
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="lg:col-span-2">
                    <label htmlFor="inc-desc" className="text-sm font-medium">תיאור</label>
                    <input 
                        id="inc-desc" 
                        type="text" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        required 
                        className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" 
                    />
                </div>
                <div>
                    <label htmlFor="inc-amount" className="text-sm font-medium">סכום כולל (₪)</label>
                    <input 
                        id="inc-amount" 
                        type="number" 
                        step="0.01"
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        required 
                        className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" 
                    />
                </div>
                <div>
                    <label htmlFor="inc-date" className="text-sm font-medium">תאריך</label>
                    <input 
                        id="inc-date" 
                        type="date" 
                        value={date} 
                        onChange={e => setDate(e.target.value)} 
                        required 
                        className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end mt-4">
                <div>
                    <label htmlFor="inc-payment" className="text-sm font-medium">אופן תשלום</label>
                    <select 
                        id="inc-payment" 
                        value={paymentMethod} 
                        onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} 
                        className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                        {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                
                <div>
                    <label htmlFor="inc-paid" className="text-sm font-medium">סכום ששולם (₪)</label>
                    <input 
                        id="inc-paid" 
                        type="number" 
                        step="0.01"
                        value={paidAmount} 
                        onChange={e => handlePaidAmountChange(e.target.value)} 
                        className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" 
                    />
                </div>

                <div>
                    <label htmlFor="inc-status" className="text-sm font-medium">סטטוס תשלום</label>
                    <select 
                        id="inc-status" 
                        value={paymentStatus} 
                        onChange={e => setPaymentStatus(e.target.value as PaymentStatus)} 
                        className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                        <option value={PaymentStatus.Pending}>לגבייה</option>
                        <option value={PaymentStatus.PartiallyPaid}>שולם חלקי</option>
                        <option value={PaymentStatus.Paid}>שולם</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="inc-actual-date" className="text-sm font-medium">תאריך תשלום בפועל</label>
                    <input 
                        id="inc-actual-date" 
                        type="date" 
                        value={actualPaymentDate} 
                        onChange={e => setActualPaymentDate(e.target.value)} 
                        className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" 
                    />
                </div>
            </div>

            <div className="mt-4">
                <label htmlFor="inc-notes" className="text-sm font-medium">הערות</label>
                <textarea 
                    id="inc-notes" 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    rows={2}
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" 
                />
            </div>

            {amount && paidAmount && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-700">סכום כולל: </span>
                            <span className="font-bold text-blue-600">{formatCurrency(parseFloat(amount) || 0)}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">שולם: </span>
                            <span className="font-bold text-green-600">{formatCurrency(parseFloat(paidAmount) || 0)}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">יתרה: </span>
                            <span className="font-bold text-red-600">
                                {formatCurrency(calculateRemainingAmount(parseFloat(amount) || 0, parseFloat(paidAmount) || 0))}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-4 text-right">
                <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 inline-flex items-center">
                    <PlusIcon />
                    <span className="mr-2">{isEditing ? 'עדכן' : 'הוסף'} הכנסה</span>
                </button>
            </div>
        </form>
    );
};

const IncomeTab: React.FC<{ project: Project }> = ({ project }) => {
    const { deleteIncome } = useProjects();
    const { logActivity } = useUsers();
    const [showForm, setShowForm] = useState(false);
    const [editingIncome, setEditingIncome] = useState<Income | undefined>();
    const [dateFilter, setDateFilter] = useState<DateRange | null>(null);

    const filteredIncomes = useMemo(() => {
        let incomes = [...project.incomes];
        
        // Apply date filter
        if (dateFilter) {
            incomes = incomes.filter(income => {
                const incomeDate = new Date(income.date);
                const startDate = new Date(dateFilter.startDate);
                const endDate = new Date(dateFilter.endDate);
                endDate.setHours(23, 59, 59, 999); // Include the end date
                
                return incomeDate >= startDate && incomeDate <= endDate;
            });
        }
        
        return incomes.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [project.incomes, dateFilter]);

    const getStatusBadge = (status: PaymentStatus) => {
        const statusConfig = {
            [PaymentStatus.Paid]: { text: 'שולם', className: 'bg-green-100 text-green-800' },
            [PaymentStatus.PartiallyPaid]: { text: 'שולם חלקי', className: 'bg-yellow-100 text-yellow-800' },
            [PaymentStatus.Pending]: { text: 'לגבייה', className: 'bg-red-100 text-red-800' }
        };
        
        const config = statusConfig[status] || statusConfig[PaymentStatus.Pending];
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
                {config.text}
            </span>
        );
    };

    const handleEditIncome = (income: Income) => {
        setEditingIncome(income);
        setShowForm(true);
    };

    const handleDeleteIncome = (incomeId: string, description: string) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את ההכנסה?')) {
            deleteIncome(project.id, incomeId);
            logActivity('מחיקת הכנסה', 'income', incomeId, `נמחקה הכנסה: ${description}`);
        }
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingIncome(undefined);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">ניהול הכנסות</h2>
            
            {showForm ? (
                <IncomeForm 
                    projectId={project.id} 
                    onAdd={handleCloseForm} 
                    income={editingIncome}
                    isEditing={!!editingIncome}
                />
            ) : (
                <div className="flex justify-between items-center">
                    <DateFilter onFilterChange={setDateFilter} placeholder="סנן הכנסות לפי תאריך" />
                    
                    <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 inline-flex items-center">
                        <PlusIcon />
                        <span className="mr-2">הוסף הכנסה חדשה</span>
                    </button>
                </div>
            )}
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    {filteredIncomes.length > 0 ? (
                        <table className="w-full text-sm text-right text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 uppercase">
                                <tr>
                                    <th scope="col" className="px-6 py-3">תאריך</th>
                                    <th scope="col" className="px-6 py-3">תיאור</th>
                                    <th scope="col" className="px-6 py-3">סכום כולל</th>
                                    <th scope="col" className="px-6 py-3">שולם</th>
                                    <th scope="col" className="px-6 py-3">יתרה</th>
                                    <th scope="col" className="px-6 py-3">סטטוס</th>
                                    <th scope="col" className="px-6 py-3">אופן תשלום</th>
                                    <th scope="col" className="px-6 py-3">תאריך תשלום בפועל</th>
                                    <th scope="col" className="px-6 py-3"><span className="sr-only">פעולות</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredIncomes.map((income: Income) => (
                                    <tr key={income.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">{new Date(income.date).toLocaleDateString('he-IL')}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {income.description}
                                            {income.notes && (
                                                <div className="text-xs text-gray-500 mt-1">{income.notes}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-blue-600">
                                            {formatCurrency(income.amount)}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-green-600">
                                            {formatCurrency(income.paidAmount || 0)}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-red-600">
                                            {formatCurrency(income.remainingAmount || 0)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(income.paymentStatus || PaymentStatus.Pending)}
                                        </td>
                                        <td className="px-6 py-4">{income.paymentMethod}</td>
                                        <td className="px-6 py-4">
                                            {income.actualPaymentDate ? 
                                                new Date(income.actualPaymentDate).toLocaleDateString('he-IL') : 
                                                '-'
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button 
                                                    onClick={() => handleEditIncome(income)} 
                                                    className="text-blue-500 hover:text-blue-700" 
                                                    aria-label={`ערוך הכנסה: ${income.description}`}
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteIncome(income.id, income.description)} 
                                                    className="text-red-500 hover:text-red-700" 
                                                    aria-label={`מחק הכנסה: ${income.description}`}
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
                         <p className="text-center text-gray-500 p-8">לא הוזנו הכנסות עבור פרויקט זה.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IncomeTab;
