const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS || process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: {
        rejectUnauthorized: false
    }
};

exports.getLogin = (req, res) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    res.render('login', { layout: false, error: null });
};

exports.postLogin = async (req, res) => {
    const { username, password } = req.body;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length === 0) {
            return res.render('login', { layout: false, error: 'User tidak ditemukan' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.render('login', { layout: false, error: 'Password salah' });
        }

        req.session.userId = user.id;
        req.session.username = user.username;
        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { layout: false, error: 'Terjadi kesalahan sistem' });
    } finally {
        if (connection) await connection.end();
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};
