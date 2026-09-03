const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demoController');

router.get('/scenarios', demoController.getScenarios);
router.get('/scenarios/:scenarioId', demoController.getScenario);

module.exports = router;
