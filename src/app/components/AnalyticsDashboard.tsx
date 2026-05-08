"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AnalyticsDashboard({ expenses, categories }: { expenses: any[], categories: any[] }) {
    // ප්‍රස්ථාරයට අවශ්‍ය දත්ත සකස් කිරීම
    const chartData = categories.map((cat: any) => {
        const total = expenses
            .filter((e: any) => e.CategoryName === cat.CategoryName)
            .reduce((sum: number, e: any) => sum + e.Amount, 0);
        return { name: cat.CategoryName, value: total };
    }).filter((d: any) => d.value > 0);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A3'];

    if (chartData.length === 0) return null;

    return (
        <div className="bg-white p-4 rounded shadow mt-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Expense Analytics (වියදම් විශ්ලේෂණය)</h2>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie 
                            data={chartData} 
                            cx="50%" cy="50%" 
                            outerRadius={80} 
                            fill="#8884d8" 
                            dataKey="value" 
                            
                        >
                            {chartData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}