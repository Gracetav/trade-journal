const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Webhook for MT5 EA
router.post('/webhook', async (req, res) => {
    try {
        const { 
            api_key, 
            account_id, 
            pair, 
            type, 
            volume, 
            entry_price, 
            exit_price, 
            pnl, 
            entry_time, 
            exit_time, 
            comment 
        } = req.body;

        // 1. Validate API Key (Security)
        if (api_key !== process.env.MT5_WEBHOOK_KEY) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // 2. Find matching account for the user
        // We assume account_id is the 'account_login_id' from MT5
        const [accounts] = await db.query(
            'SELECT id, user_id FROM prop_accounts WHERE account_login_id = ?', 
            [account_id]
        );

        if (accounts.length === 0) {
            return res.status(404).json({ error: 'Account not found in journal' });
        }

        const journalAccount = accounts[0];

        // 3. Insert into trades table
        await db.query(`
            INSERT INTO trades (
                date, pair, type, volume, entry_price, exit_price, pnl, 
                entry_time, exit_time, note, account_id, user_id, result
            ) VALUES (
                CURRENT_DATE, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `, [
            pair, 
            type, 
            volume, 
            entry_price, 
            exit_price, 
            pnl, 
            entry_time, 
            exit_time, 
            comment || 'Auto-imported from MT5', 
            journalAccount.id, 
            journalAccount.user_id,
            pnl >= 0 ? 'win' : 'loss'
        ]);

        console.log(`[MT5 Webhook] Success: Trade for account ${account_id} imported.`);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('[MT5 Webhook] Error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
