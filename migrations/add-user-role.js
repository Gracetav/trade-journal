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

async function addRoleColumn() {
    try {
        console.log('Adding role column to users table...');
        // Add role column if not exists
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'
        `);
        
        // Update admin to have akun_real role for testing
        await pool.query(`
            UPDATE users SET role = 'akun_real' WHERE username = 'admin'
        `);
        
        console.log('Success! Column "role" added and admin updated to "akun_real".');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

addRoleColumn();
