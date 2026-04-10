const express = require('express');
const router = express.Router();
const propFirmController = require('../controllers/propFirmController');

router.get('/', propFirmController.getPropFirms);
router.post('/', propFirmController.createPropFirm);
router.put('/:id', propFirmController.updatePropFirm);
router.delete('/:id', propFirmController.deletePropFirm);

module.exports = router;
