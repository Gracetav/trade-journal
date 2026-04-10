const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Use /tmp for Vercel, ./public/uploads/ for local
        const dest = process.env.VERCEL ? '/tmp' : './public/uploads/';
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        cb(null, 'payout-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage }).single('certificate');

exports.getPayouts = async (req, res) => {
    try {
        const [payouts] = await db.query(`
            SELECT p.*, pf.name as propfirm_name, a.account_login_id
            FROM payouts p 
            JOIN prop_accounts a ON p.account_id = a.id 
            LEFT JOIN prop_firms pf ON a.prop_firm_id = pf.id
            ORDER BY p.request_date DESC
        `);
        res.render('payouts/index', { payouts });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.addPayoutForm = async (req, res) => {
    const [accounts] = await db.query(`
        SELECT a.id, pf.name as propfirm_name, a.account_login_id 
        FROM prop_accounts a 
        LEFT JOIN prop_firms pf ON a.prop_firm_id = pf.id
    `);
    res.render('payouts/add', { accounts });
};

exports.createPayout = (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.send(err);
        const { account_id, status, request_date } = req.body;
        const amount = req.body.amount || 0;
        const account_balance = req.body.account_balance || null;
        const certificate = req.file ? `/uploads/${req.file.filename}` : null;

        try {
            await db.query(`
                INSERT INTO payouts (account_id, amount, account_balance, status, request_date, certificate)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [account_id, amount, account_balance, status, request_date, certificate]);
            res.redirect('/payouts?success=Payout request saved');
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });
};

exports.editPayoutForm = async (req, res) => {
    try {
        const [payouts] = await db.query('SELECT * FROM payouts WHERE id = ?', [req.params.id]);
        const [accounts] = await db.query(`
            SELECT a.id, pf.name as propfirm_name, a.account_login_id 
            FROM prop_accounts a 
            LEFT JOIN prop_firms pf ON a.prop_firm_id = pf.id
        `);
        if (payouts.length === 0) return res.redirect('/payouts');
        res.render('payouts/edit', { payout: payouts[0], accounts });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updatePayout = (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.send(err);
        const { account_id, status, request_date } = req.body;
        const amount = req.body.amount || 0;
        const account_balance = req.body.account_balance || null;

        let query = 'UPDATE payouts SET account_id=?, amount=?, account_balance=?, status=?, request_date=?';
        let params = [account_id, amount, account_balance, status, request_date];

        if (req.file) {
            query += ', certificate=?';
            params.push(`/uploads/${req.file.filename}`);
        }

        query += ' WHERE id=?';
        params.push(req.params.id);

        try {
            await db.query(query, params);
            res.redirect('/payouts?success=Payout updated successfully');
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });
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
