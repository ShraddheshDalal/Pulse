const express = require('express');
const router = express.Router();
const recoveryController = require('../controllers/recoveryController');

router.get('/summary', recoveryController.getRecoverySummary);
router.post('/:id/simulate', recoveryController.simulateRecovery);
router.post('/:id/execute', recoveryController.executeRecovery);

module.exports = router;
