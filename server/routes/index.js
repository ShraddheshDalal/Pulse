const express = require('express');
const router = express.Router();

const dashboardRoutes = require('./dashboard');
const paymentRoutes = require('./payments');
const attentionRoutes = require('./attention');
const recoveryRoutes = require('./recovery');
const riskRoutes = require('./risk');
const settlementRoutes = require('./settlements');
const reconciliationRoutes = require('./reconciliation');
const insightsRoutes = require('./insights');
const playbookRoutes = require('./playbook');
const autopilotRoutes = require('./autopilot');
const voiceRoutes = require('./voice');
const auditRoutes = require('./audit');
const demoRoutes = require('./demo');

router.use('/dashboard', dashboardRoutes);
router.use('/payments', paymentRoutes);
router.use('/attention', attentionRoutes);
router.use('/recovery', recoveryRoutes);
router.use('/risk', riskRoutes);
router.use('/settlements', settlementRoutes);
router.use('/reconciliation', reconciliationRoutes);
router.use('/insights', insightsRoutes);
router.use('/playbook', playbookRoutes);
router.use('/autopilot', autopilotRoutes);
router.use('/voice', voiceRoutes);
router.use('/audit-log', auditRoutes);
router.use('/demo', demoRoutes);

module.exports = router;
