const db = require('../config/db');

exports.getAccounts = async (req, res) => {
    try {
        const [accounts] = await db.query('SELECT * FROM prop_accounts ORDER BY created_at DESC');
        res.render('accounts/index', { accounts });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.addAccountForm = (req, res) => {
    res.render('accounts/add');
};

exports.createAccount = async (req, res) => {
    const { account_name, propfirm_name, account_type, status } = req.body;
    const balance = req.body.balance || 0;
    const initial_cost = req.body.initial_cost || 0;
    const total_payout = req.body.total_payout || 0;
    try {
        await db.query(`
            INSERT INTO prop_accounts (account_name, propfirm_name, account_type, balance, initial_cost, status, total_payout)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [account_name, propfirm_name, account_type, balance, initial_cost, status, total_payout]);
        res.redirect('/accounts?success=Account added successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.editAccountForm = async (req, res) => {
    try {
        const [accounts] = await db.query('SELECT * FROM prop_accounts WHERE id = ?', [req.params.id]);
        if (accounts.length === 0) return res.redirect('/accounts');
        res.render('accounts/edit', { account: accounts[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updateAccount = async (req, res) => {
    const { account_name, propfirm_name, account_type, status } = req.body;
    const balance = req.body.balance || 0;
    const initial_cost = req.body.initial_cost || 0;
    const total_payout = req.body.total_payout || 0;
    try {
        await db.query(`
            UPDATE prop_accounts SET account_name=?, propfirm_name=?, account_type=?, balance=?, initial_cost=?, status=?, total_payout=?
            WHERE id=?
        `, [account_name, propfirm_name, account_type, balance, initial_cost, status, total_payout, req.params.id]);
        res.redirect('/accounts?success=Account updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        await db.query('DELETE FROM prop_accounts WHERE id = ?', [req.params.id]);
        res.redirect('/accounts?success=Account deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
