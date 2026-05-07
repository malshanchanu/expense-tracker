import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db';

export async function GET() {
    try {
        const pool = await connectToDatabase();
        const result = await pool.request().query('SELECT * FROM Categories');
        return NextResponse.json(result.recordset);
    } catch (error) {
        console.error("Error from Database:", error);
        // Here we send the actual error to the browser
        return NextResponse.json({ 
            error: 'Failed to fetch categories', 
            details: error.message // <--- This shows the detailed error message
        }, { status: 500 });
    }
}