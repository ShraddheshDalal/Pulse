const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

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
  console.log('🌱 Starting PULSE seed...\n');

  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Cannot seed without MongoDB connection.');
    process.exit(1);
  }

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
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

  // Generate merchant
  const merchantData = generateMerchant();
  const merchant = await Merchant.create(merchantData);
  console.log(`✅ Merchant: ${merchant.businessName}`);

  // Generate customers
  const customersData = generateCustomers(500, merchant.merchantId);
  await Customer.insertMany(customersData);
  console.log(`✅ Customers: ${customersData.length}`);

  // Generate payments and all related data
  const {
    payments, attempts, riskAssessments,
    recoveryActions, settlements, reconciliations, auditLogs
  } = generatePaymentsAndRelated(customersData, merchant.merchantId);

  await Payment.insertMany(payments);
  console.log(`✅ Payments: ${payments.length}`);

  await PaymentAttempt.insertMany(attempts);
  console.log(`✅ Payment Attempts: ${attempts.length}`);

  await RiskAssessment.insertMany(riskAssessments);
  console.log(`✅ Risk Assessments: ${riskAssessments.length}`);

  await RecoveryAction.insertMany(recoveryActions);
  console.log(`✅ Recovery Actions: ${recoveryActions.length}`);

  await Settlement.insertMany(settlements);
  console.log(`✅ Settlements: ${settlements.length}`);

  await Reconciliation.insertMany(reconciliations);
  console.log(`✅ Reconciliations: ${reconciliations.length}`);

  await AuditLog.insertMany(auditLogs);
  console.log(`✅ Audit Logs: ${auditLogs.length}`);

  // Generate insights
  const insightsData = generateInsights(merchant.merchantId);
  await AIInsight.insertMany(insightsData);
  console.log(`✅ AI Insights: ${insightsData.length}`);

  // Generate playbook
  const playbookData = generatePlaybook(merchant.merchantId);
  await MerchantPlaybook.insertMany(playbookData);
  console.log(`✅ Merchant Playbook: ${playbookData.length}`);

  // Summary
  const failedCount = payments.filter(p => ['failed', 'recovery_recommended', 'at_risk', 'abandoned', 'blocked', 'review_required'].includes(p.status)).length;
  const recoveredCount = payments.filter(p => p.status === 'recovered').length;
  const highRiskCount = payments.filter(p => p.riskScore > 50).length;
  const exceptionCount = reconciliations.filter(r => r.status === 'exception').length;

  console.log('\n📊 Seed Summary:');
  console.log(`   Total payments: ${payments.length}`);
  console.log(`   Failed/At-risk: ${failedCount}`);
  console.log(`   Recovered: ${recoveredCount}`);
  console.log(`   High-risk: ${highRiskCount}`);
  console.log(`   Settlement exceptions: ${exceptionCount}`);
  console.log(`   Payment attempts: ${attempts.length}`);
  console.log('\n✨ Seed complete!\n');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
