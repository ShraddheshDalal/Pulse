const express = require('express');
const router = express.Router();
const attentionController = require('../controllers/attentionController');

router.get('/', attentionController.getAttentionItems);

module.exports = router;
