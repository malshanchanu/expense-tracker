"use client";

export default function BudgetTracker({ expenses, categories }: { expenses: any[], categories: any[] }) {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b-2 border-indigo-100 pb-3">
                Monthly Budget Tracker
            </h2>
            <div className="space-y-6">
                {categories.map((cat: any) => {
                    
                    const spent = expenses
                        .filter((e: any) => e.CategoryName === cat.CategoryName)
                        .reduce((sum: number, e: any) => sum + e.Amount, 0);
                    
                   
                    const limit = cat.BudgetLimit || 0; 
                    
                    
                    const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                    const isOverBudget = limit > 0 && spent > limit;

                    if (limit === 0 && spent === 0) return null;

                    return (
                        <div key={cat.CategoryID} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="flex justify-between mb-2 text-sm font-bold">
                                <span className="text-gray-700">{cat.CategoryName}</span>
                                <span className={isOverBudget ? 'text-red-600' : 'text-indigo-600'}>
                                    Rs. {spent.toFixed(2)} / {limit > 0 ? `Rs. ${limit.toFixed(2)}` : 'No Limit Set'}
                                </span>
                            </div>
                            
                            
                            {limit > 0 ? (
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div 
                                         className={`h-3 rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`} 
                                         style={{ width: `${percent}%` }} 
                                        ></div>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic mt-1">Set a budget limit to track progress.</p>
                            )}

                            {isOverBudget && (
                                <p className="text-xs text-red-500 font-bold mt-2 flex items-center gap-1">
                                    ⚠️ You have exceeded the budget!
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}