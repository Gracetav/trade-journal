const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS
    });

    console.log('Connected to MySQL server.');

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    console.log(`Database ${process.env.DB_NAME} created or already exists.`);

    await connection.changeUser({ database: process.env.DB_NAME });

    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const statements = sql.split(';').filter(s => s.trim() !== '');

    for (let statement of statements) {
        await connection.query(statement);
    }

    console.log('Schema applied successfully.');
    await connection.end();
}

initDB().catch(err => {
    console.error('Error initializing database:', err);
    process.exit(1);
});
