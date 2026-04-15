const db = require('../config/db');

exports.getAccounts = async (req, res) => {
    try {
        const [accounts] = await db.query(`
            SELECT pa.*, pf.name as propfirm_name 
            FROM prop_accounts pa
            LEFT JOIN prop_firms pf ON pa.prop_firm_id = pf.id
            WHERE pa.user_id = ?
            ORDER BY pa.created_at DESC
        `, [req.session.userId]);
        res.render('accounts/index', { accounts });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.addAccountForm = async (req, res) => {
    try {
        const [firms] = await db.query('SELECT * FROM prop_firms ORDER BY name ASC');
        res.render('accounts/add', { firms });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.createAccount = async (req, res) => {
    const { prop_firm_id, account_login_id, account_type, status, target_profit } = req.body;
    const balance = req.body.balance || 0;
    const initial_cost = req.body.initial_cost || 0;
    try {
        await db.query(`
            INSERT INTO prop_accounts (prop_firm_id, account_login_id, account_type, balance, initial_cost, target_profit, status, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [prop_firm_id, account_login_id || null, account_type, balance, initial_cost, target_profit || 0, status || 'active', req.session.userId]);
        res.redirect('/accounts?success=Account added successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.editAccountForm = async (req, res) => {
    try {
        const [accounts] = await db.query('SELECT * FROM prop_accounts WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
        if (accounts.length === 0) return res.redirect('/accounts');
        const [firms] = await db.query('SELECT * FROM prop_firms ORDER BY name ASC');
        res.render('accounts/edit', { account: accounts[0], firms });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updateAccount = async (req, res) => {
    const { prop_firm_id, account_login_id, account_type, status } = req.body;
    const balance = req.body.balance || 0;
    const initial_cost = req.body.initial_cost || 0;
    const total_payout = req.body.total_payout || 0;
    try {
        await db.query(`
            UPDATE prop_accounts SET 
            prop_firm_id=?, account_login_id=?, account_type=?, balance=?, initial_cost=?, 
            status=?, total_payout=?
            WHERE id=? AND user_id=?
        `, [prop_firm_id, account_login_id || null, account_type, balance, initial_cost, status, total_payout || 0, req.params.id, req.session.userId]);
        res.redirect('/accounts?success=Account updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        await db.query('DELETE FROM prop_accounts WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
        res.redirect('/accounts?success=Account deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updateStatus = async (req, res) => {
    const { status } = req.body;
    try {
        await db.query('UPDATE prop_accounts SET status = ? WHERE id = ?', [status, req.params.id]);
        res.redirect('/accounts');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
