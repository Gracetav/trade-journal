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

async function addUserIdToTables() {
    try {
        console.log('Adding user_id column to data tables...');
        
        // List of tables that need user_id
        const tables = ['prop_accounts', 'trades', 'payouts', 'account_purchases'];
        
        for (const table of tables) {
            console.log(`- Updating table: ${table}`);
            await pool.query(`
                ALTER TABLE ${table} 
                ADD COLUMN IF NOT EXISTS user_id INT
            `);
            
            // For existing data, assign to first user or keep null
            // For safety in dev, we can assign all existing records to the first user (admin)
            await pool.query(`
                UPDATE ${table} SET user_id = (SELECT id FROM users ORDER BY id ASC LIMIT 1) WHERE user_id IS NULL
            `);
        }
        
        console.log('Success! Data isolation columns added.');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

addUserIdToTables();
