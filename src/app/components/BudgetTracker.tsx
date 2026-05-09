"use client";

export default function BudgetTracker({ expenses, categories }: { expenses: any[], categories: any[] }) {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b-2 border-indigo-100 pb-3">
                Monthly Budget Utilization
            </h2>
            <div className="space-y-6">
                {categories.map((cat: any) => {
                    // Calculate total spent for this category
                    const spent = expenses
                        .filter((e: any) => e.CategoryName === cat.CategoryName)
                        .reduce((sum: number, e: any) => sum + (Number(e.Amount) || 0), 0);
                    
                    // Retrieve limit
                    const limit = Number(cat.BudgetLimit) || 0; 
                    
                    // Calculate utilization percentage
                    const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                    const isOverBudget = limit > 0 && spent > limit;

                    // Do not render if no limit is set and no expenses exist
                    if (limit === 0 && spent === 0) return null;

                    return (
                        <div key={cat.CategoryID} className="bg-slate-50 p-5 rounded-xl border border-slate-100 transition-all hover:shadow-md">
                            <div className="flex justify-between items-end mb-3">
                                <div>
                                    <span className="block text-sm font-bold text-indigo-900 uppercase tracking-wide">{cat.CategoryName}</span>
                                    <span className="text-xs text-gray-500">
                                        {limit > 0 ? `${percent.toFixed(0)}% utilized` : 'Budget limit not defined'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className={`block font-bold ${isOverBudget ? 'text-red-600' : 'text-indigo-600'}`}>
                                        LKR {spent.toLocaleString()}
                                    </span>
                                    {limit > 0 && (
                                        <span className="text-xs text-gray-400 font-medium">Allocation: LKR {limit.toLocaleString()}</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Progress Bar Container */}
                            {limit > 0 ? (
                                <div className="w-full bg-gray-200 rounded-full h-3.5 overflow-hidden">
                                    {/* eslint-disable-next-line react/no-unknown-property */}
                                    <div 
                                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                                            isOverBudget ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-green-400 to-emerald-500'
                                        }`} 
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>
                            ) : (
                                <div className="w-full bg-gray-100 rounded-full h-1.5 border border-dashed border-gray-300"></div>
                            )}

                            {isOverBudget && (
                                <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                                    <span className="text-xs font-black uppercase px-2 py-0.5 bg-red-600 text-white rounded">Warning</span>
                                    <p className="text-xs font-bold uppercase tracking-tighter">
                                        Limit exceeded by LKR {(spent - limit).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
                
                {/* Fallback for empty state */}
                {categories.length === 0 && (
                    <p className="text-center text-gray-400 py-10 font-medium italic">No tracking data available for the current period.</p>
                )}
            </div>
        </div>
    );
}