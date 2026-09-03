const express = require('express');
const router = express.Router();
const riskController = require('../controllers/riskController');

router.get('/summary', riskController.getRiskSummary);
router.get('/details', riskController.getRiskDetails);

module.exports = router;
