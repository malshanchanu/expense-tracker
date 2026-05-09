import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const pool = await connectToDatabase();

        if (startDate && endDate) {
            // Fetch expenses within a specific date range using a Stored Procedure
            const result = await pool.request()
                .input('StartDate', startDate)
                .input('EndDate', endDate)
                .execute('sp_GetExpensesByDateRange'); 
            
            return NextResponse.json(result.recordset);
        } else {
            // Fetch all expenses with category names using a SQL JOIN
            const result = await pool.request().query(`
                SELECT e.ExpenseID, e.Amount, e.ExpenseDate, e.Description, c.CategoryName 
                FROM Expenses e 
                JOIN Categories c ON e.CategoryID = c.CategoryID 
                ORDER BY e.ExpenseDate DESC
            `);
            
            return NextResponse.json(result.recordset);
        }
    } catch (error) {
        console.error("Error fetching expenses:", error.message);
        return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
    }
}

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
            
        return NextResponse.json({ message: "Expense recorded successfully!" }, { status: 201 });
    } catch (error) {
        console.error("Error saving expense:", error.message);
        return NextResponse.json({ 
            error: "Failed to record expense", 
            details: error.message 
        }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ error: "Expense ID is required" }, { status: 400 });
        }

        const pool = await connectToDatabase();
        
        await pool.request()
            .input('ExpenseID', id)
            .query('DELETE FROM Expenses WHERE ExpenseID = @ExpenseID');
            
        return NextResponse.json({ message: "Expense deleted successfully!" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting expense:", error.message);
        return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
    }
}