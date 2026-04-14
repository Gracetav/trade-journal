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

    try {
        console.log('Dropping current_balance column from prop_accounts...');
        await connection.query('ALTER TABLE prop_accounts DROP COLUMN current_balance');
        console.log('Migration successful: current_balance removed.');
    } catch (err) {
        if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
            console.log('Column current_balance already dropped or does not exist.');
        } else {
            console.error('Migration failed:', err);
        }
    } finally {
        await connection.end();
    }
}

migrate();
