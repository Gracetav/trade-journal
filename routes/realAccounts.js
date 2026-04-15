const express = require('express');
const router = express.Router();
const realAccountController = require('../controllers/realAccountController');

router.get('/real-accounts', realAccountController.getAccounts);
router.get('/real-accounts/add', realAccountController.addAccountForm);
router.post('/real-accounts', realAccountController.createAccount);
router.get('/real-accounts/edit/:id', realAccountController.editAccountForm);
router.post('/real-accounts/edit/:id', realAccountController.updateAccount);
router.post('/real-accounts/delete/:id', realAccountController.deleteAccount);

module.exports = router;
