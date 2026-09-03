const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');

router.post('/command', voiceController.handleVoiceCommand);

module.exports = router;
