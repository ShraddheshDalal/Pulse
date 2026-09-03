const express = require('express');
const router = express.Router();
const autopilotController = require('../controllers/autopilotController');

router.get('/', autopilotController.getAutopilot);
router.post('/decision', autopilotController.autopilotDecision);
router.put('/', autopilotController.updateAutopilot);

module.exports = router;
