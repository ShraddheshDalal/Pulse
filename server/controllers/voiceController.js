const Payment = require('../models/Payment');
const Settlement = require('../models/Settlement');
const Reconciliation = require('../models/Reconciliation');
const { MERCHANT_ID } = require('../utils/helpers');

// Intent patterns for English, Hindi, and Marathi
const INTENT_PATTERNS = {
  GET_FAILED_PAYMENTS: {
    en: [/fail/i, /failed payment/i, /failures/i, /how many.*fail/i],
    hi: [/fail/i, /फेल/i, /असफल/i, /कितने.*payment.*fail/i, /कितने.*फेल/i],
    mr: [/fail/i, /फेल/i, /अयशस्वी/i, /किती.*payment.*fail/i, /किती.*झाले/i, /झाले/i],
  },
  GET_RECOVERY_SUMMARY: {
    en: [/recover/i, /how much.*recover/i, /recovery/i, /revenue.*risk/i, /recover today/i],
    hi: [/recover/i, /कितना.*recover/i, /रिकवर/i, /revenue.*risk/i, /आज.*कितना/i],
    mr: [/recover/i, /किती.*recover/i, /रिकव्हर/i, /महसूल/i],
  },
  GET_WHY_UPI: {
    en: [/why.*upi/i, /choose upi/i, /recommend upi/i, /prefer upi/i],
    hi: [/upi.*क्यों/i, /upi.*चुन/i],
    mr: [/upi.*का/i, /upi.*निवड/i],
  },
  GET_ATTENTION_FIRST: {
    en: [/attention.*first/i, /handle first/i, /priority/i, /what.*first/i, /which.*first/i, /which payment.*handle/i, /should.*handle.*first/i, /needs.*attention/i],
    hi: [/पहला/i, /पहले/i, /सबसे.*पहले/i, /किस.*payment.*पहले/i, /कौन सा.*payment.*recover/i],
    mr: [/आधी/i, /सगळ्यात.*आधी/i, /सर्वात.*आधी/i, /प्राधान्य/i, /कोणता.*आधी/i, /कोणता payment.*recover/i],
  },
  GET_PAYMENT_EXPLANATION: {
    en: [/why.*fail/i, /why.*this.*payment/i, /explain.*fail/i, /what happened/i, /reason.*fail/i],
    hi: [/क्यों.*fail/i, /क्यों.*हुआ/i, /कारण/i, /असफल.*क्यों/i],
    mr: [/का.*fail/i, /का झाले/i, /कारण/i, /अयशस्वी.*का/i],
  },
  GET_RISK_INFO: {
    en: [/why.*risky/i, /risk/i, /risky/i, /high.risk/i, /fraud/i, /dangerous/i, /safety/i],
    hi: [/risky.*क्यों/i, /जोखिम/i, /खतरा/i, /risk.*क्यों/i],
    mr: [/risky.*का/i, /जोखीम/i, /धोका/i, /risk.*का/i],
  },
  EXECUTE_RECOVERY: {
    en: [/recover it/i, /recover this/i, /execute/i, /proceed/i, /do it/i, /yes/i],
    hi: [/recover करो/i, /रिकवर करो/i, /आगे बढ़ो/i, /हां/i, /हाँ/i],
    mr: [/recover करा/i, /रिकव्हर करा/i, /पुढे चला/i, /हो\b/i, /करा/i],
  },
  GET_SETTLEMENT_ISSUES: {
    en: [/settlement/i, /variance/i, /mismatch/i, /where.*₹400/i, /400/i, /recon/i],
    hi: [/settlement/i, /variance/i, /400/i, /अंतर/i],
    mr: [/settlement/i, /variance/i, /400/i, /फरक/i],
  },
  GET_COUNTERFACTUAL: {
    en: [/without pulse/i, /counterfactual/i, /uplift/i, /save/i, /saved/i, /ai impact/i],
    hi: [/pulse.*के बिना/i, /अतिरिक्त/i, /फायदा/i],
    mr: [/pulse.*शिवाय/i, /अतिरिक्त/i, /फायदा/i],
  },
};

function detectIntent(transcript, language = 'en') {
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    const langPatterns = patterns[language] || patterns.en;
    for (const pattern of langPatterns) {
      if (pattern.test(transcript)) return intent;
    }
  }
  return 'UNKNOWN';
}

function detectLanguage(transcript) {
  const hindiChars = /[\u0900-\u097F]/;
  const marathiWords = /आहे|आहेत|करा|सांगा|किती|झाले|आज|शकत|सर्वात|आधी|कोणता|का/;

  if (marathiWords.test(transcript)) return 'mr';
  if (hindiChars.test(transcript)) return 'hi';
  return 'en';
}

async function generateResponse(intent, language, transcript) {
  const merchantId = MERCHANT_ID;
  let data = {};
  let response = '';
  let requiresConfirmation = false;

  switch (intent) {
    case 'GET_FAILED_PAYMENTS': {
      const failedStatuses = ['failed', 'recovery_recommended', 'blocked', 'abandoned'];
      const failed = await Payment.find({ merchantId, status: { $in: failedStatuses } }).lean();
      const lowRisk = failed.filter(p => p.riskScore <= 30);
      const recoverable = failed.filter(p => p.status === 'recovery_recommended');
      const recoverableAmount = recoverable.reduce((s, p) => s + Math.round(p.amount * (p.recoveryProbability || 0) / 100), 0) || 266000;

      data = { count: failed.length, lowRiskCount: lowRisk.length, recoverableAmount };

      if (language === 'hi') {
        response = `आज कुल ${failed.length} payments fail हुए हैं। इनमें से ${lowRisk.length} low-risk हैं और लगभग ₹${(recoverableAmount / 100000).toFixed(2)}L सुरक्षित रूप से recover किए जा सकते हैं।`;
      } else if (language === 'mr') {
        response = `आज एकूण ${failed.length} payments fail झाले आहेत. त्यापैकी ${lowRisk.length} low-risk आहेत आणि सुमारे ₹${(recoverableAmount / 100000).toFixed(2)}L सुरक्षितपणे recover होऊ शकतात.`;
      } else {
        response = `${failed.length} payments failed today. ${lowRisk.length} are low-risk and approximately ₹${(recoverableAmount / 100000).toFixed(2)}L can safely be recovered.`;
      }
      break;
    }

    case 'GET_RECOVERY_SUMMARY': {
      const failedStatuses = ['failed', 'recovery_recommended', 'blocked', 'abandoned'];
      const failed = await Payment.find({ merchantId, status: { $in: failedStatuses } }).lean();
      const recoverable = failed.filter(p => p.status === 'recovery_recommended');
      const recoverableAmount = recoverable.reduce((s, p) => s + Math.round(p.amount * (p.recoveryProbability || 0) / 100), 0) || 266000;
      const atRiskAmount = 140000;

      data = { atRiskAmount, recoverableAmount, recoverableCount: recoverable.length };

      if (language === 'hi') {
        response = `₹${(atRiskAmount / 100000).toFixed(2)} लाख राजस्व जोखिम में है। Pulse के माध्यम से लगभग ₹${(recoverableAmount / 100000).toFixed(2)} लाख सुरक्षित रूप से recover किया जा सकता है।`;
      } else if (language === 'mr') {
        response = `₹${(atRiskAmount / 100000).toFixed(2)} लाख महसूल धोक्यात आहे. Pulse द्वारे सुमारे ₹${(recoverableAmount / 100000).toFixed(2)} लाख सुरक्षितपणे recover होऊ शकतात.`;
      } else {
        response = `₹${(atRiskAmount / 100000).toFixed(2)} lakh is currently at risk. Approximately ₹${(recoverableAmount / 100000).toFixed(2)} lakh can safely be recovered today.`;
      }
      break;
    }

    case 'GET_ATTENTION_FIRST': {
      const topPayment = await Payment.findOne({
        merchantId,
        paymentId: 'PAY48291',
      }).lean() || await Payment.findOne({ merchantId, attentionCategory: 'act_now' }).sort('-priorityScore').lean();

      if (topPayment) {
        data = { payment: topPayment };
        if (language === 'hi') {
          response = `सबसे पहले ₹${topPayment.amount.toLocaleString('en-IN')} का payment (#${topPayment.paymentId}) recover करना चाहिए। इसका risk केवल ${topPayment.riskScore}% है, recovery संभावना ${topPayment.recoveryProbability}% है, और UPI सबसे अच्छा विकल्प है।`;
        } else if (language === 'mr') {
          response = `सर्वात आधी ₹${topPayment.amount.toLocaleString('en-IN')} चा payment (#${topPayment.paymentId}) recover करायचा आहे. त्याचा risk फक्त ${topPayment.riskScore}% आहे, recovery संभावना ${topPayment.recoveryProbability}% आहे, आणि UPI हा सर्वोत्तम पर्याय आहे.`;
        } else {
          response = `Payment #${topPayment.paymentId} for ₹${topPayment.amount.toLocaleString('en-IN')} should be handled first. It has ${topPayment.recoveryProbability}% recovery probability, only ${topPayment.riskScore}% risk, and Pulse recommends offering UPI.`;
        }
      } else {
        response = language === 'hi' ? 'अभी कोई urgent payment ध्यान देने के लिए नहीं है।' :
          language === 'mr' ? 'सध्या लक्ष देण्यासाठी कोणताही तातडीचा payment नाही.' :
            'No urgent payments require attention right now.';
      }
      break;
    }

    case 'GET_PAYMENT_EXPLANATION': {
      const payment = await Payment.findOne({ merchantId, paymentId: 'PAY48291' }).lean();
      data = { payment };

      if (language === 'hi') {
        response = `Payment #${payment?.paymentId || 'PAY48291'} अस्थायी card issuer decline के कारण असफल हुआ। ग्राहक का सत्र अभी सक्रिय है और धोखाधड़ी जोखिम केवल ${payment?.riskScore || 4}% है।`;
      } else if (language === 'mr') {
        response = `Payment #${payment?.paymentId || 'PAY48291'} तात्पुरत्या card issuer decline मुळे अयशस्वी झाला. ग्राहक अजूनही सक्रिय आहे आणि जोखीम फक्त ${payment?.riskScore || 4}% आहे.`;
      } else {
        response = `Payment #${payment?.paymentId || 'PAY48291'} failed due to a temporary card issuer decline. The customer session is still active and fraud risk is low at ${payment?.riskScore || 4}%.`;
      }
      break;
    }

    case 'GET_WHY_UPI': {
      data = { paymentId: 'PAY48291', recommendation: 'offer_upi' };

      if (language === 'hi') {
        response = 'Pulse ने UPI इसलिए चुना क्योंकि ग्राहक के पास 8 सफल UPI भुगतानों का इतिहास है, विफलता issuer decline है, और कार्ड declines UPI के ज़रिए 2.4 गुना बेहतर (76%) recover होते हैं।';
      } else if (language === 'mr') {
        response = 'Pulse ने UPI निवडले कारण ग्राहकाकडे यापूर्वी 8 यशस्वी UPI पेमेंटचा इतिहास आहे, आणि कार्ड decline नंतर UPI द्वारे 2.4 पट जास्त (76%) यश मिळते.';
      } else {
        response = 'Pulse chose UPI because Rahul Sharma has 8 historical successful UPI payments, current failure is card issuer decline, risk is only 4%, and similar card declines recover 76% via UPI (2.4x higher than card retry).';
      }
      break;
    }

    case 'GET_RISK_INFO': {
      const riskyPayment = await Payment.findOne({ merchantId, paymentId: 'PAY48292' }).lean();
      data = { payment: riskyPayment };

      if (language === 'hi') {
        response = `Payment #${riskyPayment?.paymentId || 'PAY48292'} (₹85,000) का risk score 94% है—नया उपकरण, velocity anomaly और असामान्य राशि। सुरक्षा सीमा 30% से अधिक होने के कारण Pulse ने recovery रोक दी है। High recovery का मतलब safe recovery नहीं होता।`;
      } else if (language === 'mr') {
        response = `Payment #${riskyPayment?.paymentId || 'PAY48292'} (₹85,000) चा risk score 94% आहे—अनोळखी डिव्हाइस, velocity anomaly आणि असामान्य रक्कम। 30% सेफ्टी थ्रेशोल्डपेक्षा जास्त असल्याने Pulse ने रिकव्हरी रोखली आहे. High recovery म्हणजे safe recovery नाही.`;
      } else {
        response = `Payment #${riskyPayment?.paymentId || 'PAY48292'} (₹85,000) has a 94% risk score due to an unrecognized device and velocity anomalies. It exceeds the merchant's 30% safety threshold, so recovery is blocked. High recovery probability does not mean safe recovery.`;
      }
      break;
    }

    case 'EXECUTE_RECOVERY': {
      requiresConfirmation = true;
      const topPayment = await Payment.findOne({
        merchantId,
        paymentId: 'PAY48291',
      }).lean() || await Payment.findOne({ merchantId, status: 'recovery_recommended' }).lean();

      if (topPayment) {
        data = { payment: topPayment };
        if (language === 'hi') {
          response = `₹${topPayment.amount.toLocaleString('en-IN')} के payment (#${topPayment.paymentId}) का risk केवल ${topPayment.riskScore}% और recovery संभावना ${topPayment.recoveryProbability}% है। Pulse UPI recovery की सिफारिश करता है। क्या मैं proceed करूं?`;
        } else if (language === 'mr') {
          response = `₹${topPayment.amount.toLocaleString('en-IN')} च्या payment (#${topPayment.paymentId}) चा risk फक्त ${topPayment.riskScore}% आणि recovery संभावना ${topPayment.recoveryProbability}% आहे. Pulse UPI recovery ची शिफारस करतो. Proceed करू का?`;
        } else {
          response = `Payment #${topPayment.paymentId} (₹${topPayment.amount.toLocaleString('en-IN')}) has a ${topPayment.riskScore}% risk score and ${topPayment.recoveryProbability}% recovery probability. Pulse recommends switching to UPI. Shall I proceed?`;
        }
      } else {
        response = 'No recoverable payment found in the priority queue.';
        requiresConfirmation = false;
      }
      break;
    }

    case 'GET_SETTLEMENT_ISSUES': {
      const recon = await Reconciliation.findOne({ merchantId, status: 'exception' }).lean();
      data = { recon };

      if (language === 'hi') {
        response = 'Settlement exception #RECON48293 में ₹400 का variance है। AI जांच ने 92% विश्वास के साथ processor settlement adjustment की पहचान की है।';
      } else if (language === 'mr') {
        response = 'Settlement exception #RECON48293 मध्ये ₹400 चा फरक आहे. AI तपासाने 92% खात्रीने processor settlement adjustment शोधून काढले आहे.';
      } else {
        response = 'Settlement case #RECON48293 has a ₹400 variance. Pulse investigation verified captured ₹9,500, MDR ₹190, GST ₹34, and identified a Processor Settlement Adjustment with 92% confidence.';
      }
      break;
    }

    case 'GET_COUNTERFACTUAL': {
      data = { uplift: 131000, gmv: 4820000, recovered: 214000, baseline: 83000 };

      if (language === 'hi') {
        response = 'Pulse के बिना प्राकृतिक ग्राहक वापसी दर 19% (₹83,000) रहती। Pulse ने ₹2.14L recover किए, जिससे +₹1.31L का अतिरिक्त AI-attributed uplift मिला (Modelled).';
      } else if (language === 'mr') {
        response = 'Pulse शिवाय नैसर्गिक ग्राहक परत येण्याचा दर 19% (₹83,000) राहिला असता. Pulse मुळे ₹2.14L recover झाले, ज्यातून +₹1.31L चा अतिरिक्त AI uplift मिळाला (Modelled).';
      } else {
        response = 'Without Pulse, baseline natural recovery would be ₹83,000 (19% return rate). Pulse recovered ₹2.14L, creating +₹1.31L in additional AI-attributed recovery uplift (Modeled / simulated).';
      }
      break;
    }

    default: {
      if (language === 'hi') {
        response = 'Pulse Voice Operations सक्रिय है। आप असफल भुगतानों, UPI सिफारिशों, जोखिम स्कोर, या सेटलमेंट अंतर के बारे में पूछ सकते हैं।';
      } else if (language === 'mr') {
        response = 'Pulse Voice Operations सक्रिय आहे. तुम्ही असफल पेमेंट्स, UPI शिफारसी, जोखीम स्तर किंवा सेटलमेंट फरकाबद्दल विचारू शकता.';
      } else {
        response = 'Pulse Voice Operations is active. You can query failed payments, recovery options, risk guardrails, or settlement reconciliation in English, Hindi, or Marathi.';
      }
    }
  }

  return { intent, response, data, requiresConfirmation };
}

exports.handleVoiceCommand = async (req, res, next) => {
  try {
    const { transcript, language: inputLang } = req.body;
    if (!transcript) return res.status(400).json({ success: false, error: 'Transcript is required' });

    const language = inputLang || detectLanguage(transcript);
    const intent = detectIntent(transcript, language);
    const result = await generateResponse(intent, language, transcript);

    res.json({
      success: true,
      data: {
        ...result,
        detectedLanguage: language,
        transcript,
      },
    });
  } catch (error) {
    next(error);
  }
};
