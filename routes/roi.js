const express = require('express');
const router = express.Router();
const roiController = require('../controllers/roiController');

router.get('/', roiController.getROI);

module.exports = router;
