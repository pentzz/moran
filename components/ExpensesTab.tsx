import React, { useState, useMemo } from 'react';
import { Project, Expense, Category, Supplier } from '../types';
import { useProjects } from '../context/ProjectsContext';
import { useCategories } from '../context/CategoriesContext';
import { useSuppliers } from '../context/SuppliersContext';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../context/UsersContext';
import { useToast } from '../context/ToastContext';
import { TrashIcon, PlusIcon, EditIcon } from './Icons';
import DateFilter, { DateRange } from './DateFilter';
import Button from './Button';
import ConfirmDialog from './ConfirmDialog';

const formatCurrency = (num: number) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(num);

const ExpenseForm: React.FC<{ projectId: string; onAdd: () => void; expense?: Expense; isEditing?: boolean; }> = ({ projectId, onAdd, expense, isEditing = false }) => {
    const { addExpense, updateExpense } = useProjects();
    const { categories } = useCategories();
    const { suppliers } = useSuppliers();
    const { user } = useAuth();
    const { logActivity } = useUsers();
    const toast = useToast();

    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [category, setCategory] = useState(expense?.category || categories[0]?.name || '');
    const [subcategory, setSubcategory] = useState(expense?.subcategory || '');
    const [date, setDate] = useState(expense?.date || new Date().toISOString().split('T')[0]);
    const [supplier, setSupplier] = useState(expense?.supplier || '');
    const [supplierId, setSupplierId] = useState(expense?.supplierId || '');
    const [description, setDescription] = useState(expense?.description || '');
    const [amount, setAmount] = useState(expense?.amount?.toString() || '');
    const [hasVat, setHasVat] = useState(expense?.hasVat || false);
    const [amountWithVat, setAmountWithVat] = useState(expense?.amountWithVat?.toString() || '');
    const [hasInvoice, setHasInvoice] = useState(expense?.hasInvoice || false);
    const [invoiceNumber, setInvoiceNumber] = useState(expense?.invoiceNumber || '');
    const [notes, setNotes] = useState(expense?.notes || '');
    const [expenseType, setExpenseType] = useState<'regular' | 'addition' | 'exception' | 'daily-worker'>(expense?.expenseType || 'regular');

    // Get current category subcategories
    const currentCategory = categories.find(c => c.name === category);
    const availableSubcategories = currentCategory?.subcategories || [];

    // Function to calculate VAT
    const calculateVat = (amountStr: string, includeVat: boolean = false) => {
        const value = parseFloat(amountStr) || 0;
        if (includeVat) {
            // If amount includes VAT, calculate the amount without VAT
            const amountBeforeVat = value / 1.18;
            return {
                amountWithVat: value,
                amountBeforeVat: Math.round(amountBeforeVat * 100) / 100
            };
        } else {
            // If amount is without VAT, calculate the amount with VAT
            const amountWithVat = value * 1.18;
            return {
                amountWithVat: Math.round(amountWithVat * 100) / 100,
                amountBeforeVat: value
            };
        }
    };

    // Handle amount changes with VAT calculation
    const handleAmountChange = (value: string) => {
        setAmount(value);
        if (hasVat && value) {
            const calculated = calculateVat(value, false);
            setAmountWithVat(calculated.amountWithVat.toString());
        }
    };

    const handleAmountWithVatChange = (value: string) => {
        setAmountWithVat(value);
        if (hasVat && value) {
            const calculated = calculateVat(value, true);
            setAmount(calculated.amountBeforeVat.toString());
        }
    };

    const handleVatToggle = (checked: boolean) => {
        setHasVat(checked);
        if (checked && amount) {
            const calculated = calculateVat(amount, false);
            setAmountWithVat(calculated.amountWithVat.toString());
        } else if (!checked) {
            setAmountWithVat('');
        }
    };

    const handleSupplierChange = (selectedSupplierId: string) => {
        setSupplierId(selectedSupplierId);
        const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
        setSupplier(selectedSupplier?.name || '');
    };

    const handleCategoryChange = (newCategory: string) => {
        setCategory(newCategory);
        setSubcategory(''); // Reset subcategory when category changes
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !supplier || !description || !amount || !user) {
            toast.error('שגיאה', 'נא למלא את כל השדות החובה');
            return;
        }

        setIsSubmitting(true);
        
        const expenseData = {
            category,
            subcategory: subcategory || undefined,
            date,
            supplier,
            supplierId: supplierId || undefined,
            description,
            amount: parseFloat(amount),
            hasVat,
            amountWithVat: hasVat ? parseFloat(amountWithVat) || undefined : undefined,
            hasInvoice,
            invoiceNumber: invoiceNumber || undefined,
            notes: notes || undefined,
            expenseType,
            createdAt: expense?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: expense?.createdBy || user.id,
        };
        
        try {
            if (isEditing && expense) {
                updateExpense(projectId, expense.id, expenseData);
                logActivity('עדכון הוצאה', 'expense', expense.id, `עודכנה הוצאה: ${description}`);
                toast.success('הוצאה עודכנה', `ההוצאה "${description}" עודכנה בהצלחה`);
            } else {
                addExpense(projectId, expenseData);
                logActivity('הוספת הוצאה', 'expense', 'new', `נוספה הוצאה: ${description}`);
                toast.success('הוצאה נוספה', `ההוצאה "${description}" נוספה בהצלחה`);
            }
        } catch (error) {
            toast.error('שגיאה', 'אירעה שגיאה בשמירת ההוצאה');
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(false);

        // Reset form
        if (!isEditing) {
            setSupplier('');
            setSupplierId('');
            setDescription('');
            setAmount('');
            setAmountWithVat('');
            setHasVat(false);
            setHasInvoice(false);
            setInvoiceNumber('');
            setNotes('');
            setSubcategory('');
            setExpenseType('regular');
        }
        onAdd();
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <div>
                    <label htmlFor="exp-cat" className="text-sm font-medium">קטגוריה</label>
                    <select id="exp-cat" value={category} onChange={e => handleCategoryChange(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2">
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                
                {availableSubcategories.length > 0 && (
                    <div>
                        <label htmlFor="exp-subcat" className="text-sm font-medium">תת-קטגוריה</label>
                        <select 
                            id="exp-subcat" 
                            value={subcategory} 
                            onChange={e => setSubcategory(e.target.value)} 
                            className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            <option value="">בחר תת-קטגוריה...</option>
                            {availableSubcategories.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                    </div>
                )}
                <div>
                    <label htmlFor="exp-supplier" className="text-sm font-medium">ספק</label>
                    <select 
                        id="exp-supplier" 
                        value={supplierId} 
                        onChange={e => handleSupplierChange(e.target.value)} 
                        required 
                        className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                        <option value="">בחר ספק...</option>
                        {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
                <div className="lg:col-span-3">
                    <label htmlFor="exp-desc" className="text-sm font-medium">תיאור</label>
                    <input id="exp-desc" type="text" value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label htmlFor="exp-date" className="text-sm font-medium">תאריך</label>
                    <input id="exp-date" type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                
                <div className="lg:col-span-3">
                    <div className="flex items-center gap-2 mb-2">
                        <input 
                            type="checkbox" 
                            id="has-vat" 
                            checked={hasVat} 
                            onChange={e => handleVatToggle(e.target.checked)}
                            className="rounded"
                        />
                        <label htmlFor="has-vat" className="text-sm font-medium">כולל מע"מ (18%)</label>
                    </div>
                </div>
                
                <div>
                    <label htmlFor="exp-amount" className="text-sm font-medium">
                        {hasVat ? 'סכום לפני מע"מ (₪)' : 'סכום (₪)'}
                    </label>
                    <input 
                        id="exp-amount" 
                        type="number" 
                        step="0.01"
                        value={amount} 
                        onChange={e => handleAmountChange(e.target.value)} 
                        required 
                        className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" 
                    />
                </div>
                
                {hasVat && (
                    <div>
                        <label htmlFor="exp-amount-vat" className="text-sm font-medium">סכום כולל מע"מ (₪)</label>
                        <input 
                            id="exp-amount-vat" 
                            type="number" 
                            step="0.01"
                            value={amountWithVat} 
                            onChange={e => handleAmountWithVatChange(e.target.value)} 
                            className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50" 
                        />
                    </div>
                )}
            </div>
            
            {/* Additional fields row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div>
                    <label htmlFor="exp-type" className="text-sm font-medium">סוג הוצאה</label>
                    <select 
                        id="exp-type" 
                        value={expenseType} 
                        onChange={e => setExpenseType(e.target.value as typeof expenseType)} 
                        className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                        <option value="regular">רגילה</option>
                        <option value="addition">תוספת</option>
                        <option value="exception">חריגה</option>
                        <option value="daily-worker">עובד יומי</option>
                    </select>
                </div>
                
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <input 
                            type="checkbox" 
                            id="has-invoice" 
                            checked={hasInvoice} 
                            onChange={e => setHasInvoice(e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label htmlFor="has-invoice" className="mr-2 text-sm font-medium text-gray-900">
                            יש חשבונית
                        </label>
                    </div>
                </div>
                
                {hasInvoice && (
                    <div>
                        <label htmlFor="invoice-number" className="text-sm font-medium">מספר חשבונית</label>
                        <input 
                            id="invoice-number" 
                            type="text" 
                            value={invoiceNumber} 
                            onChange={e => setInvoiceNumber(e.target.value)} 
                            className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" 
                        />
                    </div>
                )}
            </div>
            
            <div className="mt-4">
                <label htmlFor="exp-notes" className="text-sm font-medium">הערות</label>
                <textarea 
                    id="exp-notes" 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    rows={2}
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" 
                />
            </div>
            
            <div className="mt-4 text-left">
                <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 inline-flex items-center">
                    <PlusIcon />
                    <span className="mr-2">{isEditing ? 'עדכן' : 'הוסף'} הוצאה</span>
                </button>
            </div>
        </form>
    );
};

const ExpenseTable: React.FC<{ title: string; expenses: Expense[]; projectId: string; deleteExpense: (projectId: string, expenseId: string) => void; }> = ({ title, expenses, projectId, deleteExpense }) => (
    <div className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
             <div className="overflow-x-auto">
                {expenses.length > 0 ? (
                    <table className="w-full text-sm text-right text-gray-600">
                        <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                            <tr>
                                <th scope="col" className="px-6 py-3">תאריך</th>
                                <th scope="col" className="px-6 py-3">ספק</th>
                                <th scope="col" className="px-6 py-3">תיאור</th>
                                <th scope="col" className="px-6 py-3">סכום לפני מע"מ</th>
                                <th scope="col" className="px-6 py-3">כולל מע"מ</th>
                                <th scope="col" className="px-6 py-3"><span className="sr-only">פעולות</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((expense) => (
                                <tr key={expense.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{new Date(expense.date).toLocaleDateString('he-IL')}</td>
                                    <td className="px-6 py-4">{expense.supplier}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{expense.description}</td>
                                    <td className="px-6 py-4 font-bold text-red-600">{formatCurrency(expense.amount)}</td>
                                    <td className="px-6 py-4 text-red-600">
                                        {expense.hasVat && expense.amountWithVat ? (
                                            <span className="font-medium">{formatCurrency(expense.amountWithVat)}</span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => deleteExpense(projectId, expense.id)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors" aria-label={`מחק הוצאה: ${expense.description}`}>
                                            <TrashIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-gray-500 p-8">אין הוצאות בקטגוריה זו.</p>
                )}
            </div>
        </div>
    </div>
);


const ExpensesTab: React.FC<{ project: Project }> = ({ project }) => {
    const { deleteExpense } = useProjects();
    const { categories } = useCategories();
    const toast = useToast();
    const [showForm, setShowForm] = useState(false);
    const [dateFilter, setDateFilter] = useState<DateRange | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; expenseId: string; expenseName: string } | null>(null);
    
    const filteredExpenses = useMemo(() => {
        let expenses = [...project.expenses];

        // Apply search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            expenses = expenses.filter(expense =>
                expense.description.toLowerCase().includes(search) ||
                expense.supplier.toLowerCase().includes(search) ||
                expense.category.toLowerCase().includes(search)
            );
        }

        // Apply date filter
        if (dateFilter) {
            expenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                const startDate = new Date(dateFilter.startDate);
                const endDate = new Date(dateFilter.endDate);
                endDate.setHours(23, 59, 59, 999); // Include the end date

                return expenseDate >= startDate && expenseDate <= endDate;
            });
        }

        return expenses;
    }, [project.expenses, dateFilter, searchTerm]);

    const handleDeleteExpense = (expenseId: string, expenseName: string) => {
        setDeleteConfirm({ isOpen: true, expenseId, expenseName });
    };

    const confirmDelete = () => {
        if (deleteConfirm) {
            deleteExpense(project.id, deleteConfirm.expenseId);
            toast.success('הוצאה נמחקה', `ההוצאה "${deleteConfirm.expenseName}" נמחקה בהצלחה`);
            setDeleteConfirm(null);
        }
    };

    const sortExpenses = (expenses: Expense[]) => [...expenses].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const expensesByCategory = categories.map(category => ({
        ...category,
        expenses: sortExpenses(filteredExpenses.filter(e => e.category === category.name))
    }));

    return (
        <div className="space-y-6">
             <h2 className="text-2xl font-bold text-gray-800">ניהול הוצאות</h2>
            {showForm ? (
                <ExpenseForm projectId={project.id} onAdd={() => setShowForm(false)} />
            ) : (
                <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="חיפוש לפי תיאור, ספק או קטגוריה..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <DateFilter onFilterChange={setDateFilter} placeholder="סנן לפי תאריך" />
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            {filteredExpenses.length} הוצאות מתוך {project.expenses.length}
                        </div>
                        <Button
                            onClick={() => setShowForm(true)}
                            icon={<PlusIcon />}
                            variant="primary"
                        >
                            הוסף הוצאה חדשה
                        </Button>
                    </div>
                </div>
            )}

            <div className="space-y-8">
                {expensesByCategory.map(cat => (
                     <ExpenseTable key={cat.id} title={cat.name} expenses={cat.expenses} projectId={project.id} deleteExpense={handleDeleteExpense} />
                ))}
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm?.isOpen || false}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={confirmDelete}
                title="מחיקת הוצאה"
                message={`האם אתה בטוח שברצונך למחוק את ההוצאה "${deleteConfirm?.expenseName}"? פעולה זו אינה הפיכה.`}
                confirmText="מחק"
                type="danger"
            />
        </div>
    );
};

export default ExpensesTab;
