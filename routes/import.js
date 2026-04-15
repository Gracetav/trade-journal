const express = require('express');
const router = express.Router();
const multer = require('multer');
const importController = require('../controllers/importController');

// Configure Multer for in-memory storage (we parse it immediately)
const upload = multer({ storage: multer.memoryStorage() });

router.get('/import', importController.getImportPage);
router.post('/import', upload.single('report'), importController.handleImport);
router.post('/import/save', importController.saveImportedTrades);

module.exports = router;
