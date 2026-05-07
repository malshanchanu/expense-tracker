"use client";
import { useEffect, useState } from 'react';

export default function Home() {
    const [categories, setCategories] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]); 
    
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    useEffect(() => {
        fetchCategories();
        fetchExpenses();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data);
        } catch (err) { console.error(err); }
    };

    const fetchExpenses = async (start = '', end = '') => {
        try {
            let url = '/api/expenses';
            if (start && end) {
                url += `?startDate=${start}&endDate=${end}`;
            }
            const res = await fetch(url);
            const data = await res.json();
            setExpenses(data);
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage("Saving... ⏳");
        const expenseData = { amount: parseFloat(amount), date, description, categoryId: parseInt(categoryId) };

        try {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expenseData)
            });

            if (response.ok) {
                setStatusMessage("✅ Expense saved successfully!");
                setAmount(''); setDate(''); setDescription(''); setCategoryId('');
                setTimeout(() => setStatusMessage(''), 3000);
                fetchExpenses(filterStartDate, filterEndDate); 
            } else {
                setStatusMessage("❌ An error occurred!");
                setTimeout(() => setStatusMessage(''), 4000);
            }
        } catch (error) {
            setStatusMessage("❌ An error occurred!");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        try {
            const response = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
            if (response.ok) fetchExpenses(filterStartDate, filterEndDate);
        } catch (error) { console.error(error); }
    };

    const handleFilter = () => {
        if (filterStartDate && filterEndDate) {
            fetchExpenses(filterStartDate, filterEndDate);
        } else {
            alert("Please select both a start date and an end date.");
        }
    };

    const clearFilter = () => {
        setFilterStartDate('');
        setFilterEndDate('');
        fetchExpenses();
    };

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.Amount, 0);

    return (
        <div className="min-h-screen bg-slate-100 p-10 font-sans text-gray-800">
            <div className="max-w-4xl mx-auto space-y-8">
                
                <h1 className="text-4xl font-extrabold text-indigo-700 text-center tracking-tight bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    💰 Daily Expense Tracker
                </h1>

                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-8 text-center text-white transform transition-all hover:scale-[1.02]">
                    <h2 className="text-xl font-medium text-indigo-100 mb-2">Your Total Expenses</h2>
                    <p className="text-5xl font-extrabold tracking-tight">
                        Rs. {totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b-2 border-indigo-100 pb-3">Add a New Expense</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="expenseAmount" className="block text-sm font-medium text-gray-700 mb-1">Amount Spent (Rs.)</label>
                                <input id="expenseAmount" title="Amount" type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g: 1500.00" />
                            </div>
                            <div>
                                <label htmlFor="expenseDate" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input id="expenseDate" title="Date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Select a date" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="expenseCategory" className="block text-sm font-medium text-gray-700 mb-1">Expense Category</label>
                            <select id="expenseCategory" title="Category" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-indigo-500">
                                <option value="" disabled>-- Select a Category --</option>
                                {categories.map(cat => (
                                    <option key={cat.CategoryID} value={cat.CategoryID}>{cat.CategoryName}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="expenseDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input id="expenseDescription" title="Description" type="text" required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g: Bought food from the shop" />
                        </div>
                        <div className="flex items-center gap-4 pt-2">
                            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors">Save</button>
                            {statusMessage && <span className={`font-medium ${statusMessage.includes('❌') ? 'text-red-500' : 'text-indigo-600 animate-pulse'}`}>{statusMessage}</span>}
                        </div>
                    </form>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b-2 border-indigo-100 pb-4 gap-4">
                        <h2 className="text-2xl font-semibold text-gray-700">Recent Expenses</h2>
                        
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-gray-200">
                            <label htmlFor="filterStart" className="sr-only">Start Date</label>
                            <input id="filterStart" title="Start Date" type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="p-2 border border-gray-300 rounded text-sm outline-none" placeholder="Start Date" />
                            <span className="text-gray-500">-</span>
                            <label htmlFor="filterEnd" className="sr-only">End Date</label>
                            <input id="filterEnd" title="End Date" type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="p-2 border border-gray-300 rounded text-sm outline-none" placeholder="End Date" />
                            <button onClick={handleFilter} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">Search</button>
                            <button onClick={clearFilter} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors">Clear</button>
                        </div>
                    </div>

                    {expenses.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No expenses found for this date range.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-indigo-50 text-indigo-900 border-b-2 border-indigo-200">
                                        <th className="p-4 font-semibold rounded-tl-lg">Date</th>
                                        <th className="p-4 font-semibold">Category</th>
                                        <th className="p-4 font-semibold">Description</th>
                                        <th className="p-4 font-semibold text-right">Amount (Rs.)</th>
                                        <th className="p-4 font-semibold text-center rounded-tr-lg">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map((expense, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                                            <td className="p-4 text-gray-600">{new Date(expense.ExpenseDate).toISOString().split('T')}</td>
                                            <td className="p-4 text-gray-800 font-medium">{expense.CategoryName}</td>
                                            <td className="p-4 text-gray-600">{expense.Description}</td>
                                            <td className="p-4 font-bold text-red-500 text-right">{expense.Amount.toFixed(2)}</td>
                                            <td className="p-4 text-center">
                                                <button onClick={() => handleDelete(expense.ExpenseID)} className="bg-red-100 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1 rounded transition-colors text-sm font-semibold">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                
            </div>
        </div>
    );
}