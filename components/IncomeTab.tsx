import React, { useState } from 'react';
import { Project, Income, PaymentMethod } from '../types';
import { useProjects } from '../context/ProjectsContext';
import { PAYMENT_METHODS } from '../constants';
import { TrashIcon, PlusIcon } from './Icons';

const formatCurrency = (num: number) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(num);

const IncomeForm: React.FC<{ projectId: string; onAdd: () => void; }> = ({ projectId, onAdd }) => {
    const { addIncome } = useProjects();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState(PaymentMethod.Transfer);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;
        addIncome(projectId, {
            date,
            description,
            amount: parseFloat(amount),
            paymentMethod,
        });
        // Reset form
        setDescription('');
        setAmount('');
        onAdd();
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="lg:col-span-2">
                    <label htmlFor="inc-desc" className="text-sm font-medium">תיאור</label>
                    <input id="inc-desc" type="text" value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label htmlFor="inc-amount" className="text-sm font-medium">סכום (₪)</label>
                    <input id="inc-amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} required className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label htmlFor="inc-date" className="text-sm font-medium">תאריך</label>
                    <input id="inc-date" type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                     <label htmlFor="inc-payment" className="text-sm font-medium">אופן תשלום</label>
                     <select id="inc-payment" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2">
                        {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </div>
            <div className="mt-4 text-right">
                <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 inline-flex items-center">
                    <PlusIcon />
                    <span className="mr-2">הוסף הכנסה</span>
                </button>
            </div>
        </form>
    );
};

const IncomeTab: React.FC<{ project: Project }> = ({ project }) => {
    const { deleteIncome } = useProjects();
    const [showForm, setShowForm] = useState(false);

    const sortedIncomes = [...project.incomes].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">ניהול הכנסות</h2>
            
            {showForm ? (
                <IncomeForm projectId={project.id} onAdd={() => setShowForm(false)} />
            ) : (
                <div className="text-right">
                    <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 inline-flex items-center">
                        <PlusIcon />
                        <span className="mr-2">הוסף הכנסה חדשה</span>
                    </button>
                </div>
            )}
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    {sortedIncomes.length > 0 ? (
                        <table className="w-full text-sm text-right text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 uppercase">
                                <tr>
                                    <th scope="col" className="px-6 py-3">תאריך</th>
                                    <th scope="col" className="px-6 py-3">תיאור</th>
                                    <th scope="col" className="px-6 py-3">אופן תשלום</th>
                                    <th scope="col" className="px-6 py-3">סכום</th>
                                    <th scope="col" className="px-6 py-3"><span className="sr-only">פעולות</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedIncomes.map((income: Income) => (
                                    <tr key={income.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">{new Date(income.date).toLocaleDateString('he-IL')}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{income.description}</td>
                                        <td className="px-6 py-4">{income.paymentMethod}</td>
                                        <td className="px-6 py-4 font-bold text-green-600">{formatCurrency(income.amount)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => deleteIncome(project.id, income.id)} className="text-red-500 hover:text-red-700" aria-label={`מחק הכנסה: ${income.description}`}>
                                                <TrashIcon />
                                            </button>
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
