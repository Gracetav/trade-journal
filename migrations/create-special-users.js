const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    ssl: { rejectUnauthorized: false }
});

async function createSpecialUsers() {
    try {
        console.log('Creating special users...');
        const passwordHash = await bcrypt.hash('user123', 10);

        // Create userprop
        await pool.query(`
            INSERT INTO users (username, password, role) 
            VALUES ($1, $2, $3)
            ON CONFLICT (username) DO UPDATE SET role = $3
        `, ['userprop', passwordHash, 'akun_prop']);
        console.log('Account "userprop" (akun_prop) ready.');

        // Create userreal
        await pool.query(`
            INSERT INTO users (username, password, role) 
            VALUES ($1, $2, $3)
            ON CONFLICT (username) DO UPDATE SET role = $3
        `, ['userreal', passwordHash, 'akun_real']);
        console.log('Account "userreal" (akun_real) ready.');

        console.log('Success! Both accounts have password: user123');
    } catch (err) {
        console.error('Failed to create users:', err.message);
    } finally {
        await pool.end();
    }
}

createSpecialUsers();
