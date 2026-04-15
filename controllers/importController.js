const cheerio = require('cheerio');
const db = require('../config/db');

exports.getImportPage = async (req, res) => {
    const [accounts] = await db.query('SELECT id, account_login_id FROM prop_accounts WHERE user_id = ?', [req.session.userId]);
    res.render('import', { results: null, error: null, accounts });
};

exports.handleImport = async (req, res) => {
    try {
        if (!req.file) return res.redirect('/import');

        const fileName = req.file.originalname.toLowerCase();
        let trades = [];

        if (fileName.endsWith('.pdf')) {
            return res.render('import', { 
                results: null, 
                error: 'Format PDF dari MT5 sering berantakan. Tolong gunakan format HTML agar data 100% akurat. (MT5 -> History -> Right Click -> Report -> HTML)',
                accounts: await getAccounts(req)
            });
        }

        if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
            let htmlContent = req.file.buffer.toString('utf8');
            
            // Fix: Detect UTF-16 encoding (MT5 often uses UTF-16LE)
            if (req.file.buffer.length > 2) {
                const bom = req.file.buffer.readUInt16LE(0);
                if (bom === 0xFEFF || bom === 0xFFFE) {
                    const decoder = new TextDecoder(bom === 0xFEFF ? 'utf-16le' : 'utf-16be');
                    htmlContent = decoder.decode(req.file.buffer);
                } else if (htmlContent.includes('\0')) {
                    // MT5 often has null bytes when UTF-16 is read as UTF-8
                    try {
                        htmlContent = new TextDecoder('utf-16le').decode(req.file.buffer);
                    } catch (e) {}
                }
            }

            const $ = cheerio.load(htmlContent);
            
            $('tr').each((i, row) => {
                const cells = $(row).find('td');
                if (cells.length < 8) return;

                const text = $(row).text().toUpperCase();
                
                // Skip header rows and rows that are not trades (like balance/deposit/credit/etc)
                if (text.includes('SYMBOL') || text.includes('BALANCE') || text.includes('DEPOSIT') || 
                    text.includes('CREDIT') || text.includes('WITHDRAWAL') || text.includes('CANCELED')) return;

                if (text.includes('BUY') || text.includes('SELL')) {
                    const type = text.includes('BUY') ? 'BUY' : 'SELL';
                    
                    // Symbol Heuristic: 
                    // Deals: cell 2, Positions: cell 0, Orders: cell 2
                    let pair = $(cells[2]).text().trim();
                    if (!pair || /^[0-9,.\s-]+$/.test(pair) || pair.length > 15) {
                        pair = $(cells[0]).text().trim();
                    }
                    
                    // Volume Heuristic: usually at index 5 (Deals) or 3 (Positions) or 4 (Orders)
                    let volume = 0;
                    for (let idx of [5, 3, 4, 6]) {
                        if (cells[idx]) {
                            const v = parseFloat($(cells[idx]).text().trim().replace(/[^-0-9.]/g, ''));
                            if (!isNaN(v) && v > 0 && v < 1000) {
                                volume = v;
                                break;
                            }
                        }
                    }

                    // Extract Time, SL, TP, Price
                    const timeStr = cells.eq(0).text().trim();
                    const sl = parseFloat(cells.eq(7).text().trim().replace(/[^-0-9.]/g, '')) || 0;
                    const tp = parseFloat(cells.eq(8).text().trim().replace(/[^-0-9.]/g, '')) || 0;
                    const price = parseFloat(cells.eq(6).text().trim().replace(/[^-0-9.]/g, '')) || 0;
                    
                    // Profit Heuristic
                    let pnl = 0;
                    let foundPnl = false;
                    const startIndex = cells.length - 1;
                    const endIndex = Math.max(0, cells.length - 5);
                    
                    for (let j = startIndex; j >= endIndex; j--) {
                        const cellVal = $(cells[j]).text().trim().replace(/\s/g, '').replace(',', '');
                        const num = parseFloat(cellVal);
                        if (!isNaN(num) && cellVal !== '') {
                            if (Math.abs(num) < 1000000) {
                                pnl = num;
                                foundPnl = true;
                                break;
                            }
                        }
                    }

                    if (foundPnl && (pnl !== 0 || text.includes('OUT') || text.includes('INOUT'))) {
                        // Calculate day
                        let dayName = 'N/A';
                        if (timeStr && timeStr !== '') {
                            const dateObj = new Date(timeStr.replace(/\./g, '-'));
                            if (!isNaN(dateObj.getTime())) {
                                dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
                            }
                        }

                        trades.push({
                            pair: pair || 'Unknown',
                            type: type,
                            volume: volume,
                            pnl: pnl,
                            open_time: 'N/A', // Matching required for true open time
                            close_time: timeStr,
                            day: dayName,
                            sl: sl,
                            tp: tp,
                            exit_price: price,
                            result: pnl >= 0 ? 'win' : 'loss'
                        });
                    }
                }
            });
        }

        res.render('import', { 
            results: trades, 
            error: trades.length === 0 ? 'Gagal mendeteksi data trade. Pastikan Anda mengupload file Report HTML murni dari MT5.' : null,
            accounts: await getAccounts(req)
        });
    } catch (err) {
        console.error(err);
        res.render('import', { results: null, error: 'Error: ' + err.message, accounts: await getAccounts(req) });
    }
};

async function getAccounts(req) {
    const [propAccounts] = await db.query('SELECT id, account_login_id FROM prop_accounts WHERE user_id = ?', [req.session.userId]);
    const [realAccounts] = await db.query('SELECT id, account_login_id, broker_name FROM real_accounts WHERE user_id = ?', [req.session.userId]);
    
    return [
        ...propAccounts.map(a => ({ id: `prop-${a.id}`, label: `Prop: #${a.account_login_id}` })),
        ...realAccounts.map(a => ({ id: `real-${a.id}`, label: `Real: ${a.broker_name} (${a.account_login_id})` }))
    ];
}

exports.saveImportedTrades = async (req, res) => {
    try {
        const { trades, account_id } = req.body;
        const userId = req.session.userId;

        if (!account_id || !account_id.includes('-')) {
            return res.status(400).json({ success: false, message: 'Harap pilih akun terlebih dahulu.' });
        }

        const [type, id] = account_id.split('-');
        const accountIdNum = parseInt(id);

        if (!accountIdNum) {
            return res.status(400).json({ success: false, message: 'ID Akun tidak valid!' });
        }

        // Use Promise.all and map to speed up the process
        const insertPromises = trades.map(trade => {
            let tradeDate = new Date();
            if (trade.close_time && trade.close_time !== 'N/A') {
                const d = new Date(trade.close_time.replace(/\./g, '-'));
                if (!isNaN(d.getTime())) tradeDate = d;
            }

            return db.query(`
                INSERT INTO trades (
                    date, pair, type, volume, pnl, result, account_id, real_account_id, user_id, 
                    note, stop_loss, take_profit, exit_price, exit_time
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Imported via MT5 HTML', ?, ?, ?, ?
                )
            `, [
                tradeDate, trade.pair, trade.type, trade.volume, trade.pnl, 
                trade.pnl >= 0 ? 'win' : 'loss',
                type === 'prop' ? accountIdNum : null,
                type === 'real' ? accountIdNum : null,
                userId,
                trade.sl || 0, trade.tp || 0, trade.exit_price || 0, tradeDate
            ]);
        });

        await Promise.all(insertPromises);
        res.json({ success: true, message: `${trades.length} trades berhasil disimpan ke Akun ${type.toUpperCase()}!` });
    } catch (err) {
        console.error('Error during save:', err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};
