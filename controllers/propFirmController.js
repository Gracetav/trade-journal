const db = require('../config/db');

exports.getPropFirms = async (req, res) => {
    try {
        const [firms] = await db.query(`
            SELECT pf.*, COALESCE(SUM(p.amount), 0) as total_payout
            FROM prop_firms pf
            LEFT JOIN prop_accounts pa ON pf.id = pa.prop_firm_id
            LEFT JOIN payouts p ON pa.id = p.account_id AND p.status = 'approved'
            GROUP BY pf.id
            ORDER BY pf.name ASC
        `);
        res.render('prop_firms/index', { firms });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.createPropFirm = async (req, res) => {
    try {
        const { name, website } = req.body;
        await db.query('INSERT INTO prop_firms (name, website) VALUES (?, ?)', [name, website]);
        res.redirect('/propfirms');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updatePropFirm = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, website } = req.body;
        await db.query('UPDATE prop_firms SET name = ?, website = ? WHERE id = ?', [name, website, id]);
        res.redirect('/propfirms');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.deletePropFirm = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM prop_firms WHERE id = ?', [id]);
        res.redirect('/propfirms');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
