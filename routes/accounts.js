const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.get('/', accountController.getAccounts);
router.get('/add', accountController.addAccountForm);
router.post('/', accountController.createAccount);
router.get('/:id/edit', accountController.editAccountForm);
router.put('/:id', accountController.updateAccount);
router.patch('/:id/status', accountController.updateStatus);
router.delete('/:id', accountController.deleteAccount);

module.exports = router;
