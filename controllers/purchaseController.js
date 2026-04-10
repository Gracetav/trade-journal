const db = require('../config/db');

exports.getPurchases = async (req, res) => {
    try {
        const [purchases] = await db.query('SELECT * FROM account_purchases ORDER BY purchase_date DESC');
        res.render('purchases/index', { purchases });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.addPurchaseForm = (req, res) => {
    res.render('purchases/add');
};

exports.createPurchase = async (req, res) => {
    const { propfirm_name, account_size, account_type, price, purchase_date } = req.body;
    try {
        // 1. Log the purchase
        await db.query(`
            INSERT INTO account_purchases (propfirm_name, account_size, account_type, price, purchase_date)
            VALUES (?, ?, ?, ?, ?)
        `, [propfirm_name, account_size, account_type, price, purchase_date]);

        // 2. Automatically create the account in prop_accounts
        const accountName = `${propfirm_name} $${Number(account_size).toLocaleString()}`;
        await db.query(`
            INSERT INTO prop_accounts (account_name, propfirm_name, account_type, balance, initial_cost, status, total_payout)
            VALUES (?, ?, ?, ?, ?, 'challenge', 0)
        `, [accountName, propfirm_name, account_type, account_size, price]);

        res.redirect('/purchases?success=Purchase logged and account created');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.editPurchaseForm = async (req, res) => {
    try {
        const [purchases] = await db.query('SELECT * FROM account_purchases WHERE id = ?', [req.params.id]);
        if (purchases.length === 0) return res.redirect('/purchases');
        res.render('purchases/edit', { purchase: purchases[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updatePurchase = async (req, res) => {
    const { propfirm_name, account_size, account_type, price, purchase_date } = req.body;
    try {
        await db.query(`
            UPDATE account_purchases SET propfirm_name=?, account_size=?, account_type=?, price=?, purchase_date=?
            WHERE id=?
        `, [propfirm_name, account_size, account_type, price, purchase_date, req.params.id]);
        res.redirect('/purchases?success=Purchase updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.deletePurchase = async (req, res) => {
    try {
        await db.query('DELETE FROM account_purchases WHERE id = ?', [req.params.id]);
        res.redirect('/purchases?success=Purchase record deleted');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
