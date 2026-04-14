CREATE TABLE IF NOT EXISTS prop_firms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prop_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prop_firm_id INT,
    account_login_id VARCHAR(100),
    account_type ENUM('instan', '1 step', '2 step', 'mini') DEFAULT '2 step',
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    initial_cost DECIMAL(15, 2) DEFAULT 0,
    target_profit DECIMAL(15, 2) DEFAULT 0,
    status ENUM('active', 'passed', 'funded', 'breached') DEFAULT 'active',
    total_payout DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prop_firm_id) REFERENCES prop_firms(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS trades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    pair VARCHAR(20) NOT NULL,
    session VARCHAR(50),
    setup TEXT,
    entry_price DECIMAL(15, 5),
    stop_loss DECIMAL(15, 5),
    take_profit DECIMAL(15, 5),
    risk DECIMAL(15, 2),
    result ENUM('win', 'loss', 'BE') DEFAULT 'BE',
    pnl DECIMAL(15, 2),
    balance DECIMAL(15, 2),
    note TEXT,
    screenshot VARCHAR(255),
    account_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES prop_accounts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    status ENUM('pending', 'approved', 'denied') DEFAULT 'pending',
    account_balance DECIMAL(15, 2),
    certificate VARCHAR(255),
    request_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES prop_accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account_purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prop_firm_id INT,
    account_login_id VARCHAR(100),
    account_size DECIMAL(15, 2) NOT NULL,
    account_type ENUM('instan', '1 step', '2 step', 'mini') DEFAULT '2 step',
    price DECIMAL(15, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prop_firm_id) REFERENCES prop_firms(id) ON DELETE SET NULL
);
