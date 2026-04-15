const db = require('../config/db');

exports.getCalendar = async (req, res) => {
    try {
        const userId = req.session.userId;
        const now = new Date();
        const month = req.query.month ? parseInt(req.query.month) : now.getMonth() + 1;
        const year = req.query.year ? parseInt(req.query.year) : now.getFullYear();

        // Start and End of the month
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];

        // Fetch daily stats
        const [dailyStats] = await db.query(`
            SELECT 
                date::date as trade_date,
                SUM(pnl) as daily_pnl,
                COUNT(*) as trade_count,
                COUNT(CASE WHEN result = 'win' THEN 1 END) as wins
            FROM trades 
            WHERE user_id = ? AND date BETWEEN ? AND ?
            GROUP BY trade_date
            ORDER BY trade_date ASC
        `, [userId, startDate, endDate]);

        // Overall stats for the selected month
        const totalTrades = dailyStats.reduce((sum, d) => sum + Number(d.trade_count), 0);
        const totalPnL = dailyStats.reduce((sum, d) => sum + Number(d.daily_pnl), 0);
        const totalWins = dailyStats.reduce((sum, d) => sum + Number(d.wins), 0);
        const winRate = totalTrades > 0 ? ((totalWins / totalTrades) * 100).toFixed(2) : 0;
        
        const bestDay = dailyStats.length > 0 ? Math.max(...dailyStats.map(d => Number(d.daily_pnl))) : 0;
        const worstDay = dailyStats.length > 0 ? Math.min(...dailyStats.map(d => Number(d.daily_pnl))) : 0;

        // Map stats to date for easy lookup in EJS
        const statsMap = {};
        dailyStats.forEach(d => {
            const dateStr = new Date(d.trade_date).toISOString().split('T')[0];
            statsMap[dateStr] = {
                pnl: Number(d.daily_pnl),
                count: d.trade_count
            };
        });

        res.render('calendar', {
            month,
            year,
            totalTrades,
            totalPnL,
            winRate,
            bestDay,
            worstDay,
            statsMap,
            monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' })
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
