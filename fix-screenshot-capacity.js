const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixScreenshotColumn() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL || {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS || process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('--- Altering Trades Table (Screenshot capacity) ---');
        // Change screenshot from VARCHAR/TEXT to LONGTEXT to handle large Base64 strings
        await connection.query(`
            ALTER TABLE trades 
            MODIFY COLUMN screenshot LONGTEXT
        `);
        console.log('Kolom screenshot berhasil diubah menjadi LONGTEXT.');

    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await connection.end();
    }
}

fixScreenshotColumn();
