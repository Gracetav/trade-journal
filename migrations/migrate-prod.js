const { execSync } = require('child_process');
const path = require('path');

const migrationFiles = [
    'init-db.js',
    'migrate-type.js',
    'migrate-status.js',
    'migrate-status-v2.js',
    'migrate-roi.js',
    'migrate-acc-size.js',
    'migrate-purchase-id.js',
    'migrate-enhanced.js',
    'migrate-enhanced-v2.js',
    'migrate-relational-fix.js'
];

async function runMigrations() {
    console.log('--- Starting Master Migration ---');
    
    for (const file of migrationFiles) {
        console.log(`\nRunning: ${file}...`);
        try {
            const output = execSync(`node ${file}`, { stdio: 'inherit' });
            console.log(`Completed: ${file}`);
        } catch (error) {
            console.error(`Error running ${file}:`, error.message);
            // We continue because some scripts might fail if columns already exist (they don't all have checks)
            console.log('Continuing to next migration...');
        }
    }
    
    console.log('\n--- Master Migration Finished ---');
}

runMigrations();
