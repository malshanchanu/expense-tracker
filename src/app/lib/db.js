import sql from 'mssql/msnodesqlv8';

const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=(localdb)\\MSSQLLocalDB;Database=ExpenseTrackerDB;Trusted_Connection=yes;',
};

export async function connectToDatabase() {
    try {
        const pool = await sql.connect(config);
        console.log("✅ Connected Successfully to LocalDB!");
        return pool;
    } catch (error) {
        console.error("❌ Connection failed:", error.message);
        throw error;
    }
}