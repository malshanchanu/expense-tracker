"use client";
import { useEffect, useState } from 'react';

export default function Home() {
    const [categories, setCategories] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]); 
    
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    
    const [categoryId, setCategoryId] = useState('');
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [modalMessage, setModalMessage] = useState(''); // 🚀 Modal එකේ පණිවිඩ සඳහා
    
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage("සුරකිමින් පවතී... ⏳");

        let finalCategoryId: any = categoryId;

        try {
            if (isNewCategory) {
                const catRes = await fetch('/api/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ categoryName: newCategoryName, description: "Added by user" })
                });

                if (catRes.ok) {
                    const catData = await catRes.json();
                    finalCategoryId = catData; 
                    fetchCategories(); 
                } else {
                    setStatusMessage("❌ වර්ගය ඇතුළත් කිරීම අසාර්ථකයි!");
                    return;
                }
            }

            const strVal = typeof finalCategoryId === 'string' ? finalCategoryId : JSON.stringify(finalCategoryId);
            const match = strVal.match(/\d+/); 
            const parsedId = match ? parseInt(match, 10) : NaN;

            if (isNaN(parsedId)) {
                setStatusMessage(`❌ කරුණාකර වියදම් වර්ගයක් තෝරන්න!`);
                return;
            }

            const expenseData = { amount: parseFloat(amount), date, description, categoryId: parsedId };
            
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expenseData)
            });

            if (response.ok) {
                setStatusMessage("✅ වියදම සාර්ථකව ඇතුළත් කළා!");
                setAmount(''); setDate(''); setDescription(''); setCategoryId(''); 
                setNewCategoryName(''); setIsNewCategory(false);
                setTimeout(() => setStatusMessage(''), 3000);
                fetchExpenses(filterStartDate, filterEndDate); 
            } else {
                const errorData = await response.json();
                setStatusMessage(`❌ දෝෂයක්: ${errorData.details || errorData.error}`);
            }
        } catch (error: any) {
            setStatusMessage(`❌ සර්වර් දෝෂයක් මතු වුණා!`);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("ඔබට විශ්වාසද මෙම වියදම මකා දැමිය යුතුයි කියා?")) return;
        try {
            const response = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
            if (response.ok) fetchExpenses(filterStartDate, filterEndDate);
        } catch (error) { console.error(error); }
    };

    // 🚀 Alert Boxes සම්පූර්ණයෙන්ම ඉවත් කර, ලස්සනට පණිවිඩය පෙන්වීම
    const handleDeleteCategory = async (idToDel: any, catName: string) => {
        setModalMessage(`⏳ "${catName}" මකා දමමින් පවතී...`);

        try {
            let finalId = idToDel;
            if (typeof idToDel === 'object' && idToDel !== null) {
                finalId = idToDel.CategoryID || idToDel.categoryId || Object.values(idToDel);
            }
            
            const strVal = String(finalId);
            const match = strVal.match(/\d+/); 
            const parsedId = match ? parseInt(match, 10) : null;

            if (!parsedId) {
                setModalMessage(`❌ අංකය සොයාගත නොහැක!`);
                return;
            }

            const response = await fetch(`/api/categories?id=${parsedId}`, { method: 'DELETE' });
            
            if (response.ok) {
                setModalMessage(`✅ "${catName}" සාර්ථකව මකා දැමුවා!`);
                if (categoryId == parsedId.toString()) setCategoryId(''); 
                fetchCategories(); 
            } else {
                setModalMessage(`❌ මකා දැමිය නොහැක: "${catName}" යටතේ දැනටමත් වියදම් ඇත.`);
            }
        } catch (error) {
            setModalMessage("❌ සර්වර් දෝෂයක් මතු වුණා!");
        }
        
        setTimeout(() => setModalMessage(''), 5000); // තත්පර 5කින් පණිවිඩය මැකෙයි
    };

    const handleFilter = () => {
        if (filterStartDate && filterEndDate) fetchExpenses(filterStartDate, filterEndDate);
        else alert("කරුණාකර ආරම්භක සහ අවසන් දිනයන් දෙකම තෝරන්න.");
    };

    const clearFilter = () => {
        setFilterStartDate(''); setFilterEndDate(''); fetchExpenses();
    };

    const totalExpenses = expenses.reduce((sum, expense) => sum + (Number(expense.Amount) || 0), 0);

    return (
        <div className="min-h-screen bg-slate-100 p-10 font-sans text-gray-800 relative">
            
            {showCategoryManager && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h2 className="text-xl font-bold text-gray-800">⚙️ වියදම් වර්ග කළමනාකරණය</h2>
                            <button onClick={() => {setShowCategoryManager(false); setModalMessage('');}} className="text-gray-400 hover:text-red-500 font-bold text-2xl transition-colors">&times;</button>
                        </div>
                        
                        {/* 🚀 පණිවිඩ පෙන්වන කොටුව */}
                        {modalMessage && (
                            <div className={`mb-4 p-3 rounded-lg text-sm font-bold text-center transition-all ${modalMessage.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {modalMessage}
                            </div>
                        )}
                        
                        <div className="overflow-y-auto flex-1 pr-2">
                            {categories.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">වර්ග කිසිවක් නොමැත.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {categories.map((cat, index) => {
                                        const catId = cat.CategoryID || cat.categoryId || cat.CategoryId || cat.id || Object.values(cat);
                                        const catName = cat.CategoryName || cat.categoryName || cat.Categoryname || cat.name || Object.values(cat);
                                        return (
                                            <li key={index} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-gray-200 shadow-sm">
                                                <span className="font-medium text-gray-700">{catName}</span>
                                                <button onClick={() => handleDeleteCategory(catId, catName as string)} className="bg-red-100 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded text-sm font-semibold transition-colors">
                                                    මකන්න
                                                </button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>
                        
                        <button onClick={() => {setShowCategoryManager(false); setModalMessage('');}} className="mt-5 w-full bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-lg font-bold transition-colors">
                            වසන්න
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-8">
                
                <h1 className="text-4xl font-extrabold text-indigo-700 text-center tracking-tight bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    💰 Daily Expense Tracker
                </h1>

                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-8 text-center text-white transform transition-all hover:scale-[1.02]">
                    <h2 className="text-xl font-medium text-indigo-100 mb-2">ඔබේ මුළු වියදම් එකතුව</h2>
                    <p className="text-5xl font-extrabold tracking-tight">
                        Rs. {totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b-2 border-indigo-100 pb-3">අලුත් වියදමක් ඇතුළත් කරන්න</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="expenseAmount" className="block text-sm font-medium text-gray-700 mb-1">වියදම් වූ මුදල (Rs.)</label>
                                <input id="expenseAmount" type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="උදා: 1500.00" />
                            </div>
                            <div>
                                <label htmlFor="expenseDate" className="block text-sm font-medium text-gray-700 mb-1">දිනය</label>
                                <input id="expenseDate" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                                <label htmlFor="expenseCategory" className="block text-sm font-bold text-indigo-900">වියදම් වර්ගය</label>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setIsNewCategory(!isNewCategory)} className="text-sm text-indigo-600 font-bold hover:underline bg-indigo-100 px-3 py-1 rounded-full transition-colors">
                                        {isNewCategory ? "← ලැයිස්තුවෙන් තෝරන්න" : "➕ අලුත් වර්ගයක් සදන්න"}
                                    </button>
                                    
                                    <button type="button" onClick={() => setShowCategoryManager(true)} className="text-sm text-rose-600 font-bold hover:underline bg-rose-100 px-3 py-1 rounded-full transition-colors">
                                        ⚙️ වර්ග මකන්න
                                    </button>
                                </div>
                            </div>
                            
                            {isNewCategory ? (
                                <input id="newCategory" type="text" required value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="w-full p-3 border border-indigo-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white" placeholder="අලුත් වර්ගයේ නම (උදා: Gym, Trip)" />
                            ) : (
                                <select id="expenseCategory" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-indigo-500">
                                    <option value="" disabled>-- වර්ගයක් තෝරන්න --</option>
                                    {categories.map((cat, index) => {
                                        const catId = cat.CategoryID || cat.categoryId || cat.CategoryId || cat.id || Object.values(cat);
                                        const catName = cat.CategoryName || cat.categoryName || cat.Categoryname || cat.name || Object.values(cat);
                                        return (
                                            <option key={index} value={catId}>{catName}</option>
                                        );
                                    })}
                                </select>
                            )}
                        </div>

                        <div>
                            <label htmlFor="expenseDescription" className="block text-sm font-medium text-gray-700 mb-1">විස්තරය</label>
                            <input id="expenseDescription" type="text" required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="උදා: කඩෙන් කෑම ගත්තා" />
                        </div>
                        <div className="flex items-center gap-4 pt-2">
                            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors">සුරකින්න (Save)</button>
                            {statusMessage && <span className={`font-medium ${statusMessage.includes('❌') ? 'text-red-500' : 'text-indigo-600 animate-pulse'}`}>{statusMessage}</span>}
                        </div>
                    </form>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b-2 border-indigo-100 pb-4 gap-4">
                        <h2 className="text-2xl font-semibold text-gray-700">මෑතකදී කළ වියදම්</h2>
                        
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-gray-200">
                            <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="p-2 border border-gray-300 rounded text-sm outline-none" />
                            <span className="text-gray-500">-</span>
                            <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="p-2 border border-gray-300 rounded text-sm outline-none" />
                            <button onClick={handleFilter} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">සොයන්න</button>
                            <button onClick={clearFilter} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors">මකන්න</button>
                        </div>
                    </div>

                    {expenses.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">මෙම දින පරාසය තුළ වියදම් කිසිවක් නැත.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-indigo-50 text-indigo-900 border-b-2 border-indigo-200">
                                        <th className="p-4 font-semibold rounded-tl-lg">දිනය</th>
                                        <th className="p-4 font-semibold">වර්ගය</th>
                                        <th className="p-4 font-semibold">විස්තරය</th>
                                        <th className="p-4 font-semibold text-right">මුදල (Rs.)</th>
                                        <th className="p-4 font-semibold text-center rounded-tr-lg">ක්‍රියාව</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map((expense, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                                            <td className="p-4 text-gray-600">{new Date(expense.ExpenseDate).toISOString().split('T')}</td>
                                            <td className="p-4 text-gray-800 font-medium">{expense.CategoryName}</td>
                                            <td className="p-4 text-gray-600">{expense.Description}</td>
                                            <td className="p-4 font-bold text-red-500 text-right">{Number(expense.Amount).toFixed(2)}</td>
                                            <td className="p-4 text-center">
                                                <button onClick={() => handleDelete(expense.ExpenseID)} className="bg-red-100 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1 rounded transition-colors text-sm font-semibold">මකන්න</button>
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