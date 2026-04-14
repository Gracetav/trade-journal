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

    console.log('Renaming and dropping fields in prop_accounts...');

    try {
        // 1. Drop account_name
        try {
            await connection.query('ALTER TABLE prop_accounts DROP COLUMN account_name');
            console.log('Dropped account_name column.');
        } catch (e) {
            console.log('account_name already dropped or error:', e.message);
        }

        // 2. Rename current 'balance' to 'current_balance' to avoid conflict
        try {
            await connection.query('ALTER TABLE prop_accounts CHANGE COLUMN balance current_balance DECIMAL(15, 2) NOT NULL');
            console.log('Renamed balance to current_balance.');
        } catch (e) {
            console.log('balance already renamed or error:', e.message);
        }

        // 3. Rename 'account_size' to 'balance' (since user wants Initial Balance to be called Balance)
        try {
            await connection.query('ALTER TABLE prop_accounts CHANGE COLUMN account_size balance DECIMAL(15, 2) NOT NULL DEFAULT 0');
            console.log('Renamed account_size to balance.');
        } catch (e) {
            console.log('account_size already renamed or error:', e.message);
        }

        console.log('Migration completed successfully.');
        await connection.end();
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
