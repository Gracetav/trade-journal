const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        console.log('Creating real_accounts table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS real_accounts (
                id SERIAL PRIMARY KEY,
                broker_name VARCHAR(100) NOT NULL,
                account_login_id VARCHAR(100) NOT NULL,
                account_type VARCHAR(50) DEFAULT 'standard',
                balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
                leverage INT DEFAULT 500,
                platform VARCHAR(20) DEFAULT 'MT5',
                currency VARCHAR(10) DEFAULT 'USD',
                user_id INT,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table real_accounts created successfully');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

migrate();
