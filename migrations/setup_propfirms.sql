-- 1. Create prop_firms table
CREATE TABLE IF NOT EXISTS prop_firms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add prop_firm_id column to existing tables
ALTER TABLE account_purchases ADD COLUMN prop_firm_id INT AFTER id;
ALTER TABLE prop_accounts ADD COLUMN prop_firm_id INT AFTER id;

-- 3. Migrate unique names from account_purchases to prop_firms
INSERT IGNORE INTO prop_firms (name) 
SELECT DISTINCT propfirm_name FROM account_purchases;

-- 4. Update account_purchases to link with prop_firms
UPDATE account_purchases ap
JOIN prop_firms pf ON ap.propfirm_name = pf.name
SET ap.prop_firm_id = pf.id;

-- 5. Update prop_accounts to link with prop_firms
UPDATE prop_accounts pa
JOIN prop_firms pf ON pa.propfirm_name = pf.name
SET pa.prop_firm_id = pf.id;

-- Note: We keep propfirm_name for now as a fallback until the app logic is fully updated.
