const db = require('../config/db');

exports.getDashboard = async (req, res) => {
    try {
        // Stats
        const [trades] = await db.query('SELECT result, pnl FROM trades');
        const [accounts] = await db.query(`
            SELECT a.*, pf.name as propfirm_name 
            FROM prop_accounts a 
            LEFT JOIN prop_firms pf ON a.prop_firm_id = pf.id
        `);
        const [payouts] = await db.query("SELECT amount FROM payouts WHERE status = 'approved'");
        const [purchases] = await db.query('SELECT price FROM account_purchases');

        const totalPnL = trades.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0);
        const winTrades = trades.filter(t => t.result === 'win').length;
        const winrate = trades.length > 0 ? ((winTrades / trades.length) * 100).toFixed(2) : 0;
        const totalAccounts = accounts.length;
        const fundedAccounts = accounts.filter(a => a.phase === 'Funded').length;
        const evalAccounts = accounts.filter(a => ['P1', 'P2'].includes(a.phase)).length;
        const breachedAccounts = accounts.filter(a => a.status === 'breached').length;
        const activeAccounts = accounts.filter(a => a.status === 'active').length;
        
        const totalPayout = payouts.reduce((sum, p) => sum + Number(p.amount), 0);
        const currentMonthPayout = payouts
            .filter(p => {
                const date = new Date(p.request_date);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            })
            .reduce((sum, p) => sum + Number(p.amount), 0);
        const maxPayout = payouts.length > 0 ? Math.max(...payouts.map(p => Number(p.amount))) : 0;
        const avgPayout = payouts.length > 0 ? (totalPayout / payouts.length).toFixed(0) : 0;

        const totalSpending = purchases.reduce((sum, p) => sum + Number(p.price), 0);
        const netProfit = totalPayout - totalSpending;
        const totalROI = totalSpending > 0 ? ((netProfit / totalSpending) * 100).toFixed(2) : 0;

        // Prop Firm Behavior Insights (Top Payout Firms) - Accurate Sum from Payouts Table
        const [firmStats] = await db.query(`
            SELECT 
                pf.name,
                COUNT(DISTINCT a.id) as total_accounts,
                SUM(CASE WHEN a.status = 'breached' THEN 1 ELSE 0 END) as breached_count,
                COALESCE(MAX(payout_sums.total_amount), 0) as total_payout,
                SUM(a.initial_cost) as total_investment,
                ((COUNT(DISTINCT a.id) - SUM(CASE WHEN a.status = 'breached' THEN 1 ELSE 0 END)) / COUNT(DISTINCT a.id) * 100) as success_rate
            FROM prop_firms pf
            JOIN prop_accounts a ON pf.id = a.prop_firm_id
            LEFT JOIN (
                SELECT a2.prop_firm_id, SUM(p.amount) as total_amount
                FROM payouts p
                JOIN prop_accounts a2 ON p.account_id = a2.id
                WHERE p.status = 'approved'
                GROUP BY a2.prop_firm_id
            ) payout_sums ON pf.id = payout_sums.prop_firm_id
            GROUP BY pf.id, pf.name
            ORDER BY total_payout DESC
        `);

        // History Sections
        const [recentAccounts] = await db.query(`
            SELECT a.*, pf.name as propfirm_name,
            ((a.total_payout - a.initial_cost) / NULLIF(a.initial_cost, 0) * 100) as roi,
            0 as current_profit,
            0 as target_progress
            FROM prop_accounts a 
            LEFT JOIN prop_firms pf ON a.prop_firm_id = pf.id
            ORDER BY a.created_at DESC LIMIT 20
        `);
        
        const [recentPayouts] = await db.query(`
            SELECT p.*, pf.name as propfirm_name, a.account_login_id
            FROM payouts p 
            JOIN prop_accounts a ON p.account_id = a.id 
            LEFT JOIN prop_firms pf ON a.prop_firm_id = pf.id
            ORDER BY p.request_date DESC LIMIT 20
        `);

        // Monthly ROI Analytics (Ordered by date ascending for chart)
        const [monthlyROI] = await db.query(`
            SELECT 
                to_char(month_date, 'FMMonth YYYY') as month_label,
                SUM(payout_amount) as total_payout,
                SUM(purchase_amount) as total_spending
            FROM (
                SELECT to_char(request_date, 'YYYY-MM-01')::date as month_date, amount as payout_amount, 0 as purchase_amount FROM payouts WHERE status = 'approved'
                UNION ALL
                SELECT to_char(purchase_date, 'YYYY-MM-01')::date as month_date, 0 as payout_amount, price as purchase_amount FROM account_purchases
            ) as monthly_data
            GROUP BY month_date
            ORDER BY month_date ASC
            LIMIT 12
        `);

        // Prepare Chart Data (Strictly Increasing Cumulative Payouts)
        const chartData = (monthlyROI || []).map((m, index, arr) => {
            const cumulativePayout = arr.slice(0, index + 1).reduce((sum, item) => sum + Number(item.total_payout), 0);
            return {
                month: m.month_label,
                balance: cumulativePayout
            };
        });

        res.render('index', {
            stats: { 
                totalPnL, 
                winrate, 
                totalAccounts, 
                fundedAccounts,
                evalAccounts,
                breachedAccounts,
                activeAccounts,
                totalPayout, 
                currentMonthPayout,
                maxPayout,
                avgPayout,
                totalSpending, 
                totalROI,
                netProfit
            },
            firmStats,
            monthlyROI,
            chartData,
            recentAccounts,
            recentPayouts
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

