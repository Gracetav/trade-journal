const express = require('express');
const router = express.Router();
const payoutController = require('../controllers/payoutController');

router.get('/', payoutController.getPayouts);
router.get('/add', payoutController.addPayoutForm);
router.post('/', payoutController.createPayout);
router.get('/:id/edit', payoutController.editPayoutForm);
router.put('/:id', payoutController.updatePayout);
router.delete('/:id', payoutController.deletePayout);

module.exports = router;
