const db = require('../config/db');

exports.getPurchases = async (req, res) => {
    try {
        const [purchases] = await db.query(`
            SELECT ap.*, pf.name as propfirm_name 
            FROM account_purchases ap
            LEFT JOIN prop_firms pf ON ap.prop_firm_id = pf.id
            ORDER BY ap.purchase_date DESC
        `);
        res.render('purchases/index', { purchases });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.addPurchaseForm = async (req, res) => {
    try {
        const [firms] = await db.query('SELECT * FROM prop_firms ORDER BY name ASC');
        res.render('purchases/add', { firms });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.createPurchase = async (req, res) => {
    const { prop_firm_id, account_login_id, account_size, account_type, price, purchase_date } = req.body;
    try {
        // 1. Get firm name for auto-naming
        const [[firm]] = await db.query('SELECT name FROM prop_firms WHERE id = ?', [prop_firm_id]);
        const firmName = firm ? firm.name : 'Unknown';

        // 2. Log the purchase
        await db.query(`
            INSERT INTO account_purchases (prop_firm_id, account_login_id, account_size, account_type, price, purchase_date)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [prop_firm_id, account_login_id, account_size, account_type, price, purchase_date]);

        // 3. Automatically create the account in prop_accounts
        const accountName = `${firmName} ${account_type.toUpperCase()}`;
        await db.query(`
            INSERT INTO prop_accounts (account_name, prop_firm_id, account_login_id, account_type, account_size, balance, initial_cost, status, total_payout)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 0)
        `, [accountName, prop_firm_id, account_login_id, account_type, account_size, account_size, price]);

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
        const [firms] = await db.query('SELECT * FROM prop_firms ORDER BY name ASC');
        res.render('purchases/edit', { purchase: purchases[0], firms });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updatePurchase = async (req, res) => {
    const { prop_firm_id, account_login_id, account_size, account_type, price, purchase_date } = req.body;
    try {
        await db.query(`
            UPDATE account_purchases SET prop_firm_id=?, account_login_id=?, account_size=?, account_type=?, price=?, purchase_date=?
            WHERE id=?
        `, [prop_firm_id, account_login_id, account_size, account_type, price, purchase_date, req.params.id]);
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
