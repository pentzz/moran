import React, { useState } from 'react';
import { Project, Expense, Category, Supplier } from '../types';
import { useProjects } from '../context/ProjectsContext';
import { useCategories } from '../context/CategoriesContext';
import { useSuppliers } from '../context/SuppliersContext';
import { TrashIcon, PlusIcon } from './Icons';

const formatCurrency = (num: number) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(num);

const ExpenseForm: React.FC<{ projectId: string; onAdd: () => void; }> = ({ projectId, onAdd }) => {
    const { addExpense } = useProjects();
    const { categories } = useCategories();
    const { suppliers } = useSuppliers();
    const [category, setCategory] = useState(categories[0]?.name || '');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [supplier, setSupplier] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [hasVat, setHasVat] = useState(false);
    const [amountWithVat, setAmountWithVat] = useState('');

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !supplier || !description || !amount) return;
        
        const expenseData = {
            category,
            date,
            supplier,
            supplierId: supplierId || undefined,
            description,
            amount: parseFloat(amount),
            hasVat,
            amountWithVat: hasVat ? parseFloat(amountWithVat) || undefined : undefined
        };
        
        addExpense(projectId, expenseData);
        
        // Reset form
        setSupplier('');
        setSupplierId('');
        setDescription('');
        setAmount('');
        setAmountWithVat('');
        setHasVat(false);
        onAdd();
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <div>
                    <label htmlFor="exp-cat" className="text-sm font-medium">קטגוריה</label>
                    <select id="exp-cat" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2">
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
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
                <div className="self-end text-left">
                     <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 inline-flex items-center">
                        <PlusIcon />
                        <span className="mr-2">הוסף הוצאה</span>
                    </button>
                </div>
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
                                        <button onClick={() => deleteExpense(projectId, expense.id)} className="text-red-500 hover:text-red-700" aria-label={`מחק הוצאה: ${expense.description}`}>
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
    const [showForm, setShowForm] = useState(false);
    
    const sortExpenses = (expenses: Expense[]) => [...expenses].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const expensesByCategory = categories.map(category => ({
        ...category,
        expenses: sortExpenses(project.expenses.filter(e => e.category === category.name))
    }));

    return (
        <div className="space-y-6">
             <h2 className="text-2xl font-bold text-gray-800">ניהול הוצאות</h2>
            {showForm ? (
                <ExpenseForm projectId={project.id} onAdd={() => setShowForm(false)} />
            ) : (
                 <div className="text-right">
                    <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 inline-flex items-center">
                        <PlusIcon />
                        <span className="mr-2">הוסף הוצאה חדשה</span>
                    </button>
                </div>
            )}

            <div className="space-y-8">
                {expensesByCategory.map(cat => (
                     <ExpenseTable key={cat.id} title={cat.name} expenses={cat.expenses} projectId={project.id} deleteExpense={deleteExpense} />
                ))}
            </div>
        </div>
    );
};

export default ExpensesTab;
