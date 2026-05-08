"use client";
import { useEffect, useState } from 'react';
import BudgetTracker from './components/BudgetTracker';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ExpenseTable from './components/ExpenseTable';

export default function Home() {
    const [categories, setCategories] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]); 
    
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newBudgetLimit, setNewBudgetLimit] = useState(''); // අලුතින් දැමූ Budget Limit එක
    const [modalMessage, setModalMessage] = useState('');
    
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
            if (start && end) url += `?startDate=${start}&endDate=${end}`;
            const res = await fetch(url);
            const data = await res.json();
            setExpenses(data);
        } catch (err) { console.error(err); }
    };

    const handleAddCategoryInModal = async () => {
        if (!newCategoryName.trim()) {
            setModalMessage("Error: Please enter a category name.");
            return;
        }
        setModalMessage("Adding category...");
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    categoryName: newCategoryName, 
                    description: "Added by user",
                    budgetLimit: parseFloat(newBudgetLimit) || 0 // අලුතින් දැමූ Budget Limit එක යැවීම
                })
            });

            if (res.ok) {
                setModalMessage("Success: Category added successfully!");
                setNewCategoryName('');
                setNewBudgetLimit(''); // අලුතින් දැමූ කොටස හිස් කිරීම
                fetchCategories();
            } else {
                setModalMessage("Error: Could not add category.");
            }
        } catch (err) {
            setModalMessage("Error: Server error.");
        }
        setTimeout(() => setModalMessage(''), 3000);
    };

    const handleSubmitExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage("Saving expense...");

        if (!categoryId) {
            setStatusMessage("Error: Please select a category.");
            return;
        }

        try {
            const strVal = String(categoryId);
            const match = strVal.match(/\d+/); 
            const parsedId = match ? parseInt((match as unknown) as string, 10) : NaN;

            const expenseData = { amount: parseFloat(amount), date, description, categoryId: parsedId };
            
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expenseData)
            });

            if (response.ok) {
                setStatusMessage("Success: Recorded successfully.");
                setAmount(''); setDate(''); setDescription(''); setCategoryId(''); 
                setTimeout(() => setStatusMessage(''), 3000);
                fetchExpenses(filterStartDate, filterEndDate); 
            } else {
                const errorData = await response.json();
                setStatusMessage(`Error: ${errorData.error}`);
            }
        } catch (error) {
            setStatusMessage("Error: Communication failed.");
        }
    };

    const handleDeleteExpense = async (id: number) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const response = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
            if (response.ok) fetchExpenses(filterStartDate, filterEndDate);
        } catch (error) { console.error(error); }
    };

    const handleDeleteCategory = async (idToDel: any, catName: string) => {
        if (!window.confirm(`Delete category "${catName}"?`)) return;
        setModalMessage(`Deleting "${catName}"...`);
        try {
            const strVal = String(idToDel);
            const match = strVal.match(/\d+/); 
            const parsedId = match ? parseInt((match as unknown) as string, 10) : null;

            const response = await fetch(`/api/categories?id=${parsedId}`, { method: 'DELETE' });
            if (response.ok) {
                setModalMessage("Success: Category removed.");
                fetchCategories();
            } else {
                setModalMessage("Error: This category has linked expenses.");
            }
        } catch (error) {
            setModalMessage("Error: Server error.");
        }
        setTimeout(() => setModalMessage(''), 3000);
    };

    const totalExpenses = expenses.reduce((sum, expense) => sum + (Number(expense.Amount) || 0), 0);

    return (
        <div className="min-h-screen bg-slate-100 p-10 font-sans text-gray-800 relative">
            
            {/* Category Manager Modal */}
            {showCategoryManager && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h2 className="text-xl font-bold text-indigo-900">Manage Categories</h2>
                            <button onClick={() => {setShowCategoryManager(false); setModalMessage('');}} className="text-gray-400 hover:text-red-500 text-2xl font-bold" aria-label="Close modal">&times;</button>
                        </div>

                        <div className="mb-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <label htmlFor="newCategoryInput" className="block text-sm font-bold text-indigo-900 mb-2">Create New Category</label>
                            {/* මෙතනයි වෙනස කළේ: flex-col දාලා කොටු දෙක පේළි දෙකකට හැදුවා ලස්සනට පේන්න */}
                            <div className="flex flex-col gap-3">
                                <input 
                                    id="newCategoryInput"
                                    type="text" 
                                    value={newCategoryName} 
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Category Name (e.g. Shopping)"
                                    className="w-full p-2 border border-indigo-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                                />
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        value={newBudgetLimit} 
                                        onChange={(e) => setNewBudgetLimit(e.target.value)}
                                        placeholder="Budget Limit (Rs)"
                                        className="flex-1 p-2 border border-indigo-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                                    />
                                    <button 
                                        onClick={handleAddCategoryInModal}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>

                        {modalMessage && (
                            <div className={`mb-4 p-3 rounded-lg text-sm font-bold text-center ${modalMessage.includes('Success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {modalMessage}
                            </div>
                        )}

                        <div className="overflow-y-auto flex-1">
                            <h3 className="text-sm font-bold text-gray-600 mb-2">Existing Categories</h3>
                            <ul className="space-y-2">
                                {categories.map((cat, index) => (
                                    <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <span className="text-gray-700 font-medium">{cat.CategoryName}</span>
                                        <button onClick={() => handleDeleteCategory(cat.CategoryID, cat.CategoryName)} className="text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 px-3 py-1 rounded-md">
                                            Delete
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <button onClick={() => setShowCategoryManager(false)} className="mt-5 w-full bg-slate-800 text-white py-2 rounded-lg font-bold hover:bg-slate-900">
                            Close
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-8">
                <header>
                    <h1 className="text-4xl font-extrabold text-indigo-700 text-center tracking-tight bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        Daily Expense Tracker
                    </h1>
                </header>

                <section className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-8 text-center text-white">
                    <h2 className="text-xl font-medium text-indigo-100 mb-1">Total Expenditure</h2>
                    <p className="text-5xl font-extrabold tracking-tight">
                        Rs. {totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </section>

                <main className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b-2 border-indigo-100 pb-3">Record New Expense</h2>
                    <form onSubmit={handleSubmitExpense} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="amountInput" className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs.)</label>
                                <input id="amountInput" type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                            </div>
                            <div>
                                <label htmlFor="dateInput" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input id="dateInput" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="categorySelect" className="block text-sm font-bold text-indigo-900">Category</label>
                                <button type="button" onClick={() => setShowCategoryManager(true)} className="text-xs font-bold bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors">
                                    Manage List
                                </button>
                            </div>
                            <select id="categorySelect" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-indigo-500">
                                <option value="" disabled>-- Select Category --</option>
                                {categories.map((cat, index) => (
                                    <option key={index} value={cat.CategoryID}>{cat.CategoryName}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="descInput" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input id="descInput" type="text" required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Details about expense" />
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                            <button type="submit" className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">Save Transaction</button>
                            {statusMessage && <output className={`font-bold ${statusMessage.includes('Error') ? 'text-red-500' : 'text-indigo-600'}`}>{statusMessage}</output>}
                        </div>
                    </form>
                </main>
                
                {/* Budget Tracker */}
                <BudgetTracker expenses={expenses} categories={categories} />
                
                {/* Analytics Dashboard */}
                <AnalyticsDashboard expenses={expenses} categories={categories} />

                {/* Expense Table and Filter */}
                <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b-2 border-indigo-100 pb-4 gap-4">
                        <h2 className="text-2xl font-semibold text-gray-700">Recent Transactions</h2>
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-gray-200">
                            <input id="filterStart" aria-label="Start Date" type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="p-2 border border-gray-300 rounded text-sm outline-none" />
                            <span className="text-gray-400">to</span>
                            <input id="filterEnd" aria-label="End Date" type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="p-2 border border-gray-300 rounded text-sm outline-none" />
                            <button onClick={() => fetchExpenses(filterStartDate, filterEndDate)} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-indigo-700">Filter</button>
                            <button onClick={() => {setFilterStartDate(''); setFilterEndDate(''); fetchExpenses();}} className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-bold hover:bg-gray-300">Clear</button>
                        </div>
                    </div>

                    <ExpenseTable 
                        expenses={expenses} 
                        categories={categories} 
                        onDelete={handleDeleteExpense} 
                    />
                </section>
            </div>
        </div>
    );
}