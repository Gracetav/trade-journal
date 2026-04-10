const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    console.log('Adding Account ID to Purchases...');

    try {
        await connection.query(`
            ALTER TABLE account_purchases 
            ADD COLUMN account_login_id VARCHAR(100) AFTER propfirm_name;
        `);
        console.log('Added account_login_id to account_purchases');
        console.log('Migration completed.');
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') console.log('account_login_id already exists');
        else console.error('Migration error:', err);
    } finally {
        await connection.end();
    }
}

migrate();
