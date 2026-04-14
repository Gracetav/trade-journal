const db = require('../config/db');

async function migrate() {
    try {
        console.log('Updating account status ENUM...');
        await db.query(`
            ALTER TABLE prop_accounts 
            MODIFY COLUMN status ENUM('active', 'passed', 'breached', 'funded') DEFAULT 'active'
        `);
        console.log('Successfully updated status options');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
