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
    let { prop_firm_id, account_login_id, account_size, account_type, price, purchase_date } = req.body;
    
    // Convert single entries to arrays for uniform processing
    if (!Array.isArray(prop_firm_id)) {
        prop_firm_id = [prop_firm_id];
        account_login_id = [account_login_id];
        account_size = [account_size];
        account_type = [account_type];
        price = [price];
        purchase_date = [purchase_date];
    }

    try {
        for (let i = 0; i < prop_firm_id.length; i++) {
            // 2. Log the purchase
            await db.query(`
                INSERT INTO account_purchases (prop_firm_id, account_login_id, account_size, account_type, price, purchase_date)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [prop_firm_id[i], account_login_id[i], account_size[i] || 0, account_type[i], price[i] || 0, purchase_date[i]]);

            // 3. Automatically create the account in prop_accounts
            await db.query(`
                INSERT INTO prop_accounts (prop_firm_id, account_login_id, account_type, balance, initial_cost, status, total_payout)
                VALUES (?, ?, ?, ?, ?, 'active', 0)
            `, [prop_firm_id[i], account_login_id[i] || null, account_type[i], account_size[i] || 0, price[i] || 0]);
        }

        res.redirect('/purchases?success=Purchases logged and accounts created');
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
