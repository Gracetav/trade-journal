const fs = require('fs');
const { PDFParse } = require('pdf-parse/node');

async function debugPdf() {
    try {
        const filePath = 'e:/Journal/trade-journal/Trade report-105827433 2026-04-14 15-47.pdf';
        const dataBuffer = fs.readFileSync(filePath);
        
        const parser = new PDFParse();
        const data = await parser.parse(dataBuffer);
        
        console.log('--- RAW PDF TEXT START ---');
        console.log(data.text);
        console.log('--- RAW PDF TEXT END ---');
    } catch (err) {
        console.error('Masih rewel Om:', err.message);
    }
}

debugPdf();
