import sql from 'mssql/msnodesqlv8';

// =========================================================================
//  IMPORTANT: Update the 'serverName' variable below to match your SQL Server!
// =========================================================================

// Option 1: For LocalDB (Uncomment this if you are using LocalDB)
const serverName = '(localdb)\\MSSQLLocalDB';

// Option 2: For SQLEXPRESS (Uncomment this if you are using SQLEXPRESS)
// const serverName = '.\\SQLEXPRESS'; 

// Option 3: For Custom Server Name (Uncomment and put your PC name / server name)
// const serverName = 'YOUR_SERVER_NAME';

const config = {
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${serverName};Database=ExpenseTrackerDB;Trusted_Connection=yes;`,
};

export async function connectToDatabase() {
    try {
        const pool = await sql.connect(config);
        console.log(`✅ Connected Successfully to ${serverName}!`);
        return pool;
    } catch (error) {
        console.error("❌ Connection failed:", error.message);
        throw error;
    }
}