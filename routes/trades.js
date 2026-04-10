const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/tradeController');

router.get('/', tradeController.getTrades);
router.get('/add', tradeController.addTradeForm);
router.post('/', tradeController.createTrade);
router.get('/:id/edit', tradeController.editTradeForm);
router.put('/:id', tradeController.updateTrade);
router.delete('/:id', tradeController.deleteTrade);

module.exports = router;
