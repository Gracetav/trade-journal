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

async function upgradeTradesTable() {
    try {
        console.log('Upgrading trades table for advanced analytics...');
        
        await pool.query(`
            ALTER TABLE trades 
            ADD COLUMN IF NOT EXISTS entry_time TIMESTAMP,
            ADD COLUMN IF NOT EXISTS exit_time TIMESTAMP,
            ADD COLUMN IF NOT EXISTS volume NUMERIC DEFAULT 0
        `);
        
        console.log('Success! entry_time, exit_time, and volume columns added.');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

upgradeTradesTable();
