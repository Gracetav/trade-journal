const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL || {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS || process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('--- Creating Users Table ---');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Tabel users berhasil dibuat.');

        // Insert Admin User
        const passwordHash = await bcrypt.hash('admin 123', 10);
        const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', ['admin']);
        
        if (rows.length === 0) {
            await connection.query('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', passwordHash]);
            console.log('User admin berhasil dibuat (Password: admin 123).');
        } else {
            console.log('User admin sudah ada.');
        }

    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await connection.end();
    }
}

migrate();
