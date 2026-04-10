const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');

router.get('/', purchaseController.getPurchases);
router.get('/add', purchaseController.addPurchaseForm);
router.post('/', purchaseController.createPurchase);
router.get('/:id/edit', purchaseController.editPurchaseForm);
router.put('/:id', purchaseController.updatePurchase);
router.delete('/:id', purchaseController.deletePurchase);

module.exports = router;
