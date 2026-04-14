const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    res.render('login', { layout: false, error: null });
};

exports.postLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

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
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};
