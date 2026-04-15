const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Multer Storage
const storage = process.env.VERCEL 
    ? multer.memoryStorage() 
    : multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './public/uploads/');
        },
        filename: (req, file, cb) => {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    });

const upload = multer({ storage }).single('screenshot');

exports.getTrades = async (req, res) => {
    try {
        const { pair, result, date } = req.query;
        const userId = req.session.userId;
        let query = `
            SELECT t.*, 
                   pf.name as propfirm_name,
                   ra.broker_name as real_broker_name,
                   ra.account_login_id as real_login_id
            FROM trades t 
            LEFT JOIN prop_accounts a ON t.account_id = a.id 
            LEFT JOIN prop_firms pf ON a.prop_firm_id = pf.id 
            LEFT JOIN real_accounts ra ON t.real_account_id = ra.id
            WHERE t.user_id = ?
        `;
        let params = [userId];

        if (pair) {
            query += ' AND t.pair LIKE ?';
            params.push(`%${pair}%`);
        }
        if (result) {
            query += ' AND t.result = ?';
            params.push(result);
        }
        if (date) {
            query += ' AND t.date = ?';
            params.push(date);
        }

        query += ' ORDER BY t.date DESC';
        const [trades] = await db.query(query, params);
        res.render('trades/index', { trades, filters: { pair, result, date } });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

async function getAllAccounts(userId) {
    const [prop] = await db.query(`
        SELECT a.id, pf.name as propfirm_name, a.account_login_id 
        FROM prop_accounts a 
        LEFT JOIN prop_firms pf ON a.prop_firm_id = pf.id
        WHERE a.user_id = ?
    `, [userId]);
    
    const [real] = await db.query(`
        SELECT id, broker_name, account_login_id 
        FROM real_accounts 
        WHERE user_id = ?
    `, [userId]);

    return [
        ...prop.map(a => ({ id: `prop-${a.id}`, label: `Prop: ${a.propfirm_name} (#${a.account_login_id})` })),
        ...real.map(a => ({ id: `real-${a.id}`, label: `Real: ${a.broker_name} (#${a.account_login_id})` }))
    ];
}

exports.addTradeForm = async (req, res) => {
    const accounts = await getAllAccounts(req.session.userId);
    res.render('trades/add', { accounts });
};

exports.createTrade = (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.send(err);

        const { date, pair, session, setup, result, note, account_id } = req.body;
        const entry_price = req.body.entry_price || null;
        const stop_loss = req.body.stop_loss || null;
        const take_profit = req.body.take_profit || null;
        const risk = req.body.risk || null;
        const pnl = req.body.pnl || null;
        const balance = req.body.balance || null;
        
        let prop_id = null;
        let real_id = null;
        if (account_id && account_id.includes('-')) {
            const [type, id] = account_id.split('-');
            if (type === 'prop') prop_id = id;
            if (type === 'real') real_id = id;
        }

        const screenshot = req.file ? (req.file.filename ? `/uploads/${req.file.filename}` : 'data:image/png;base64,' + req.file.buffer.toString('base64')) : null;

        try {
            await db.query(`
                INSERT INTO trades (date, pair, session, setup, entry_price, stop_loss, take_profit, risk, result, pnl, balance, note, screenshot, account_id, real_account_id, user_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [date, pair, session, setup, entry_price, stop_loss, take_profit, risk, result, pnl, balance, note, screenshot, prop_id, real_id, req.session.userId]);
            res.redirect('/trades?success=Trade logged successfully');
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });
};

exports.editTradeForm = async (req, res) => {
    try {
        const [trades] = await db.query('SELECT * FROM trades WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
        const accounts = await getAllAccounts(req.session.userId);
        if (trades.length === 0) return res.redirect('/trades');
        
        // Prepare account_id for the form
        const trade = trades[0];
        trade.prefixed_account_id = trade.account_id ? `prop-${trade.account_id}` : (trade.real_account_id ? `real-${trade.real_account_id}` : '');

        res.render('trades/edit', { trade, accounts });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updateTrade = (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.send(err);

        const { date, pair, session, setup, result, note, account_id } = req.body;
        const entry_price = req.body.entry_price || null;
        const stop_loss = req.body.stop_loss || null;
        const take_profit = req.body.take_profit || null;
        const risk = req.body.risk || null;
        const pnl = req.body.pnl || null;
        const balance = req.body.balance || null;

        let prop_id = null;
        let real_id = null;
        if (account_id && account_id.includes('-')) {
            const [type, id] = account_id.split('-');
            if (type === 'prop') prop_id = id;
            if (type === 'real') real_id = id;
        }

        let updateQuery = `
            UPDATE trades SET 
            date=?, pair=?, session=?, setup=?, entry_price=?, stop_loss=?, take_profit=?, 
            risk=?, result=?, pnl=?, balance=?, note=?, account_id=?, real_account_id=?
        `;
        let params = [date, pair, session, setup, entry_price, stop_loss, take_profit, risk, result, pnl, balance, note, prop_id, real_id];

        if (req.file) {
            updateQuery += ', screenshot=?';
            params.push(req.file.filename ? `/uploads/${req.file.filename}` : 'data:image/png;base64,' + req.file.buffer.toString('base64'));
        }

        updateQuery += ' WHERE id=? AND user_id=?';
        params.push(req.params.id, req.session.userId);

        try {
            await db.query(updateQuery, params);
            res.redirect('/trades?success=Trade updated successfully');
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });
};

exports.deleteTrade = async (req, res) => {
    try {
        await db.query('DELETE FROM trades WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
        res.redirect('/trades?success=Trade entry deleted');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
