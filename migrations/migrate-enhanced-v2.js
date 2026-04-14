const db = require('../config/db');

async function migrate() {
    try {
        console.log('Starting migration for enhanced prop firm features...');

        // Add phase column to prop_accounts
        try {
            await db.query(`ALTER TABLE prop_accounts ADD COLUMN phase ENUM('P1', 'P2', 'Funded') DEFAULT 'P1' AFTER account_type`);
            console.log('Added phase column.');
        } catch (e) {
            console.log('Phase column might already exist.');
        }

        // Add drawdown columns
        try {
            await db.query(`ALTER TABLE prop_accounts ADD COLUMN daily_drawdown_limit DECIMAL(15, 2) DEFAULT 0`);
            await db.query(`ALTER TABLE prop_accounts ADD COLUMN max_drawdown_limit DECIMAL(15, 2) DEFAULT 0`);
            await db.query(`ALTER TABLE prop_accounts ADD COLUMN current_daily_drawdown DECIMAL(15, 2) DEFAULT 0`);
            await db.query(`ALTER TABLE prop_accounts ADD COLUMN target_profit DECIMAL(15, 2) DEFAULT 0`);
            console.log('Added drawdown and target columns.');
        } catch (e) {
            console.log('Drawdown columns might already exist.');
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
