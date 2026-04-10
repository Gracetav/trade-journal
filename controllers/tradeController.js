const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Multer Storage
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage }).single('screenshot');

exports.getTrades = async (req, res) => {
    try {
        const { pair, result, date } = req.query;
        let query = 'SELECT t.*, a.account_name FROM trades t LEFT JOIN prop_accounts a ON t.account_id = a.id WHERE 1=1';
        let params = [];

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

exports.addTradeForm = async (req, res) => {
    const [accounts] = await db.query('SELECT id, account_name FROM prop_accounts');
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
        
        const screenshot = req.file ? `/uploads/${req.file.filename}` : null;

        try {
            await db.query(`
                INSERT INTO trades (date, pair, session, setup, entry_price, stop_loss, take_profit, risk, result, pnl, balance, note, screenshot, account_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [date, pair, session, setup, entry_price, stop_loss, take_profit, risk, result, pnl, balance, note, screenshot, account_id || null]);
            res.redirect('/trades?success=Trade logged successfully');
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    });
};

exports.editTradeForm = async (req, res) => {
    try {
        const [trades] = await db.query('SELECT * FROM trades WHERE id = ?', [req.params.id]);
        const [accounts] = await db.query('SELECT id, account_name FROM prop_accounts');
        if (trades.length === 0) return res.redirect('/trades');
        res.render('trades/edit', { trade: trades[0], accounts });
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

        let updateQuery = `
            UPDATE trades SET 
            date=?, pair=?, session=?, setup=?, entry_price=?, stop_loss=?, take_profit=?, 
            risk=?, result=?, pnl=?, balance=?, note=?, account_id=?
        `;
        let params = [date, pair, session, setup, entry_price, stop_loss, take_profit, risk, result, pnl, balance, note, account_id || null];

        if (req.file) {
            updateQuery += ', screenshot=?';
            params.push(`/uploads/${req.file.filename}`);
        }

        updateQuery += ' WHERE id=?';
        params.push(req.params.id);

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
        await db.query('DELETE FROM trades WHERE id = ?', [req.params.id]);
        res.redirect('/trades?success=Trade entry deleted');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
