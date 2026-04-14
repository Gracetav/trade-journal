const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    max: 3, // Sama dengan connectionLimit di mysql2
    idleTimeoutMillis: 10000,
});

// Wrapper agar kompatibel dengan syntax [rows] dari mysql2/promise
const db = {
    query: async (text, params) => {
        // Otomatis ganti ? ke $1, $2, dst agar kompatibel dengan Postgres
        let count = 0;
        const pgText = text.replace(/\?/g, () => `$${++count}`);
        const result = await pool.query(pgText, params);
        return [result.rows, result.fields];
    },
    execute: async (text, params) => {
        let count = 0;
        const pgText = text.replace(/\?/g, () => `$${++count}`);
        const result = await pool.query(pgText, params);
        return [result.rows, result.fields];
    },
    pool: pool
};

module.exports = db;
