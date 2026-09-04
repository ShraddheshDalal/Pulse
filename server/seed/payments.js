const {
  createRng, pick, pickWeighted, randomInt, randomFloat,
  generateId, generateDate, addSeconds, addDays, addMinutes
} = require('./helpers');
const { METHODS, METHOD_WEIGHTS, DEVICES } = require('./customers');

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

  // Exact target financial figures:
  // GMV = 48,20,000 (₹48.20L)
  // Captured volume (captured + settled + reconciled + recovered) = 43,70,000 (₹43.70L)
  // Recovered by Pulse = 2,14,000 (₹2.14L)
  // Potentially Recoverable = 2,66,000 (₹2.66L)
  // Revenue at Risk = 1,40,000 (₹1.40L)
  // Failed count = 500 (300 recoverable, 100 high-risk, 100 abandoned)
  // Total payments = 2,000

  // 1. Recoverable Failed Payments (300 items, including PAY48291)
  // Target sum of amounts: 295,000
  // Target sum of Math.round(amount * prob / 100): 266,000
  // PAY48291: amt = 7499, prob = 81 -> exp = Math.round(7499 * 0.81) = 6074
  // Remaining 299: amt sum = 287501, exp sum = 259926
  const recoverableSpecs = [];
  // PAY48291 at index 0
  recoverableSpecs.push({
    paymentId: 'PAY48291',
    amount: 7499,
    recoveryProb: 81,
    riskScore: 4,
    failureReason: 'issuer_decline',
    method: 'card',
    recommendedAction: 'offer_upi',
    isHero1: true,
  });

  let recAmtRem = 287501;
  let recExpRem = 259926;
  const baseAmts = [499, 799, 999, 1299, 1499, 1999, 2499];

  for (let i = 1; i < 300; i++) {
    const isLast = i === 299;
    let amt;
    let prob;

    if (isLast) {
      amt = recAmtRem;
      prob = Math.max(50, Math.min(95, Math.round((recExpRem / amt) * 100)));
    } else {
      const avgLeft = Math.floor(recAmtRem / (300 - i));
      amt = pick(rng, baseAmts);
      if (amt > recAmtRem - (300 - i - 1) * 300) amt = avgLeft;
      if (amt < 300) amt = 300;
      const targetRatio = recAmtRem > 0 ? (recExpRem / recAmtRem) : 0.90;
      prob = Math.max(72, Math.min(95, Math.round(targetRatio * 100) + randomInt(rng, -2, 2)));
    }

    const exp = Math.round(amt * prob / 100);
    recAmtRem -= amt;
    recExpRem -= exp;

    recoverableSpecs.push({
      amount: amt,
      recoveryProb: prob,
      riskScore: randomInt(rng, 4, 18),
      failureReason: pick(rng, ['issuer_decline', 'network_timeout', 'bank_decline']),
      method: pickWeighted(rng, METHODS, METHOD_WEIGHTS),
      recommendedAction: 'offer_upi',
    });
  }

  // 2. High-Risk Payments (100 items, including PAY48292 = 85,000)
  // Target sum of amounts: 140,000 (Revenue at risk)
  // PAY48292: 85,000
  // Remaining 99: sum = 55,000
  const highRiskSpecs = [];
  highRiskSpecs.push({
    paymentId: 'PAY48292',
    amount: 85000,
    riskScore: 94,
    recoveryProb: 90,
    failureReason: 'bank_decline',
    method: 'card',
    recommendedAction: 'block',
    isHero2: true,
  });

  let hrAmtRem = 55000;
  for (let i = 1; i < 100; i++) {
    const isLast = i === 99;
    const amt = isLast ? hrAmtRem : Math.floor(hrAmtRem / (100 - i)) + randomInt(rng, -30, 30);
    hrAmtRem -= amt;

    highRiskSpecs.push({
      amount: amt,
      riskScore: randomInt(rng, 76, 95),
      recoveryProb: randomInt(rng, 50, 85),
      failureReason: pick(rng, ['bank_decline', 'issuer_decline']),
      method: 'card',
      recommendedAction: 'block',
    });
  }

  // 3. Abandoned Checkouts (100 items)
  // Target sum of amounts: 15,000
  const abandonedSpecs = [];
  let abAmtRem = 15000;
  for (let i = 0; i < 100; i++) {
    const isLast = i === 99;
    const amt = isLast ? abAmtRem : Math.floor(abAmtRem / (100 - i)) + randomInt(rng, -10, 10);
    abAmtRem -= amt;

    abandonedSpecs.push({
      amount: amt,
      riskScore: randomInt(rng, 5, 20),
      recoveryProb: randomInt(rng, 60, 75),
      failureReason: 'user_cancelled',
      method: 'upi',
      recommendedAction: 'send_payment_link',
    });
  }

  // 4. Recovered Payments by Pulse (80 items)
  // Target sum of amounts: 214,000 (₹2.14L)
  const recoveredSpecs = [];
  let recovAmtRem = 214000;
  for (let i = 0; i < 80; i++) {
    const isLast = i === 79;
    let amt;
    if (isLast) {
      amt = recovAmtRem;
    } else {
      const avg = Math.floor(recovAmtRem / (80 - i));
      amt = pick(rng, [999, 1499, 1999, 2499, 2999, 3999, 4999]);
      if (amt > recovAmtRem - (80 - i - 1) * 500) amt = avg;
    }
    recovAmtRem -= amt;

    recoveredSpecs.push({
      amount: amt,
      riskScore: randomInt(rng, 3, 15),
      recoveryProb: randomInt(rng, 75, 92),
      failureReason: pick(rng, ['issuer_decline', 'network_timeout']),
      method: 'card',
      recommendedAction: 'offer_upi',
      actualRecoveryAction: 'offer_upi',
      status: 'recovered',
      outcome: 'recovered',
    });
  }

  // 5. Captured / Settled / Reconciled Payments (1,420 items)
  // Target sum of amounts: 43,70,000 - 214,000 = 41,56,000
  // Index 0 in this group will be PAY48293 (amount: 9500)
  const capturedSpecs = [];
  capturedSpecs.push({
    paymentId: 'PAY48293',
    amount: 9500,
    status: 'reconciled',
    method: 'upi',
    riskScore: 3,
    isHero3: true,
  });

  let capAmtRem = 4156000 - 9500; // 4146500 for 1419 items
  const capCount = 1419;

  for (let i = 1; i <= capCount; i++) {
    const isLast = i === capCount;
    let amt;
    if (isLast) {
      amt = capAmtRem;
    } else {
      const avg = Math.floor(capAmtRem / (capCount - i + 1));
      amt = pick(rng, [499, 999, 1499, 1999, 2499, 2999, 3999, 4999, 7499, 9999, 14999]);
      if (amt > capAmtRem - (capCount - i) * 300) amt = avg;
    }
    capAmtRem -= amt;

    const r = rng();
    let status;
    if (r < 0.45) status = 'captured';
    else if (r < 0.80) status = 'settled';
    else status = 'reconciled';

    capturedSpecs.push({
      amount: amt,
      status,
      method: pickWeighted(rng, METHODS, METHOD_WEIGHTS),
      riskScore: randomInt(rng, 1, 12),
    });
  }

  // Combine into single 2,000 payments list:
  // 0..299: 300 recoverable failed
  // 300..399: 100 high-risk
  // 400..499: 100 abandoned
  // 500..579: 80 recovered
  // 580..1999: 1420 captured/settled/reconciled (580 is PAY48293)
  const allSpecs = [
    ...recoverableSpecs.map(s => ({ ...s, status: s.status || 'recovery_recommended', category: 'act_now' })),
    ...highRiskSpecs.map(s => ({ ...s, status: 'blocked', category: 'act_now' })),
    ...abandonedSpecs.map(s => ({ ...s, status: 'abandoned', category: 'review' })),
    ...recoveredSpecs.map(s => ({ ...s, category: 'resolved' })),
    ...capturedSpecs.map(s => ({ ...s, category: 'resolved' })),
  ];

  // Build the 2000 payment objects
  for (let i = 0; i < allSpecs.length; i++) {
    const spec = allSpecs[i];
    const customer = customers[i % customers.length];
    const paymentId = spec.paymentId || generateId('PAY', i + 1);
    const orderId = `ORD${paymentId.replace('PAY', '')}`;
    const amount = spec.amount;
    const status = spec.status;
    const method = spec.method || 'card';
    const failureReason = spec.failureReason || null;
    const riskScore = spec.riskScore || 5;
    const recoveryProb = spec.recoveryProb || 0;
    const recommendedAction = spec.recommendedAction || null;
    const actualRecoveryAction = spec.actualRecoveryAction || (status === 'recovered' ? 'offer_upi' : null);
    const outcome = spec.outcome || (['captured', 'settled', 'reconciled'].includes(status) ? 'captured' : null);

    const createdAt = spec.isHero1 || spec.isHero2 || spec.isHero3
      ? new Date()
      : generateDate(rng, 30);
    const device = pick(rng, DEVICES);

    const customerIntent = failureReason === 'user_cancelled' ? randomInt(rng, 75, 92) : randomInt(rng, 65, 98);
    const legitimacy = Math.max(15, 100 - Math.round(riskScore * 0.9));
    const settlementConf = status === 'blocked' ? 20 : (failureReason ? 45 : 98);
    const healthScore = Math.round(legitimacy * 0.25 + customerIntent * 0.2 + (recoveryProb || 80) * 0.2 + settlementConf * 0.15 + (100 - riskScore) * 0.2);

    let priorityScore = 0;
    if (spec.category === 'act_now') {
      priorityScore = Math.round(75 + (amount / 85000) * 20 + (recoveryProb / 100) * 5);
    } else if (spec.category === 'review') {
      priorityScore = Math.round(40 + (amount / 50000) * 20);
    }

    let customerName = customer.name;
    let customerEmail = customer.email;
    let customerPhone = customer.phone;

    if (spec.isHero1) {
      customerName = 'Rahul Sharma';
      customerEmail = 'rahul.sharma@email.com';
      customerPhone = '+919876543001';
    } else if (spec.isHero2) {
      customerName = 'Unknown Buyer';
      customerEmail = 'buyer42@email.com';
      customerPhone = '+919800000042';
    } else if (spec.isHero3) {
      customerName = 'Sneha Patel';
      customerEmail = 'sneha.patel@email.com';
      customerPhone = '+919876543015';
    }

    let aiReasoning = null;
    let aiEvidence = [];

    if (spec.isHero1) {
      aiReasoning = 'Pulse recommended UPI because similar customers recover through UPI 2.4x more often after issuer decline failures.';
      aiEvidence = [
        'Customer has 8 previous successful UPI payments',
        'Current failure is issuer decline',
        'Customer has low risk (4%)',
        'Customer session is active',
        'Similar merchant card failures recover 76% of the time through UPI (2.4x higher than card retry)',
      ];
    } else if (spec.isHero2) {
      aiReasoning = "High recovery probability does not mean safe recovery. Risk score exceeds merchant safety threshold.";
      aiEvidence = [
        'Risk score: 94% (critical)',
        'Merchant safety threshold: 30%',
        'New customer with no transaction history',
        'Amount anomaly: ₹85,000 significantly higher than store average',
        'Payment from unrecognized device',
        'Velocity anomaly: multiple rapid attempts',
        'Recovery probability is 90% but automatic recovery blocked for safety',
      ];
    } else if (recommendedAction === 'offer_upi') {
      aiReasoning = 'Pulse recommended UPI because similar customers recover through UPI 2.4x more often after issuer decline.';
      aiEvidence = [
        `Customer has ${customer.successfulTransactions} previous successful UPI payments`,
        'Failure is a temporary issuer decline',
        `Fraud probability is only ${riskScore}%`,
        'Customer is still active on the platform',
      ];
    } else if (recommendedAction === 'block') {
      aiReasoning = `Recovery blocked because transaction risk (${riskScore}%) exceeds the merchant's safety threshold. High recovery probability does not mean safe recovery.`;
      aiEvidence = [`Risk score: ${riskScore}%`, 'High recovery probability does not mean safe recovery'];
    } else if (recommendedAction === 'send_payment_link') {
      aiReasoning = 'High customer purchase intent detected on abandoned checkout. Automated WhatsApp payment link recommended.';
      aiEvidence = [`Customer intent score: ${customerIntent}%`, 'Historical link recovery rate: 63%'];
    }

    payments.push({
      paymentId,
      orderId,
      merchantId,
      customerId: customer.customerId,
      amount,
      currency: 'INR',
      method,
      status,
      failureReason,
      customerName,
      customerEmail,
      customerPhone,
      description: `Order ${orderId}`,
      riskScore,
      recoveryProbability: recoveryProb,
      healthScore,
      customerIntent,
      legitimacyScore: legitimacy,
      settlementConfidence: settlementConf,
      recommendedAction,
      actualRecoveryAction,
      outcome,
      aiReasoning,
      aiEvidence,
      priorityScore,
      attentionCategory: spec.category,
      createdAt,
      processedAt: addSeconds(createdAt, randomInt(rng, 1, 4)),
      capturedAt: ['captured', 'settled', 'reconciled', 'recovered'].includes(status) ? addSeconds(createdAt, 10) : null,
      failedAt: failureReason ? addSeconds(createdAt, 4) : null,
      recoveredAt: status === 'recovered' ? addMinutes(createdAt, 15) : null,
      settledAt: ['settled', 'reconciled'].includes(status) ? addDays(createdAt, 2) : null,
      reconciledAt: status === 'reconciled' ? addDays(createdAt, 2) : null,
      deviceType: device,
    });

    // Payment Attempts: Exactly 3,000 attempts total
    // Payments 0..999 get 2 attempts (2,000 attempts)
    // Payments 1000..1999 get 1 attempt (1,000 attempts)
    // Total attempts = 3,000!
    const firstStatus = ['captured', 'settled', 'reconciled'].includes(status) ? 'success' : 'failed';
    attempts.push({
      attemptId: generateId('ATT', attemptCounter++),
      paymentId,
      merchantId,
      method,
      status: firstStatus,
      failureReason: firstStatus === 'failed' ? (failureReason || 'issuer_decline') : null,
      deviceType: device,
      customerIntent,
      riskSignals: riskScore > 50 ? [{ signal: 'amount_anomaly', severity: 'high', description: 'Elevated transaction anomaly' }] : [],
      isRecoveryAttempt: false,
      recoveryMethod: null,
      timestamp: createdAt,
      duration: randomInt(rng, 800, 3200),
    });

    if (i < 1000) {
      const secondStatus = status === 'recovered' ? 'success' : 'failed';
      attempts.push({
        attemptId: generateId('ATT', attemptCounter++),
        paymentId,
        merchantId,
        method: status === 'recovered' ? 'upi' : method,
        status: secondStatus,
        failureReason: secondStatus === 'failed' ? failureReason : null,
        deviceType: device,
        customerIntent,
        riskSignals: [],
        isRecoveryAttempt: true,
        recoveryMethod: recommendedAction || 'offer_upi',
        timestamp: addSeconds(createdAt, randomInt(rng, 20, 60)),
        duration: randomInt(rng, 1200, 4500),
      });
    }

    // Risk Assessment
    if (failureReason || riskScore > 20 || spec.isHero1 || spec.isHero2) {
      const riskLevel = riskScore <= 20 ? 'low' : riskScore <= 50 ? 'medium' : riskScore <= 75 ? 'high' : 'critical';
      riskAssessments.push({
        paymentId,
        merchantId,
        riskScore,
        riskLevel,
        signals: [
          { signal: 'method_anomaly', weight: 8, description: 'Evaluation against customer preference', severity: 'low' },
          ...(riskScore > 50 ? [{ signal: 'amount_anomaly', weight: 25, description: 'High transaction value anomaly', severity: 'high' }] : []),
        ],
        explanation: spec.isHero2
          ? "High recovery probability does not mean safe recovery. Risk score exceeds merchant safety threshold."
          : (riskScore > 50
            ? `High risk score (${riskScore}%). High recovery probability does not justify fraud exposure.`
            : `Low risk score (${riskScore}%). Payment is verified safe for automated recovery.`),
        modelVersion: '1.0.0',
        createdAt: addSeconds(createdAt, 2),
      });
    }

    // Recovery Actions
    if (spec.isHero1) {
      const hero1Options = [
        { action: 'retry_same_method', prob: 31, exp: 2325, isRec: false },
        { action: 'offer_upi', prob: 78, exp: 5847, isRec: true },
        { action: 'send_payment_link', prob: 62, exp: 4649, isRec: false },
        { action: 'retry_later', prob: 44, exp: 3299, isRec: false },
      ];
      for (const opt of hero1Options) {
        recoveryActions.push({
          recoveryId: generateId('REC', recoveryCounter++),
          paymentId,
          merchantId,
          action: opt.action,
          predictedProbability: opt.prob,
          expectedRevenue: opt.exp,
          risk: 4,
          estimatedFriction: Math.round(7499 * 0.01),
          safeExpectedValue: Math.round(opt.exp - 4 * 7499 * 0.002 - 7499 * 0.01),
          executed: false,
          executedAt: null,
          executedBy: null,
          outcome: null,
          reasoning: opt.isRec ? 'Best safe expected value (₹5,847). Similar customers recover through UPI 2.4x more often after issuer decline.' : null,
          isRecommended: opt.isRec,
          timestamp: addSeconds(createdAt, 4),
        });
      }
    } else if (recommendedAction && recoveryProb > 0) {
      const actions = [
        { action: 'retry_same_method', prob: Math.max(15, recoveryProb - 35) },
        { action: 'offer_upi', prob: recoveryProb, isRec: recommendedAction === 'offer_upi' },
        { action: 'send_payment_link', prob: Math.max(20, recoveryProb - 18) },
        { action: 'retry_later', prob: Math.max(20, recoveryProb - 28) },
      ];
      for (const a of actions) {
        const exp = Math.round(amount * a.prob / 100);
        recoveryActions.push({
          recoveryId: generateId('REC', recoveryCounter++),
          paymentId,
          merchantId,
          action: a.action,
          predictedProbability: a.prob,
          expectedRevenue: exp,
          risk: riskScore,
          estimatedFriction: Math.round(amount * 0.01),
          safeExpectedValue: Math.max(0, Math.round(exp - riskScore * amount * 0.002 - amount * 0.01)),
          executed: status === 'recovered' && a.action === 'offer_upi',
          executedAt: status === 'recovered' && a.action === 'offer_upi' ? addMinutes(createdAt, 5) : null,
          executedBy: status === 'recovered' && a.action === 'offer_upi' ? 'autopilot' : null,
          outcome: status === 'recovered' && a.action === 'offer_upi' ? 'success' : null,
          reasoning: a.isRec ? aiReasoning : null,
          isRecommended: !!a.isRec,
          timestamp: addSeconds(createdAt, 4),
        });
      }
    }

    // Audit logs: Push 520+ logs
    if (recommendedAction || status === 'recovered' || spec.isHero1 || spec.isHero2) {
      auditLogs.push({
        auditId: generateId('AUD', auditCounter++),
        merchantId,
        paymentId,
        action: recommendedAction || 'offer_upi',
        decision: spec.isHero2 ? 'Block automatic recovery' : (status === 'recovered' ? 'Executed UPI recovery' : `Recommend ${recommendedAction}`),
        reason: aiReasoning || 'AI policy evaluation based on risk threshold',
        riskScore,
        recoveryProbability: recoveryProb,
        executedBy: status === 'recovered' ? 'autopilot' : (status === 'blocked' ? 'system' : 'merchant'),
        result: status === 'recovered' ? 'success' : (status === 'blocked' ? 'blocked' : 'pending'),
        userOverride: false,
        modelVersion: '1.0.0',
        timestamp: addSeconds(createdAt, randomInt(rng, 5, 60)),
      });
    }
  }

  // Exactly 200 Settlements and 200 Reconciliations
  // Find payment PAY48293
  const hero3Payment = payments.find(p => p.paymentId === 'PAY48293') || payments[580];
  const eligibleSettlementPayments = payments.filter(p => ['captured', 'settled', 'reconciled'].includes(p.status) && p.paymentId !== 'PAY48293');

  // Hero Settlement STL48293 & Recon RECON48293
  settlements.push({
    settlementId: 'STL48293',
    paymentId: 'PAY48293',
    merchantId,
    capturedAmount: 9500,
    fees: 190,
    tax: 34,
    refundAmount: 0,
    adjustments: 400,
    expectedAmount: 9112,
    actualAmount: 8712,
    variance: 400,
    status: 'exception',
    settledAt: addDays(hero3Payment.createdAt, 2),
    reconciledAt: addDays(hero3Payment.createdAt, 2),
    createdAt: hero3Payment.createdAt,
  });

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
      likelyCause: 'Processor Settlement Adjustment',
      confidence: 92,
      evidence: [
        { step: 'Payment captured', status: 'match', detail: '₹9,500 captured correctly' },
        { step: 'Processor MDR fee calculated', status: 'match', detail: '₹190 MDR fee calculated' },
        { step: 'GST calculated', status: 'match', detail: '₹34 GST calculated (18% on fees)' },
        { step: 'Refunds checked', status: 'match', detail: 'No refunds processed' },
        { step: 'Processor adjustment detected', status: 'warning', detail: '₹400 processor adjustment identified' },
      ],
      recommendation: 'Review adjustment with settlement/processor operations.',
    },
    createdAt: addDays(hero3Payment.createdAt, 2),
  });

  // Remaining 199 Settlements and Reconciliations (Matched)
  for (let s = 1; s < 200; s++) {
    const p = eligibleSettlementPayments[s % eligibleSettlementPayments.length];
    const settlementId = generateId('STL', s + 1);
    const feeRate = 0.02;
    const fees = Math.round(p.amount * feeRate);
    const tax = Math.round(fees * 0.18);
    const expectedAmount = p.amount - fees - tax;

    settlements.push({
      settlementId,
      paymentId: p.paymentId,
      merchantId,
      capturedAmount: p.amount,
      fees,
      tax,
      refundAmount: 0,
      adjustments: 0,
      expectedAmount,
      actualAmount: expectedAmount,
      variance: 0,
      status: 'reconciled',
      settledAt: addDays(p.createdAt, 2),
      reconciledAt: addDays(p.createdAt, 2),
      createdAt: p.createdAt,
    });

    reconciliations.push({
      reconciliationId: generateId('RECON', s + 1),
      settlementId,
      paymentId: p.paymentId,
      merchantId,
      expectedAmount,
      actualAmount: expectedAmount,
      variance: 0,
      varianceType: 'none',
      status: 'matched',
      investigation: {
        likelyCause: null,
        confidence: 100,
        evidence: [
          { step: 'Payment captured', status: 'match', detail: `₹${p.amount.toLocaleString('en-IN')} captured correctly` },
          { step: 'MDR fee calculated', status: 'match', detail: `₹${fees.toLocaleString('en-IN')} fee (2%)` },
          { step: 'GST calculated', status: 'match', detail: `₹${tax.toLocaleString('en-IN')} GST (18%)` },
          { step: 'Settlement confirmed', status: 'match', detail: `₹${expectedAmount.toLocaleString('en-IN')} credited to merchant bank account` },
        ],
        recommendation: null,
      },
      createdAt: addDays(p.createdAt, 2),
    });
  }

  return { payments, attempts, riskAssessments, recoveryActions, settlements, reconciliations, auditLogs };
}

module.exports = { generatePaymentsAndRelated };
