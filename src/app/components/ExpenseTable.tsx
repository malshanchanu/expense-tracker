"use client";
import { useState } from 'react';

export default function ExpenseTable({ expenses, categories, onDelete }: { expenses: any[], categories: any[], onDelete: (id: number) => void }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("");

    // Export expense data as a CSV file
    const handleExportCSV = () => {
        const csvData = [
            ["Date", "Category", "Amount", "Description"],
            ...expenses.map((exp: any) => [
                new Date(exp.ExpenseDate).toLocaleDateString(),
                exp.CategoryName,
                exp.Amount,
                exp.Description || ""
            ])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Expense_Report.csv";
        link.click();
    };

    // Filter expenses based on search query and selected category
    const filteredExpenses = expenses.filter((exp: any) => {
        const matchSearch = exp.Description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? true;
        const matchCategory = filterCategory ? exp.CategoryName === filterCategory : true;
        return matchSearch && matchCategory;
    });

    return (
        <div className="bg-white p-4 rounded shadow">
            {/* Search, Filter & Export Controls */}
            <div className="flex gap-4 mb-4">
                <input 
                    type="text" 
                    placeholder="Search expenses..." 
                    className="border p-2 rounded w-full outline-none focus:ring-2 focus:ring-indigo-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select 
                    aria-label="Filter by Category"
                    className="border p-2 rounded w-64 outline-none focus:ring-2 focus:ring-indigo-400"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="">All Categories</option>
                    {categories.map((c: any) => (
                        <option key={c.CategoryID} value={c.CategoryName}>{c.CategoryName}</option>
                    ))}
                </select>
                <button 
                    onClick={handleExportCSV} 
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 whitespace-nowrap font-bold transition-colors"
                >
                    Export CSV
                </button>
            </div>

            {/* Data Table */}
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-3 border-b text-gray-700">Date</th>
                        <th className="p-3 border-b text-gray-700">Category</th>
                        <th className="p-3 border-b text-gray-700">Amount</th>
                        <th className="p-3 border-b text-gray-700">Description</th>
                        <th className="p-3 border-b text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredExpenses.map((exp: any) => (
                        <tr key={exp.ExpenseID} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="p-3 text-sm text-gray-600">{new Date(exp.ExpenseDate).toLocaleDateString()}</td>
                            <td className="p-3 text-sm font-medium text-gray-800">{exp.CategoryName}</td>
                            <td className="p-3 text-sm font-bold text-red-500">LKR {Number(exp.Amount).toFixed(2)}</td>
                            <td className="p-3 text-sm text-gray-600">{exp.Description}</td>
                            <td className="p-3 text-sm">
                                <button 
                                    onClick={() => onDelete(exp.ExpenseID)} 
                                    className="text-red-500 hover:text-red-700 font-bold bg-red-50 px-3 py-1 rounded border border-red-100"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredExpenses.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-6 text-center text-gray-500 italic">
                                No expenses match your search criteria.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}