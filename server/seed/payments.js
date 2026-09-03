const {
  createRng, pick, pickWeighted, randomInt, randomFloat,
  generateId, generateDate, addSeconds, addDays, addMinutes
} = require('./helpers');
const { METHODS, METHOD_WEIGHTS, DEVICES } = require('./customers');

const AMOUNTS = [299, 499, 999, 1499, 2999, 4999, 7499, 12999, 25000, 50000, 85000, 100000];
const AMOUNT_WEIGHTS = [15, 20, 18, 14, 12, 8, 5, 4, 2, 1, 0.5, 0.5];

const FAILURE_REASONS = [
  'insufficient_funds', 'bank_decline', 'network_timeout',
  'issuer_decline', 'limit_exceeded', 'expired_card',
  'technical_error', 'user_cancelled'
];
const FAILURE_WEIGHTS = [20, 18, 15, 15, 8, 7, 10, 7];

const RISK_SIGNALS = [
  { signal: 'new_customer', weight: 15, description: 'First-time customer with no transaction history', severity: 'medium' },
  { signal: 'new_device', weight: 12, description: 'Payment from an unrecognized device', severity: 'medium' },
  { signal: 'amount_anomaly', weight: 20, description: 'Transaction amount significantly higher than average', severity: 'high' },
  { signal: 'velocity_anomaly', weight: 18, description: 'Multiple rapid payment attempts detected', severity: 'high' },
  { signal: 'unusual_behavior', weight: 10, description: 'Unusual browsing or checkout behavior pattern', severity: 'medium' },
  { signal: 'repeated_failures', weight: 14, description: 'Multiple consecutive failed payment attempts', severity: 'high' },
  { signal: 'method_anomaly', weight: 8, description: 'Payment method different from customer preference', severity: 'low' },
  { signal: 'historical_deviation', weight: 10, description: 'Transaction deviates from historical pattern', severity: 'medium' },
  { signal: 'high_value', weight: 16, description: 'High-value transaction requiring additional scrutiny', severity: 'high' },
];

function computeRiskScore(rng, payment, customer) {
  let score = 0;
  const signals = [];

  // New customer: higher risk
  if (customer.totalTransactions <= 2) {
    const w = 12 + rng() * 8;
    score += w;
    signals.push({ ...RISK_SIGNALS[0], weight: Math.round(w) });
  }

  // Amount anomaly: if amount >> average
  if (payment.amount > customer.averageOrderValue * 3) {
    const w = 15 + rng() * 10;
    score += w;
    signals.push({ ...RISK_SIGNALS[2], weight: Math.round(w) });
  }

  // High value
  if (payment.amount >= 50000) {
    const w = 10 + rng() * 12;
    score += w;
    signals.push({ ...RISK_SIGNALS[8], weight: Math.round(w) });
  }

  // New device
  if (rng() < 0.15) {
    const w = 8 + rng() * 8;
    score += w;
    signals.push({ ...RISK_SIGNALS[1], weight: Math.round(w) });
  }

  // Velocity anomaly
  if (rng() < 0.08) {
    const w = 12 + rng() * 10;
    score += w;
    signals.push({ ...RISK_SIGNALS[3], weight: Math.round(w) });
  }

  // Repeated failures
  if (customer.failedTransactions > 5) {
    const w = 8 + rng() * 8;
    score += w;
    signals.push({ ...RISK_SIGNALS[5], weight: Math.round(w) });
  }

  // Method anomaly
  if (payment.method !== customer.preferredMethod && rng() < 0.3) {
    const w = 4 + rng() * 6;
    score += w;
    signals.push({ ...RISK_SIGNALS[6], weight: Math.round(w) });
  }

  return { score: Math.min(100, Math.round(score)), signals };
}

function computeRecoveryProbability(rng, payment, customer, riskScore) {
  if (!payment.failureReason) return 0;

  let base = 50;

  // Method-specific base probabilities
  const methodRecovery = { upi: 76, card: 45, netbanking: 52, wallet: 60 };
  base = methodRecovery[payment.method] || 50;

  // Adjust by failure reason
  const reasonAdjust = {
    insufficient_funds: -15,
    bank_decline: -5,
    network_timeout: 10,
    issuer_decline: 5,
    limit_exceeded: -20,
    expired_card: -25,
    technical_error: 15,
    user_cancelled: -10,
  };
  base += (reasonAdjust[payment.failureReason] || 0);

  // Customer intent boost
  if (customer.successfulTransactions > 5) base += 8;
  if (customer.totalSpend > 20000) base += 5;

  // Risk penalty
  base -= riskScore * 0.3;

  // Add some deterministic noise
  base += (rng() - 0.5) * 10;

  return Math.max(5, Math.min(95, Math.round(base)));
}

function computeCustomerIntent(rng, customer, payment) {
  let intent = 50;
  if (customer.successfulTransactions > 3) intent += 15;
  if (customer.totalSpend > 10000) intent += 10;
  if (payment.failureReason === 'user_cancelled') intent -= 25;
  if (payment.failureReason === 'network_timeout') intent += 10;
  if (payment.failureReason === 'issuer_decline') intent += 5;
  intent += (rng() - 0.5) * 20;
  return Math.max(10, Math.min(99, Math.round(intent)));
}

function computeHealthScore(riskScore, recoveryProb, customerIntent, legitimacy, settlementConf) {
  return Math.round(
    legitimacy * 0.25 +
    customerIntent * 0.2 +
    recoveryProb * 0.2 +
    settlementConf * 0.15 +
    (100 - riskScore) * 0.2
  );
}

function getRecommendedAction(rng, payment, riskScore, recoveryProb) {
  if (riskScore > 75) return 'block';
  if (riskScore > 50) return 'manual_review';
  if (recoveryProb < 30) return 'retry_later';

  // Pick best action based on method and failure
  if (payment.method === 'card') {
    if (payment.failureReason === 'issuer_decline' || payment.failureReason === 'network_timeout') {
      return 'offer_upi';
    }
    if (payment.failureReason === 'expired_card') return 'send_payment_link';
    return rng() < 0.6 ? 'offer_upi' : 'send_payment_link';
  }
  if (payment.method === 'upi') {
    if (payment.failureReason === 'network_timeout') return 'retry_same_method';
    return rng() < 0.5 ? 'retry_same_method' : 'send_payment_link';
  }
  if (payment.method === 'netbanking') return 'offer_upi';
  return 'send_payment_link';
}

function determineAttentionCategory(status, riskScore, recoveryProb, amount) {
  if (status === 'captured' || status === 'settled' || status === 'reconciled') return 'resolved';
  if (status === 'recovered') return 'resolved';
  if (riskScore > 75) return 'act_now';
  if (status === 'failed' && recoveryProb > 60 && amount > 5000) return 'act_now';
  if (status === 'failed' && recoveryProb > 40) return 'review';
  if (status === 'at_risk' || status === 'review_required') return 'review';
  if (status === 'recovery_in_progress') return 'monitor';
  if (status === 'failed') return 'monitor';
  return null;
}

function generatePaymentsAndRelated(customers, merchantId) {
  const rng = createRng(12345);
  const payments = [];
  const attempts = [];
  const riskAssessments = [];
  const recoveryActions = [];
  const settlements = [];
  const reconciliations = [];
  const auditLogs = [];

  let attemptCounter = 1;
  let recoveryCounter = 1;
  let settlementCounter = 1;
  let reconciliationCounter = 1;
  let auditCounter = 1;

  // Generate 2000 payments
  for (let i = 1; i <= 2000; i++) {
    const customer = customers[Math.floor(rng() * customers.length)];
    const amount = pickWeighted(rng, AMOUNTS, AMOUNT_WEIGHTS);
    const method = pickWeighted(rng, METHODS, METHOD_WEIGHTS);
    const createdAt = generateDate(rng, 30);
    const device = pick(rng, DEVICES);

    // Determine status distribution: ~75% captured, ~25% failed/other
    const statusRoll = rng();
    let status, failureReason = null;

    if (statusRoll < 0.63) {
      status = 'captured';
    } else if (statusRoll < 0.72) {
      status = 'settled';
    } else if (statusRoll < 0.77) {
      status = 'reconciled';
    } else if (statusRoll < 0.82) {
      status = 'failed';
      failureReason = pickWeighted(rng, FAILURE_REASONS, FAILURE_WEIGHTS);
    } else if (statusRoll < 0.86) {
      status = 'recovery_recommended';
      failureReason = pickWeighted(rng, FAILURE_REASONS, FAILURE_WEIGHTS);
    } else if (statusRoll < 0.89) {
      status = 'recovered';
      failureReason = pickWeighted(rng, FAILURE_REASONS, FAILURE_WEIGHTS);
    } else if (statusRoll < 0.92) {
      status = 'at_risk';
      failureReason = pickWeighted(rng, FAILURE_REASONS, FAILURE_WEIGHTS);
    } else if (statusRoll < 0.95) {
      status = 'abandoned';
      failureReason = 'user_cancelled';
    } else if (statusRoll < 0.97) {
      status = 'blocked';
      failureReason = pickWeighted(rng, FAILURE_REASONS, FAILURE_WEIGHTS);
    } else {
      status = 'review_required';
      failureReason = pickWeighted(rng, FAILURE_REASONS, FAILURE_WEIGHTS);
    }

    const paymentId = generateId('PAY', i);
    const orderId = generateId('ORD', i);

    // Compute scores
    const { score: riskScore, signals: riskSignals } = computeRiskScore(rng, { amount, method, failureReason }, customer);
    const recoveryProb = failureReason ? computeRecoveryProbability(rng, { method, failureReason }, customer, riskScore) : 0;
    const customerIntent = computeCustomerIntent(rng, customer, { failureReason });
    const legitimacy = Math.max(20, Math.round(100 - riskScore * 0.8 + (rng() - 0.5) * 10));
    const settlementConf = status === 'failed' ? Math.round(40 + rng() * 30) : Math.round(85 + rng() * 15);
    const healthScore = computeHealthScore(riskScore, recoveryProb || 80, customerIntent, legitimacy, settlementConf);

    // Recommended action
    const recommendedAction = failureReason ? getRecommendedAction(rng, { method, failureReason }, riskScore, recoveryProb) : null;
    const attentionCategory = determineAttentionCategory(status, riskScore, recoveryProb, amount);

    // Priority score for attention queue
    let priorityScore = 0;
    if (failureReason) {
      priorityScore = Math.round(
        (amount / 100000) * 30 +
        recoveryProb * 0.3 +
        (100 / (1 + Math.max(0, (Date.now() - createdAt.getTime()) / 3600000))) * 0.2 +
        (100 - riskScore) * 0.2
      );
    }

    // AI reasoning
    let aiReasoning = null;
    let aiEvidence = [];
    if (recommendedAction) {
      const actionLabels = {
        offer_upi: 'UPI', retry_same_method: 'retry', send_payment_link: 'payment link',
        retry_later: 'delayed retry', manual_review: 'manual review', block: 'block recovery',
        offer_card: 'card'
      };
      const actionLabel = actionLabels[recommendedAction] || recommendedAction;

      if (recommendedAction === 'block') {
        aiReasoning = `Recovery blocked because transaction risk (${riskScore}%) exceeds the merchant's safety threshold. High recovery probability does not mean safe recovery.`;
        aiEvidence = [
          `Risk score: ${riskScore}%`,
          `Recovery probability: ${recoveryProb}% (high, but unsafe)`,
          `Multiple risk signals detected`,
        ];
      } else {
        aiReasoning = `Pulse recommended ${actionLabel} because similar customers recover through this method ${recoveryProb}% of the time after ${failureReason.replace(/_/g, ' ')} failures.`;
        aiEvidence = [
          `Customer has ${customer.successfulTransactions} previous successful payments`,
          `Failure is a ${failureReason.replace(/_/g, ' ')}`,
          `Fraud probability is only ${riskScore}%`,
          `Customer intent score: ${customerIntent}%`,
          `Similar payments recover through ${actionLabel} ${recoveryProb}% of the time`,
        ];
      }
    }

    const payment = {
      paymentId,
      orderId,
      merchantId,
      customerId: customer.customerId,
      amount,
      currency: 'INR',
      method,
      status,
      failureReason,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      description: `Order ${orderId}`,
      riskScore,
      recoveryProbability: recoveryProb,
      healthScore,
      customerIntent,
      legitimacyScore: legitimacy,
      settlementConfidence: settlementConf,
      recommendedAction,
      actualRecoveryAction: status === 'recovered' ? recommendedAction : null,
      outcome: status === 'recovered' ? 'recovered' : (status === 'captured' || status === 'settled' || status === 'reconciled' ? 'captured' : null),
      aiReasoning,
      aiEvidence,
      priorityScore,
      attentionCategory,
      createdAt,
      processedAt: addSeconds(createdAt, randomInt(rng, 1, 5)),
      capturedAt: ['captured', 'settled', 'reconciled', 'recovered'].includes(status) ? addSeconds(createdAt, randomInt(rng, 5, 30)) : null,
      failedAt: failureReason ? addSeconds(createdAt, randomInt(rng, 2, 8)) : null,
      recoveredAt: status === 'recovered' ? addMinutes(createdAt, randomInt(rng, 1, 60)) : null,
      settledAt: ['settled', 'reconciled'].includes(status) ? addDays(createdAt, randomInt(rng, 1, 3)) : null,
      reconciledAt: status === 'reconciled' ? addDays(createdAt, randomInt(rng, 1, 4)) : null,
      deviceType: device,
    };

    payments.push(payment);

    // Generate 1-3 attempts per payment
    const attemptCount = failureReason ? randomInt(rng, 1, 3) : 1;
    for (let a = 0; a < attemptCount; a++) {
      const isLast = a === attemptCount - 1;
      const attemptStatus = isLast
        ? (['captured', 'settled', 'reconciled', 'recovered'].includes(status) ? 'success' : 'failed')
        : 'failed';

      attempts.push({
        attemptId: generateId('ATT', attemptCounter++),
        paymentId,
        merchantId,
        method: a === 0 ? method : (recommendedAction === 'offer_upi' ? 'upi' : method),
        status: attemptStatus,
        failureReason: attemptStatus === 'failed' ? failureReason : null,
        deviceType: device,
        customerIntent,
        riskSignals: a === 0 ? riskSignals : [],
        isRecoveryAttempt: a > 0,
        recoveryMethod: a > 0 ? recommendedAction : null,
        timestamp: addSeconds(createdAt, a * randomInt(rng, 5, 120)),
        duration: randomInt(rng, 500, 5000),
      });
    }

    // Risk assessment for failed/risky payments
    if (failureReason || riskScore > 20) {
      const riskLevel = riskScore <= 20 ? 'low' : riskScore <= 50 ? 'medium' : riskScore <= 75 ? 'high' : 'critical';
      riskAssessments.push({
        paymentId,
        merchantId,
        riskScore,
        riskLevel,
        signals: riskSignals,
        explanation: riskScore > 50
          ? `High risk detected: ${riskSignals.map(s => s.description).join('. ')}`
          : `Low risk. ${riskSignals.length > 0 ? riskSignals.map(s => s.description).join('. ') : 'No significant risk signals.'}`,
        modelVersion: '1.0.0',
        createdAt: addSeconds(createdAt, 3),
      });
    }

    // Recovery actions for failed payments with recovery potential
    if (failureReason && recoveryProb > 20) {
      const actions = ['retry_same_method', 'offer_upi', 'send_payment_link', 'retry_later'];
      if (riskScore > 50) actions.push('manual_review');
      if (riskScore > 75) actions.push('block');

      const methodProbs = {
        retry_same_method: Math.max(10, recoveryProb - 30 + randomInt(rng, -5, 5)),
        offer_upi: Math.min(95, recoveryProb + 10 + randomInt(rng, -5, 10)),
        offer_card: Math.max(15, recoveryProb - 15 + randomInt(rng, -5, 5)),
        send_payment_link: Math.max(20, recoveryProb - 10 + randomInt(rng, -5, 5)),
        retry_later: Math.max(15, recoveryProb - 20 + randomInt(rng, -5, 5)),
        manual_review: Math.max(5, recoveryProb - 40),
        block: 0,
      };

      for (const action of actions) {
        const prob = methodProbs[action] || 0;
        const expectedRev = Math.round(amount * prob / 100);
        const riskPenalty = riskScore * amount * 0.002;
        const friction = action === 'send_payment_link' ? amount * 0.05 : action === 'retry_later' ? amount * 0.03 : amount * 0.01;
        const safeExpectedValue = Math.max(0, Math.round(expectedRev - riskPenalty - friction));

        recoveryActions.push({
          recoveryId: generateId('REC', recoveryCounter++),
          paymentId,
          merchantId,
          action,
          predictedProbability: prob,
          expectedRevenue: expectedRev,
          risk: riskScore,
          estimatedFriction: Math.round(friction),
          safeExpectedValue,
          executed: action === recommendedAction && status === 'recovered',
          executedAt: status === 'recovered' && action === recommendedAction ? addMinutes(createdAt, randomInt(rng, 1, 30)) : null,
          executedBy: status === 'recovered' && action === recommendedAction ? (rng() < 0.4 ? 'autopilot' : 'merchant') : null,
          outcome: status === 'recovered' && action === recommendedAction ? 'success' : null,
          reasoning: action === recommendedAction
            ? `Best safe expected value of ₹${safeExpectedValue.toLocaleString('en-IN')} with ${prob}% probability`
            : null,
          isRecommended: action === recommendedAction,
          timestamp: addSeconds(createdAt, 5),
        });
      }
    }

    // Settlements for captured/settled/reconciled/recovered
    if (['captured', 'settled', 'reconciled', 'recovered'].includes(status)) {
      const feeRate = 0.018 + rng() * 0.004; // 1.8-2.2%
      const fees = Math.round(amount * feeRate);
      const tax = Math.round(fees * 0.18); // 18% GST on fees
      const refundAmt = 0;

      // 10% chance of adjustment for settled/reconciled
      const hasAdjustment = status === 'reconciled' && rng() < 0.15;
      const adjustment = hasAdjustment ? Math.round(100 + rng() * 600) : 0;
      const expectedAmount = amount - fees - tax - refundAmt;
      const actualAmount = status === 'reconciled'
        ? expectedAmount - adjustment
        : (['settled', 'reconciled'].includes(status) ? expectedAmount : null);
      const variance = actualAmount !== null ? expectedAmount - actualAmount : 0;

      const settlementId = generateId('STL', settlementCounter++);
      const settleStatus = status === 'reconciled'
        ? (variance === 0 ? 'reconciled' : 'exception')
        : (status === 'settled' ? 'processed' : 'pending');

      settlements.push({
        settlementId,
        paymentId,
        merchantId,
        capturedAmount: amount,
        fees,
        tax,
        refundAmount: refundAmt,
        adjustments: adjustment,
        expectedAmount,
        actualAmount,
        variance,
        status: settleStatus,
        settledAt: ['settled', 'reconciled'].includes(status) ? addDays(createdAt, randomInt(rng, 1, 3)) : null,
        reconciledAt: status === 'reconciled' ? addDays(createdAt, randomInt(rng, 2, 4)) : null,
      });

      // Reconciliation records for reconciled payments
      if (status === 'reconciled') {
        const varianceType = variance === 0 ? 'none'
          : (adjustment > 0 ? 'settlement_adjustment' : 'fee_adjustment');

        const evidence = [
          { step: 'Payment captured', status: 'match', detail: `₹${amount.toLocaleString('en-IN')} captured correctly` },
          { step: 'Fee calculation', status: 'match', detail: `₹${fees.toLocaleString('en-IN')} fee (${(feeRate * 100).toFixed(1)}%)` },
          { step: 'GST calculation', status: 'match', detail: `₹${tax.toLocaleString('en-IN')} GST (18% on fees)` },
          { step: 'Refund check', status: 'match', detail: 'No refunds processed' },
        ];

        if (adjustment > 0) {
          evidence.push({
            step: 'Settlement adjustment',
            status: 'warning',
            detail: `₹${adjustment.toLocaleString('en-IN')} adjustment detected`,
          });
        } else {
          evidence.push({
            step: 'Settlement amount', status: 'match',
            detail: `₹${expectedAmount.toLocaleString('en-IN')} settled correctly`,
          });
        }

        reconciliations.push({
          reconciliationId: generateId('RECON', reconciliationCounter++),
          settlementId,
          paymentId,
          merchantId,
          expectedAmount,
          actualAmount: actualAmount || expectedAmount,
          variance,
          varianceType,
          status: variance === 0 ? 'matched' : 'exception',
          investigation: variance !== 0 ? {
            likelyCause: adjustment > 0 ? 'Settlement adjustment by payment processor' : 'Fee recalculation',
            confidence: 88 + randomInt(rng, 0, 10),
            evidence,
            recommendation: adjustment > 0 ? 'Review adjustment with Razorpay support' : 'Verify fee structure',
          } : {
            likelyCause: null,
            confidence: 100,
            evidence,
            recommendation: null,
          },
        });
      }
    }

    // Audit logs for AI-actioned payments
    if (status === 'recovered' || status === 'blocked') {
      auditLogs.push({
        auditId: generateId('AUD', auditCounter++),
        merchantId,
        paymentId,
        action: recommendedAction,
        decision: status === 'recovered' ? `Execute ${recommendedAction}` : 'Block recovery',
        reason: aiReasoning,
        riskScore,
        recoveryProbability: recoveryProb,
        executedBy: rng() < 0.4 ? 'autopilot' : 'merchant',
        result: status === 'recovered' ? 'success' : 'blocked',
        userOverride: false,
        modelVersion: '1.0.0',
        timestamp: addSeconds(createdAt, randomInt(rng, 10, 120)),
      });
    }
  }

  // === HERO DEMO PAYMENTS ===
  // Ensure specific demo scenarios exist

  // HERO 1: ₹7,499 Rahul Sharma card failure
  const heroDate1 = new Date();
  heroDate1.setHours(10, 31, 2, 0);
  const heroPayment1 = {
    paymentId: 'PAY48291',
    orderId: 'ORD48291',
    merchantId,
    customerId: 'CUST00001',
    amount: 7499,
    currency: 'INR',
    method: 'card',
    status: 'recovery_recommended',
    failureReason: 'issuer_decline',
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul.sharma@email.com',
    customerPhone: '+919876543001',
    description: 'Order ORD48291',
    riskScore: 4,
    recoveryProbability: 81,
    healthScore: 78,
    customerIntent: 89,
    legitimacyScore: 96,
    settlementConfidence: 98,
    recommendedAction: 'offer_upi',
    actualRecoveryAction: null,
    outcome: null,
    aiReasoning: 'Pulse recommended UPI because similar customers recover through UPI 2.4x more often after issuer decline failures.',
    aiEvidence: [
      'Customer has 8 previous successful UPI payments',
      'Failure is a temporary issuer decline',
      'Fraud probability is only 2%',
      'Customer is still active on the platform',
      'Similar payments recover through UPI 76% of the time',
    ],
    priorityScore: 82,
    attentionCategory: 'act_now',
    createdAt: heroDate1,
    processedAt: addSeconds(heroDate1, 3),
    capturedAt: null,
    failedAt: addSeconds(heroDate1, 5),
    recoveredAt: null,
    settledAt: null,
    reconciledAt: null,
    deviceType: 'mobile',
  };

  // HERO 2: ₹85,000 high-risk payment
  const heroDate2 = new Date();
  heroDate2.setHours(11, 15, 0, 0);
  const heroPayment2 = {
    paymentId: 'PAY48292',
    orderId: 'ORD48292',
    merchantId,
    customerId: 'CUST00042',
    amount: 85000,
    currency: 'INR',
    method: 'card',
    status: 'blocked',
    failureReason: 'bank_decline',
    customerName: 'Unknown Buyer',
    customerEmail: 'buyer42@email.com',
    customerPhone: '+919800000042',
    description: 'Order ORD48292',
    riskScore: 94,
    recoveryProbability: 90,
    healthScore: 22,
    customerIntent: 45,
    legitimacyScore: 18,
    settlementConfidence: 30,
    recommendedAction: 'block',
    actualRecoveryAction: 'block',
    outcome: 'blocked',
    aiReasoning: 'Recovery blocked because transaction risk (94%) exceeds the merchant\'s safety threshold. High recovery probability does not mean safe recovery.',
    aiEvidence: [
      'Risk score: 94% (critical)',
      'New customer with no transaction history',
      'Amount anomaly: significantly higher than average',
      'Payment from unrecognized device',
      'Velocity anomaly: multiple rapid attempts',
      'Recovery probability is 90% but unsafe due to risk',
    ],
    priorityScore: 95,
    attentionCategory: 'act_now',
    createdAt: heroDate2,
    processedAt: addSeconds(heroDate2, 2),
    capturedAt: null,
    failedAt: addSeconds(heroDate2, 4),
    recoveredAt: null,
    settledAt: null,
    reconciledAt: null,
    deviceType: 'desktop',
  };

  // HERO 3: Settlement mismatch ₹9,112 expected vs ₹8,712 actual
  const heroDate3 = new Date();
  heroDate3.setDate(heroDate3.getDate() - 2);
  const heroPayment3 = {
    paymentId: 'PAY48293',
    orderId: 'ORD48293',
    merchantId,
    customerId: 'CUST00015',
    amount: 9500,
    currency: 'INR',
    method: 'upi',
    status: 'reconciled',
    failureReason: null,
    customerName: 'Sneha Patel',
    customerEmail: 'sneha.patel@email.com',
    customerPhone: '+919876543015',
    description: 'Order ORD48293',
    riskScore: 3,
    recoveryProbability: 0,
    healthScore: 92,
    customerIntent: 95,
    legitimacyScore: 98,
    settlementConfidence: 75,
    recommendedAction: null,
    actualRecoveryAction: null,
    outcome: 'captured',
    aiReasoning: null,
    aiEvidence: [],
    priorityScore: 0,
    attentionCategory: 'review',
    createdAt: heroDate3,
    processedAt: addSeconds(heroDate3, 2),
    capturedAt: addSeconds(heroDate3, 8),
    failedAt: null,
    recoveredAt: null,
    settledAt: addDays(heroDate3, 2),
    reconciledAt: addDays(heroDate3, 2),
    deviceType: 'mobile',
  };

  // Add hero payments (replace if existing IDs conflict)
  const heroPayments = [heroPayment1, heroPayment2, heroPayment3];
  for (const hp of heroPayments) {
    const idx = payments.findIndex(p => p.paymentId === hp.paymentId);
    if (idx >= 0) payments[idx] = hp;
    else payments.push(hp);
  }

  // Hero 1 recovery actions
  const hero1RecoveryActions = [
    { action: 'retry_same_method', prob: 31, label: 'Retry card' },
    { action: 'offer_upi', prob: 78, label: 'Offer UPI' },
    { action: 'send_payment_link', prob: 62, label: 'Payment link' },
    { action: 'retry_later', prob: 44, label: 'Retry later' },
  ];
  for (const ra of hero1RecoveryActions) {
    const expectedRev = Math.round(7499 * ra.prob / 100);
    recoveryActions.push({
      recoveryId: generateId('REC', recoveryCounter++),
      paymentId: 'PAY48291',
      merchantId,
      action: ra.action,
      predictedProbability: ra.prob,
      expectedRevenue: expectedRev,
      risk: 4,
      estimatedFriction: Math.round(7499 * 0.01),
      safeExpectedValue: Math.round(expectedRev - 4 * 7499 * 0.002 - 7499 * 0.01),
      executed: false,
      executedAt: null,
      executedBy: null,
      outcome: null,
      reasoning: ra.action === 'offer_upi'
        ? 'Best safe expected value. Similar customers recover through UPI 2.4x more often after issuer decline.'
        : null,
      isRecommended: ra.action === 'offer_upi',
      timestamp: addSeconds(heroDate1, 6),
    });
  }

  // Hero 1 attempts
  attempts.push({
    attemptId: generateId('ATT', attemptCounter++),
    paymentId: 'PAY48291',
    merchantId,
    method: 'card',
    status: 'failed',
    failureReason: 'issuer_decline',
    deviceType: 'mobile',
    customerIntent: 89,
    riskSignals: [],
    isRecoveryAttempt: false,
    recoveryMethod: null,
    timestamp: heroDate1,
    duration: 3200,
  });

  // Hero 1 risk assessment
  riskAssessments.push({
    paymentId: 'PAY48291',
    merchantId,
    riskScore: 4,
    riskLevel: 'low',
    signals: [
      { signal: 'method_anomaly', weight: 4, description: 'Card payment but customer prefers UPI', severity: 'low' },
    ],
    explanation: 'Low risk. Customer has strong payment history. Only minor signal: payment method differs from preference.',
    modelVersion: '1.0.0',
    createdAt: addSeconds(heroDate1, 3),
  });

  // Hero 2 risk assessment
  riskAssessments.push({
    paymentId: 'PAY48292',
    merchantId,
    riskScore: 94,
    riskLevel: 'critical',
    signals: [
      { signal: 'new_customer', weight: 18, description: 'First-time customer with no transaction history', severity: 'high' },
      { signal: 'amount_anomaly', weight: 22, description: 'Transaction amount significantly higher than average', severity: 'critical' },
      { signal: 'new_device', weight: 14, description: 'Payment from an unrecognized device', severity: 'medium' },
      { signal: 'velocity_anomaly', weight: 20, description: 'Multiple rapid payment attempts detected', severity: 'high' },
      { signal: 'high_value', weight: 20, description: 'High-value transaction requiring additional scrutiny', severity: 'high' },
    ],
    explanation: 'Critical risk detected: New customer, extremely high value, unrecognized device, and velocity anomaly.',
    modelVersion: '1.0.0',
    createdAt: addSeconds(heroDate2, 2),
  });

  // Hero 2 audit log
  auditLogs.push({
    auditId: generateId('AUD', auditCounter++),
    merchantId,
    paymentId: 'PAY48292',
    action: 'block',
    decision: 'Block recovery',
    reason: 'Recovery blocked because transaction risk (94%) exceeds the merchant\'s safety threshold.',
    riskScore: 94,
    recoveryProbability: 90,
    executedBy: 'system',
    result: 'blocked',
    userOverride: false,
    modelVersion: '1.0.0',
    timestamp: addSeconds(heroDate2, 5),
  });

  // Hero 3 settlement
  const hero3Settlement = {
    settlementId: 'STL48293',
    paymentId: 'PAY48293',
    merchantId,
    capturedAmount: 9500,
    fees: 190,
    tax: 34,
    refundAmount: 0,
    adjustments: 400,
    expectedAmount: 9112, // 9500 - 190 - 34 - 0 - (but 164 is for base calc, adjustment is 400 from actual)
    actualAmount: 8712, // 9112 - 400
    variance: 400,
    status: 'exception',
    settledAt: addDays(heroDate3, 2),
    reconciledAt: addDays(heroDate3, 2),
  };
  settlements.push(hero3Settlement);

  // Hero 3 reconciliation
  reconciliations.push({
    reconciliationId: 'RECON48293',
    settlementId: 'STL48293',
    paymentId: 'PAY48293',
    merchantId,
    expectedAmount: 9112,
    actualAmount: 8712,
    variance: 400,
    varianceType: 'settlement_adjustment',
    status: 'exception',
    investigation: {
      likelyCause: 'Settlement adjustment by payment processor',
      confidence: 92,
      evidence: [
        { step: 'Payment captured', status: 'match', detail: '₹9,500 captured correctly' },
        { step: 'Fee calculation', status: 'match', detail: '₹190 fee (2.0%)' },
        { step: 'GST calculation', status: 'match', detail: '₹34 GST (18% on fees)' },
        { step: 'Refund check', status: 'match', detail: 'No refunds processed' },
        { step: 'Settlement adjustment', status: 'warning', detail: '₹400 adjustment detected' },
      ],
      recommendation: 'Review adjustment with Razorpay support',
    },
  });

  return { payments, attempts, riskAssessments, recoveryActions, settlements, reconciliations, auditLogs };
}

module.exports = { generatePaymentsAndRelated };
