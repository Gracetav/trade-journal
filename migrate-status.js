const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    console.log('Simplifying account status to Active/Breached...');

    try {
        // Update existing 'funded' and 'challenge' to 'active'
        await connection.query(`
            UPDATE prop_accounts 
            SET status = 'active' 
            WHERE status IN ('funded', 'challenge');
        `);
        console.log('Updated existing account statuses');

        // Modify column ENUM
        await connection.query(`
            ALTER TABLE prop_accounts 
            MODIFY COLUMN status ENUM('active', 'breached') DEFAULT 'active';
        `);
        console.log('Modified status column ENUM to (active, breached)');
        
        console.log('Migration completed.');
    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        await connection.end();
    }
}

migrate();
