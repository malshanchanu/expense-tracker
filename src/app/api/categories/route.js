import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db';

export async function GET() {
    try {
        const pool = await connectToDatabase();
        const result = await pool.request().query('SELECT * FROM Categories');
        return NextResponse.json(result.recordset);
    } catch (error) {
        console.error("Error fetching categories:", error);
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
            newId = Object.values(result.recordset); 
        }

        if (!newId) {
            throw new Error("Database එකෙන් ID එක ලැබුණේ නැත!");
        }

        return NextResponse.json({ message: "Category added", categoryId: newId }, { status: 201 });
        
    } catch (error) {
        console.error("Error adding category:", error);
        return NextResponse.json({ error: 'Failed to add category', details: error.message }, { status: 500 });
    }
}

// 🚀 අලුතින් එකතු කළ මකා දැමීමේ කේතය
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const pool = await connectToDatabase();
        
        await pool.request()
            .input('CategoryID', id)
            .query('DELETE FROM Categories WHERE CategoryID = @CategoryID');
            
        return NextResponse.json({ message: "Category deleted!" }, { status: 200 });
    } catch (error) {
        // අදාළ Category එකෙන් වියදම් කරලා තිබුණොත් එන දෝෂය ඇල්ලීම
        if (error.message.includes('REFERENCE constraint') || error.message.includes('conflicted with')) {
            return NextResponse.json({ error: "මෙම වර්ගයට අදාළ වියදම් දැනටමත් ඇති බැවින් එය මකා දැමිය නොහැක." }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}