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

    console.log('Migrating database...');

    try {
        await connection.query(`
            ALTER TABLE prop_accounts 
            ADD COLUMN account_type ENUM('instan', '1 step', '2 step', 'mini') DEFAULT '2 step'
            AFTER propfirm_name;
        `);
        console.log('Added account_type to prop_accounts');
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('account_type already exists in prop_accounts');
        } else {
            console.error('Error updating prop_accounts:', err);
        }
    }

    try {
        await connection.query(`
            ALTER TABLE account_purchases 
            ADD COLUMN account_type ENUM('instan', '1 step', '2 step', 'mini') DEFAULT '2 step'
            AFTER account_size;
        `);
        console.log('Added account_type to account_purchases');
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('account_type already exists in account_purchases');
        } else {
            console.error('Error updating account_purchases:', err);
        }
    }

    console.log('Migration completed.');
    await connection.end();
}

migrate();
