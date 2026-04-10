const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    console.log('Migrating database to full relational structure...');

    // 1. Ensure prop_firms table exists
    await connection.query(`
        CREATE TABLE IF NOT EXISTS prop_firms (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            website VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 2. Add prop_firm_id to account_purchases if not exists
    try {
        await connection.query('ALTER TABLE account_purchases ADD COLUMN prop_firm_id INT AFTER id');
        console.log('Added prop_firm_id to account_purchases');
    } catch (e) {
        console.log('prop_firm_id already exists in account_purchases or error occurred');
    }

    // 3. Add prop_firm_id to prop_accounts if not exists
    try {
        await connection.query('ALTER TABLE prop_accounts ADD COLUMN prop_firm_id INT AFTER id');
        console.log('Added prop_firm_id to prop_accounts');
    } catch (e) {
        console.log('prop_firm_id already exists in prop_accounts or error occurred');
    }

    // 4. Migrate data to prop_firms table if propfirm_name exists and has data
    try {
        await connection.query(`
            INSERT IGNORE INTO prop_firms (name) 
            SELECT DISTINCT propfirm_name FROM account_purchases WHERE propfirm_name IS NOT NULL
        `);
        await connection.query(`
            INSERT IGNORE INTO prop_firms (name) 
            SELECT DISTINCT propfirm_name FROM prop_accounts WHERE propfirm_name IS NOT NULL
        `);
        
        // Update links
        await connection.query(`
            UPDATE account_purchases ap
            JOIN prop_firms pf ON ap.propfirm_name = pf.name
            SET ap.prop_firm_id = pf.id
            WHERE ap.prop_firm_id IS NULL
        `);
        await connection.query(`
            UPDATE prop_accounts pa
            JOIN prop_firms pf ON pa.propfirm_name = pf.name
            SET pa.prop_firm_id = pf.id
            WHERE pa.prop_firm_id IS NULL
        `);
        console.log('Data migrated to relational structure');
    } catch (e) {
        console.log('Error during data migration (might be because columns already dropped):', e.message);
    }

    // 5. THE FIX: Make propfirm_name NULLABLE or DROP it
    // To solve the "no default value" error, we must make them nullable
    try {
        await connection.query('ALTER TABLE account_purchases MODIFY COLUMN propfirm_name VARCHAR(100) NULL');
        await connection.query('ALTER TABLE prop_accounts MODIFY COLUMN propfirm_name VARCHAR(100) NULL');
        console.log('Made propfirm_name columns NULLABLE to fix INSERT errors');
    } catch (e) {
        console.log('Error modifying columns:', e.message);
    }

    console.log('Migration completed successfully.');
    await connection.end();
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
