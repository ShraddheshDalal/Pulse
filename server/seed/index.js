const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { connectDB } = require('../config/db');
const Merchant = require('../models/Merchant');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const PaymentAttempt = require('../models/PaymentAttempt');
const RiskAssessment = require('../models/RiskAssessment');
const RecoveryAction = require('../models/RecoveryAction');
const Settlement = require('../models/Settlement');
const Reconciliation = require('../models/Reconciliation');
const AIInsight = require('../models/AIInsight');
const MerchantPlaybook = require('../models/MerchantPlaybook');
const AuditLog = require('../models/AuditLog');

const { generateMerchant } = require('./merchants');
const { generateCustomers } = require('./customers');
const { generatePaymentsAndRelated } = require('./payments');
const { generateInsights, generatePlaybook } = require('./insights');

async function seed() {
  console.log('🌱 Starting deterministic PULSE demo seed...\n');

  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Cannot seed without MongoDB connection. Please ensure MongoDB is running on 127.0.0.1:27017');
    process.exit(1);
  }

  // Clear existing PULSE demo collections
  console.log('🗑️  Clearing existing demo collection data...');
  await Promise.all([
    Merchant.deleteMany({}),
    Customer.deleteMany({}),
    Payment.deleteMany({}),
    PaymentAttempt.deleteMany({}),
    RiskAssessment.deleteMany({}),
    RecoveryAction.deleteMany({}),
    Settlement.deleteMany({}),
    Reconciliation.deleteMany({}),
    AIInsight.deleteMany({}),
    MerchantPlaybook.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  // 1. Generate merchant
  const merchantData = generateMerchant();
  const merchant = await Merchant.create(merchantData);

  // 2. Generate 500 customers
  const customersData = generateCustomers(500, merchant.merchantId);
  await Customer.insertMany(customersData);

  // 3. Generate payments, attempts, risk assessments, recovery actions, settlements, reconciliations, audit logs
  const {
    payments, attempts, riskAssessments,
    recoveryActions, settlements, reconciliations, auditLogs
  } = generatePaymentsAndRelated(customersData, merchant.merchantId);

  await Payment.insertMany(payments);
  await PaymentAttempt.insertMany(attempts);
  await RiskAssessment.insertMany(riskAssessments);
  await RecoveryAction.insertMany(recoveryActions);
  await Settlement.insertMany(settlements);
  await Reconciliation.insertMany(reconciliations);
  await AuditLog.insertMany(auditLogs);

  // 4. Generate AI insights & Playbook rules
  const insightsData = generateInsights(merchant.merchantId);
  await AIInsight.insertMany(insightsData);

  const playbookData = generatePlaybook(merchant.merchantId);
  await MerchantPlaybook.insertMany(playbookData);

  // Aggregated calculations
  const failedCount = payments.filter(p => ['failed', 'recovery_recommended', 'blocked', 'abandoned'].includes(p.status)).length;
  const recoverableCount = payments.filter(p => p.status === 'recovery_recommended').length;
  const highRiskCount = payments.filter(p => p.status === 'blocked' || p.riskScore > 75).length;
  const abandonedCount = payments.filter(p => p.status === 'abandoned').length;

  const totalGMV = payments.reduce((sum, p) => sum + p.amount, 0);
  const capturedPayments = payments.filter(p => ['captured', 'settled', 'reconciled', 'recovered'].includes(p.status));
  const capturedVolume = capturedPayments.reduce((sum, p) => sum + p.amount, 0);
  const recoveredPayments = payments.filter(p => p.status === 'recovered');
  const recoveredVolume = recoveredPayments.reduce((sum, p) => sum + p.amount, 0);
  const recoverablePayments = payments.filter(p => p.status === 'recovery_recommended');
  const recoverableVolume = recoverablePayments.reduce((sum, p) => sum + Math.round(p.amount * (p.recoveryProbability || 0) / 100), 0);
  const highRiskPayments = payments.filter(p => p.status === 'blocked' || p.riskScore > 75);
  const revenueAtRisk = highRiskPayments.reduce((sum, p) => sum + p.amount, 0);

  const formatLakh = (amt) => `₹${(amt / 100000).toFixed(2)}L`;

  console.log('\n====================================');
  console.log('PULSE DEMO DATABASE SEEDED');
  console.log('====================================\n');
  console.log(`Customers: ${customersData.length}`);
  console.log(`Payments: ${payments.length}`);
  console.log(`Attempts: ${attempts.length}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`Recoverable: ${recoverableCount}`);
  console.log(`High Risk: ${highRiskCount}`);
  console.log(`Abandoned: ${abandonedCount}`);
  console.log(`Settlements: ${settlements.length}`);
  console.log(`Reconciliation: ${reconciliations.length}`);
  console.log(`Audit Logs: ${auditLogs.length}+`);
  console.log(`Playbook Rules: ${playbookData.length}`);
  console.log(`Insights: ${insightsData.length}\n`);
  console.log(`Attempted GMV: ${formatLakh(totalGMV)}`);
  console.log(`Captured: ${formatLakh(capturedVolume)}`);
  console.log(`Recoverable: ${formatLakh(recoverableVolume)}`);
  console.log(`Recovered: ${formatLakh(recoveredVolume)}`);
  console.log(`Revenue at Risk: ${formatLakh(revenueAtRisk)}`);
  console.log('\n====================================');
  console.log('SEED COMPLETE');
  console.log('====================================\n');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
