import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db';

export async function GET() {
    try {
        const pool = await connectToDatabase();
        const result = await pool.request().query('SELECT * FROM Categories');
        return NextResponse.json(result.recordset);
    } catch (error) {
        console.error("Error fetching categories:", error.message);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { categoryName, description } = body;
        const pool = await connectToDatabase();

        const result = await pool.request()
            .input('CategoryName', categoryName)
            .input('Description', description || 'User added category')
            .query(`
                INSERT INTO Categories (CategoryName, Description) 
                OUTPUT INSERTED.CategoryID
                VALUES (@CategoryName, @Description)
            `);

        let newId = null;
        if (result.recordset && result.recordset.length > 0) {
            // Extract the first value from the first record
            newId = Object.values(result.recordset); 
        }

        if (!newId) {
            throw new Error("Category ID was not returned from the database.");
        }

        return NextResponse.json({ 
            message: "Category added successfully", 
            categoryId: newId 
        }, { status: 201 });
        
    } catch (error) {
        console.error("Error adding category:", error.message);
        return NextResponse.json({ 
            error: 'Failed to add category', 
            details: error.message 
        }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
        }

        const pool = await connectToDatabase();
        
        await pool.request()
            .input('CategoryID', id)
            .query('DELETE FROM Categories WHERE CategoryID = @CategoryID');
            
        return NextResponse.json({ message: "Category deleted successfully!" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting category:", error.message);
        
        // Handle Foreign Key constraint errors (if expenses are linked to this category)
        if (error.message.includes('REFERENCE constraint') || error.message.includes('conflicted with')) {
            return NextResponse.json({ 
                error: "Cannot delete category as it is linked to existing expense records." 
            }, { status: 400 });
        }
        
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}