const db = require('../config/db');

exports.getDashboard = async (req, res) => {
    try {
        // Stats
        const [trades] = await db.query('SELECT result, pnl FROM trades');
        const [accounts] = await db.query('SELECT * FROM prop_accounts');
        const [payouts] = await db.query('SELECT amount FROM payouts WHERE status = "approved"');
        const [purchases] = await db.query('SELECT price FROM account_purchases');

        const totalPnL = trades.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0);
        const winTrades = trades.filter(t => t.result === 'win').length;
        const winrate = trades.length > 0 ? ((winTrades / trades.length) * 100).toFixed(2) : 0;
        const totalAccounts = accounts.length;
        const totalPayout = payouts.reduce((sum, p) => sum + Number(p.amount), 0);
        const totalSpending = purchases.reduce((sum, p) => sum + Number(p.price), 0);
        const totalROI = totalSpending > 0 ? (((totalPayout - totalSpending) / totalSpending) * 100).toFixed(2) : 0;

        // History Sections
        const [recentAccounts] = await db.query('SELECT *, ((total_payout - initial_cost) / initial_cost * 100) as roi FROM prop_accounts ORDER BY created_at DESC LIMIT 20');
        const [recentPayouts] = await db.query(`
            SELECT p.*, a.account_name 
            FROM payouts p 
            JOIN prop_accounts a ON p.account_id = a.id 
            ORDER BY p.request_date DESC LIMIT 20
        `);
        const [recentPurchases] = await db.query('SELECT * FROM account_purchases ORDER BY purchase_date DESC LIMIT 20');

        res.render('index', {
            stats: { totalPnL, winrate, totalAccounts, totalPayout, totalSpending, totalROI },
            recentAccounts,
            recentPayouts,
            recentPurchases
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
