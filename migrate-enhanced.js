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

    console.log('Migrating database for Enhanced Payouts and Accounts...');

    try {
        // Add account_login_id to prop_accounts
        try {
            await connection.query(`
                ALTER TABLE prop_accounts 
                ADD COLUMN account_login_id VARCHAR(100) AFTER propfirm_name;
            `);
            console.log('Added account_login_id to prop_accounts');
        } catch (err) {
            if (err.code === 'ER_DUP_COLUMN_NAME') console.log('account_login_id already exists');
            else throw err;
        }

        // Add account_balance to payouts
        try {
            await connection.query(`
                ALTER TABLE payouts 
                ADD COLUMN account_balance DECIMAL(15, 2) AFTER status;
            `);
            console.log('Added account_balance to payouts');
        } catch (err) {
            if (err.code === 'ER_DUP_COLUMN_NAME') console.log('account_balance already exists');
            else throw err;
        }

        // Add certificate to payouts
        try {
            await connection.query(`
                ALTER TABLE payouts 
                ADD COLUMN certificate VARCHAR(255) AFTER account_balance;
            `);
            console.log('Added certificate to payouts');
        } catch (err) {
            if (err.code === 'ER_DUP_COLUMN_NAME') console.log('certificate already exists');
            else throw err;
        }
        
        console.log('Migration completed.');
    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        await connection.end();
    }
}

migrate();
