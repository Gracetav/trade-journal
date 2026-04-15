const db = require('../config/db');

exports.getAccounts = async (req, res) => {
    try {
        const [accounts] = await db.query(`
            SELECT * FROM real_accounts 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `, [req.session.userId]);
        res.render('real-accounts/index', { accounts });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.addAccountForm = async (req, res) => {
    res.render('real-accounts/add');
};

exports.createAccount = async (req, res) => {
    const { broker_name, account_login_id, account_type, status, leverage, platform, currency, balance } = req.body;
    try {
        await db.query(`
            INSERT INTO real_accounts (broker_name, account_login_id, account_type, balance, leverage, platform, currency, status, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [broker_name, account_login_id, account_type, balance || 0, leverage || 500, platform || 'MT5', currency || 'USD', status || 'active', req.session.userId]);
        res.redirect('/real-accounts?success=Account added successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.editAccountForm = async (req, res) => {
    try {
        const [accounts] = await db.query('SELECT * FROM real_accounts WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
        if (accounts.length === 0) return res.redirect('/real-accounts');
        res.render('real-accounts/edit', { account: accounts[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updateAccount = async (req, res) => {
    const { broker_name, account_login_id, account_type, status, leverage, platform, currency, balance } = req.body;
    try {
        await db.query(`
            UPDATE real_accounts SET 
            broker_name=?, account_login_id=?, account_type=?, balance=?, leverage=?, 
            platform=?, currency=?, status=?
            WHERE id=? AND user_id=?
        `, [broker_name, account_login_id, account_type, balance, leverage, platform, currency, status, req.params.id, req.session.userId]);
        res.redirect('/real-accounts?success=Account updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        await db.query('DELETE FROM real_accounts WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
        res.redirect('/real-accounts?success=Account deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
