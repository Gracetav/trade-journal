const db = require('../config/db');

exports.getROI = async (req, res) => {
    try {
        const [accounts] = await db.query(`
            SELECT pa.*, pf.name as propfirm_name,
            ((pa.total_payout - pa.initial_cost) / pa.initial_cost * 100) as roi 
            FROM prop_accounts pa
            LEFT JOIN prop_firms pf ON pa.prop_firm_id = pf.id
            ORDER BY pa.created_at DESC
        `);

        // Overall stats for the ROI page
        const [purchases] = await db.query('SELECT price FROM account_purchases');
        const [payouts] = await db.query('SELECT amount FROM payouts WHERE status = "approved"');

        const totalInvestment = purchases.reduce((sum, p) => sum + Number(p.price), 0);
        const totalReturns = payouts.reduce((sum, p) => sum + Number(p.amount), 0);
        const netProfit = totalReturns - totalInvestment;
        const overallROI = totalInvestment > 0 ? (netProfit / totalInvestment * 100).toFixed(2) : 0;

        // Grouping Data for Modal Details
        const [rawPurchases] = await db.query(`
            SELECT pf.name as propfirm_name, ap.account_size, ap.price, ap.purchase_date, DATE_FORMAT(ap.purchase_date, '%Y-%m') as month
            FROM account_purchases ap
            LEFT JOIN prop_firms pf ON ap.prop_firm_id = pf.id
            ORDER BY ap.purchase_date ASC
        `);

        const [rawPayouts] = await db.query(`
            SELECT p.amount, p.request_date, pf.name as propfirm_name, a.account_login_id, DATE_FORMAT(p.request_date, '%Y-%m') as month
            FROM payouts p
            JOIN prop_accounts a ON p.account_id = a.id
            LEFT JOIN prop_firms pf ON a.prop_firm_id = pf.id
            WHERE p.status = 'approved'
            ORDER BY p.request_date ASC
        `);

        const monthsMap = {};

        rawPurchases.forEach(p => {
            if (!monthsMap[p.month]) monthsMap[p.month] = { month: p.month, invest: 0, returns: 0, items: { purchases: [], payouts: [] } };
            monthsMap[p.month].invest += Number(p.price);
            monthsMap[p.month].items.purchases.push(p);
        });

        rawPayouts.forEach(p => {
            if (!monthsMap[p.month]) monthsMap[p.month] = { month: p.month, invest: 0, returns: 0, items: { purchases: [], payouts: [] } };
            monthsMap[p.month].returns += Number(p.amount);
            monthsMap[p.month].items.payouts.push(p);
        });

        const monthlyStats = Object.values(monthsMap).sort((a,b) => a.month.localeCompare(b.month)).map(m => ({
            ...m,
            roi: m.invest > 0 ? ((m.returns - m.invest) / m.invest * 100).toFixed(2) : (m.returns > 0 ? 100 : 0)
        }));

        res.render('roi/index', {
            accounts,
            stats: {
                totalInvestment,
                totalReturns,
                netProfit,
                overallROI
            },
            monthlyStats
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
