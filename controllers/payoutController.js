const db = require('../config/db');

exports.getPayouts = async (req, res) => {
    try {
        const [payouts] = await db.query(`
            SELECT p.*, a.account_name 
            FROM payouts p 
            JOIN prop_accounts a ON p.account_id = a.id 
            ORDER BY p.request_date DESC
        `);
        res.render('payouts/index', { payouts });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.addPayoutForm = async (req, res) => {
    const [accounts] = await db.query('SELECT id, account_name, propfirm_name FROM prop_accounts');
    res.render('payouts/add', { accounts });
};

exports.createPayout = async (req, res) => {
    const { account_id, status, request_date } = req.body;
    const amount = req.body.amount || 0;
    try {
        await db.query(`
            INSERT INTO payouts (account_id, amount, status, request_date)
            VALUES (?, ?, ?, ?)
        `, [account_id, amount, status, request_date]);
        res.redirect('/payouts?success=Payout request saved');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.editPayoutForm = async (req, res) => {
    try {
        const [payouts] = await db.query('SELECT * FROM payouts WHERE id = ?', [req.params.id]);
        const [accounts] = await db.query('SELECT id, account_name, propfirm_name FROM prop_accounts');
        if (payouts.length === 0) return res.redirect('/payouts');
        res.render('payouts/edit', { payout: payouts[0], accounts });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updatePayout = async (req, res) => {
    const { account_id, status, request_date } = req.body;
    const amount = req.body.amount || 0;
    try {
        await db.query(`
            UPDATE payouts SET account_id=?, amount=?, status=?, request_date=?
            WHERE id=?
        `, [account_id, amount, status, request_date, req.params.id]);
        res.redirect('/payouts?success=Payout updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.deletePayout = async (req, res) => {
    try {
        await db.query('DELETE FROM payouts WHERE id = ?', [req.params.id]);
        res.redirect('/payouts?success=Payout record deleted');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
