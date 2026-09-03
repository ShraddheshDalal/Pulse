const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/', paymentController.getPayments);
router.get('/:id', paymentController.getPaymentById);
router.get('/:id/journey', paymentController.getPaymentJourney);
router.get('/:id/health', paymentController.getPaymentHealth);
router.get('/:id/risk', paymentController.getPaymentRisk);
router.get('/:id/recovery-options', paymentController.getPaymentRecoveryOptions);

module.exports = router;
