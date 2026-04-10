const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    console.log('Migrating Account Size separation...');

    try {
        // Add account_size column
        try {
            await connection.query(`
                ALTER TABLE prop_accounts 
                ADD COLUMN account_size DECIMAL(15, 2) NOT NULL DEFAULT 0 AFTER account_type;
            `);
            console.log('Added account_size to prop_accounts');
        } catch (err) {
            if (err.code === 'ER_DUP_COLUMN_NAME') console.log('account_size already exists');
            else throw err;
        }

        // Try to migrate data from account_name if it contains $ and numbers
        const [accounts] = await connection.query('SELECT id, account_name FROM prop_accounts');
        for (const acc of accounts) {
            const match = acc.account_name.match(/\$([0-9,.]+)/);
            if (match) {
                const size = parseFloat(match[1].replace(/,/g, ''));
                if (!isNaN(size)) {
                    await connection.query('UPDATE prop_accounts SET account_size = ? WHERE id = ?', [size, acc.id]);
                }
            }
        }
        console.log('Heuristically migrated account sizes from names');
        
        console.log('Migration completed.');
    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        await connection.end();
    }
}

migrate();
