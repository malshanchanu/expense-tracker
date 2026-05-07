import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db';

// 1. GET function to fetch data (with filtering)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const pool = await connectToDatabase();

        // If two dates are provided, execute the Stored Procedure
        if (startDate && endDate) {
            const result = await pool.request()
                .input('StartDate', startDate)
                .input('EndDate', endDate)
                .execute('sp_GetExpensesByDateRange'); // Your custom Stored Procedure
            return NextResponse.json(result.recordset);
        } 
        // If no dates are provided, return all records
        else {
            const result = await pool.request().query(`
                SELECT e.ExpenseID, e.Amount, e.ExpenseDate, e.Description, c.CategoryName 
                FROM Expenses e 
                JOIN Categories c ON e.CategoryID = c.CategoryID 
                ORDER BY e.ExpenseDate DESC
            `);
            return NextResponse.json(result.recordset);
        }
    } catch (error) {
        console.error("Error fetching expenses:", error);
        return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
    }
}

// 2. POST function to insert data
export async function POST(request) {
    try {
        const body = await request.json();
        const { amount, date, description, categoryId } = body;
        const pool = await connectToDatabase();
        
        await pool.request()
            .input('Amount', amount)
            .input('ExpenseDate', date)
            .input('Description', description)
            .input('CategoryID', categoryId)
            .query(`
                INSERT INTO Expenses (Amount, ExpenseDate, Description, CategoryID) 
                VALUES (@Amount, @ExpenseDate, @Description, @CategoryID)
            `);
        return NextResponse.json({ message: "Expense saved successfully! 🎉" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save expense", details: error.message }, { status: 500 });
    }
}

// 3. DELETE function to remove data
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const pool = await connectToDatabase();
        await pool.request()
            .input('ExpenseID', id)
            .query('DELETE FROM Expenses WHERE ExpenseID = @ExpenseID');
        return NextResponse.json({ message: "Expense deleted successfully!" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
    }
}