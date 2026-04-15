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

async function upgradeTradesForMT5() {
    try {
        console.log('Finalizing trades table for MT5 automation...');
        
        await pool.query(`
            ALTER TABLE trades 
            ADD COLUMN IF NOT EXISTS type VARCHAR(10),
            ADD COLUMN IF NOT EXISTS exit_price NUMERIC
        `);
        
        console.log('Success! type and exit_price columns added.');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

upgradeTradesForMT5();
