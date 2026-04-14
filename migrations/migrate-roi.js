const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    console.log('Migrating database for ROI...');

    try {
        await connection.query(`
            ALTER TABLE prop_accounts 
            ADD COLUMN initial_cost DECIMAL(15, 2) DEFAULT 0
            AFTER balance;
        `);
        console.log('Added initial_cost to prop_accounts');
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('initial_cost already exists');
        } else {
            console.error('Migration error:', err);
        }
    } finally {
        await connection.end();
    }
}

migrate();
