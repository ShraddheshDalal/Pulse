const Payment = require('../models/Payment');
const { MERCHANT_ID } = require('../utils/helpers');

// Intent patterns for English, Hindi, and Marathi
const INTENT_PATTERNS = {
  GET_FAILED_PAYMENTS: {
    en: [/fail/i, /failed payment/i, /failures/i],
    hi: [/fail/i, /फेल/i, /असफल/i, /payment fail/i],
    mr: [/fail/i, /फेल/i, /अयशस्वी/i],
  },
  GET_RECOVERY_SUMMARY: {
    en: [/recover/i, /how much.*recover/i, /recovery/i, /revenue.*risk/i],
    hi: [/recover/i, /कितन.*recover/i, /रिकवर/i, /revenue.*risk/i],
    mr: [/recover/i, /किती.*recover/i, /रिकव्हर/i],
  },
  GET_ATTENTION_FIRST: {
    en: [/attention.*first/i, /handle first/i, /priority/i, /what.*first/i, /should.*handle/i, /needs.*attention/i],
    hi: [/पहल/i, /ध्यान/i, /सबसे.*पहल/i, /किस.*payment.*पहले/i],
    mr: [/आधी/i, /सगळ्यात.*आधी/i, /प्राधान्य/i, /कोणत.*आधी/i],
  },
  GET_PAYMENT_EXPLANATION: {
    en: [/why.*fail/i, /why.*this/i, /explain/i, /what happened/i],
    hi: [/क्यों.*fail/i, /क्यों/i, /कारण/i],
    mr: [/का.*fail/i, /का आहे/i, /कारण/i],
  },
  GET_RISK_INFO: {
    en: [/risk/i, /risky/i, /high.risk/i, /dangerous/i],
    hi: [/risk/i, /risky/i, /जोखिम/i],
    mr: [/risk/i, /risky/i, /जोखीम/i],
  },
  EXECUTE_RECOVERY: {
    en: [/recover it/i, /recover this/i, /execute/i, /proceed/i, /do it/i, /recover करा/i],
    hi: [/recover कर/i, /रिकवर कर/i, /करो/i, /हां/i],
    mr: [/recover करा/i, /रिकव्हर करा/i, /करा/i, /हो\b/i],
  },
  GET_SETTLEMENT_ISSUES: {
    en: [/settlement/i, /variance/i, /settlement.*issue/i, /lower/i],
    hi: [/settlement/i, /variance/i, /कम/i],
    mr: [/settlement/i, /variance/i, /किती/i],
  },
  GET_COUNTERFACTUAL: {
    en: [/save/i, /saved/i, /pulse.*recover/i, /how much.*pulse/i, /without pulse/i],
    hi: [/बचा/i, /save/i, /pulse.*recover/i],
    mr: [/वाचव/i, /save/i, /pulse.*recover/i],
  },
  SWITCH_LANGUAGE: {
    en: [/switch.*hindi/i, /हिंदी/i, /switch.*marathi/i, /मराठी/i, /switch.*english/i],
    hi: [/हिंदी.*बताओ/i, /हिंदी/i, /english/i, /मराठी/i],
    mr: [/मराठी/i, /इंग्रजी/i, /हिंदी/i],
  },
  GET_HIGH_VALUE_FAILED: {
    en: [/above.*\d/i, /more than.*\d/i, /greater.*\d/i, /over.*₹/i],
    hi: [/ऊपर/i, /से.*ऊपर/i, /ज्यादा/i],
    mr: [/वर/i, /पेक्षा.*जास्त/i],
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
  const marathiWords = /आहे|आहेत|करा|सांगा|किती|झाले|आज|शकत/;

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
      const failedStatuses = ['failed', 'recovery_recommended', 'at_risk', 'abandoned', 'review_required'];
      const failed = await Payment.find({ merchantId, status: { $in: failedStatuses } }).lean();
      const lowRisk = failed.filter(p => p.riskScore <= 30);
      const recoverableAmount = lowRisk.reduce((s, p) => s + Math.round(p.amount * p.recoveryProbability / 100), 0);

      data = { count: failed.length, lowRiskCount: lowRisk.length, recoverableAmount };

      if (language === 'hi') {
        response = `आज ${failed.length} payments fail हुए हैं। इनमें से ${lowRisk.length} low-risk हैं और लगभग ₹${(recoverableAmount / 1000).toFixed(1)}K recover किए जा सकते हैं।`;
      } else if (language === 'mr') {
        response = `आज ${failed.length} payments fail झाले आहेत. त्यापैकी ${lowRisk.length} low-risk आहेत आणि सुमारे ₹${(recoverableAmount / 1000).toFixed(1)}K recover होऊ शकतात.`;
      } else {
        response = `${failed.length} payments have failed today. ${lowRisk.length} are low-risk and approximately ₹${(recoverableAmount / 1000).toFixed(1)}K can potentially be recovered.`;
      }
      break;
    }

    case 'GET_RECOVERY_SUMMARY': {
      const failedStatuses = ['failed', 'recovery_recommended', 'at_risk', 'abandoned', 'review_required'];
      const failed = await Payment.find({ merchantId, status: { $in: failedStatuses } }).lean();
      const recoverable = failed.filter(p => p.recoveryProbability > 40 && p.riskScore < 75);
      const recoverableAmount = recoverable.reduce((s, p) => s + Math.round(p.amount * p.recoveryProbability / 100), 0);
      const atRiskAmount = failed.reduce((s, p) => s + p.amount, 0);

      data = { atRiskAmount, recoverableAmount, recoverableCount: recoverable.length };

      if (language === 'hi') {
        response = `₹${(atRiskAmount / 100000).toFixed(2)} लाख revenue risk पर है। ₹${(recoverableAmount / 1000).toFixed(1)}K recover किया जा सकता है।`;
      } else if (language === 'mr') {
        response = `₹${(atRiskAmount / 100000).toFixed(2)} लाख revenue risk वर आहे. ₹${(recoverableAmount / 1000).toFixed(1)}K पर्यंत revenue recover होऊ शकतो.`;
      } else {
        response = `₹${(atRiskAmount / 100000).toFixed(2)} lakh is currently at risk. ₹${(recoverableAmount / 1000).toFixed(1)}K is potentially recoverable.`;
      }
      break;
    }

    case 'GET_ATTENTION_FIRST': {
      const topPayment = await Payment.findOne({
        merchantId,
        attentionCategory: 'act_now',
      }).sort('-priorityScore').lean();

      if (topPayment) {
        data = { payment: topPayment };
        if (language === 'hi') {
          response = `₹${topPayment.amount.toLocaleString('en-IN')} का payment सबसे पहले recover करने की शिफारस है। इसका risk ${topPayment.riskScore}% है और recovery probability ${topPayment.recoveryProbability}% है। ${topPayment.recommendedAction === 'offer_upi' ? 'UPI' : topPayment.recommendedAction?.replace(/_/g, ' ')} सबसे अच्छा option है।`;
        } else if (language === 'mr') {
          response = `₹${topPayment.amount.toLocaleString('en-IN')} चा payment सर्वात आधी recover करण्याची शिफारस आहे. त्याचा risk ${topPayment.riskScore}% आहे आणि recovery probability ${topPayment.recoveryProbability}% आहे. ${topPayment.recommendedAction === 'offer_upi' ? 'UPI' : topPayment.recommendedAction?.replace(/_/g, ' ')} हा सर्वोत्तम पर्याय आहे.`;
        } else {
          response = `The highest priority is a ₹${topPayment.amount.toLocaleString('en-IN')} payment with ${topPayment.recoveryProbability}% recovery probability and ${topPayment.riskScore}% risk. ${topPayment.recommendedAction === 'offer_upi' ? 'UPI' : topPayment.recommendedAction?.replace(/_/g, ' ')} is the best recovery option.`;
        }
      } else {
        response = language === 'hi' ? 'अभी कोई urgent payment नहीं है।' :
          language === 'mr' ? 'सध्या कोणताही urgent payment नाही.' :
            'No urgent payments require attention right now.';
      }
      break;
    }

    case 'EXECUTE_RECOVERY': {
      requiresConfirmation = true;
      const topPayment = await Payment.findOne({
        merchantId,
        attentionCategory: 'act_now',
        status: { $in: ['failed', 'recovery_recommended'] },
      }).sort('-priorityScore').lean();

      if (topPayment) {
        data = { payment: topPayment };
        const actionLabel = topPayment.recommendedAction === 'offer_upi' ? 'UPI' : topPayment.recommendedAction?.replace(/_/g, ' ');
        if (language === 'hi') {
          response = `₹${topPayment.amount.toLocaleString('en-IN')} payment का risk score ${topPayment.riskScore}% है और recovery probability ${topPayment.recoveryProbability}% है। Pulse ${actionLabel} recovery recommend करता है। Proceed करूं?`;
        } else if (language === 'mr') {
          response = `₹${topPayment.amount.toLocaleString('en-IN')} payment साठी ${actionLabel} recovery execute करण्यापूर्वी तुमची confirmation आवश्यक आहे. Proceed करू?`;
        } else {
          response = `₹${topPayment.amount.toLocaleString('en-IN')} payment has a ${topPayment.riskScore}% risk score and ${topPayment.recoveryProbability}% recovery probability. Pulse recommends ${actionLabel}. Shall I proceed?`;
        }
      } else {
        response = language === 'hi' ? 'कोई recoverable payment नहीं मिला।' :
          language === 'mr' ? 'कोणताही recoverable payment सापडला नाही.' :
            'No recoverable payment found in the priority queue.';
        requiresConfirmation = false;
      }
      break;
    }

    case 'GET_SETTLEMENT_ISSUES': {
      const Settlement = require('../models/Settlement');
      const exceptions = await Settlement.find({ merchantId, status: 'exception' }).lean();
      const totalVariance = exceptions.reduce((s, e) => s + Math.abs(e.variance), 0);

      data = { exceptionCount: exceptions.length, totalVariance };
      if (language === 'hi') {
        response = `${exceptions.length} settlement exceptions हैं। कुल variance ₹${totalVariance.toLocaleString('en-IN')} है।`;
      } else if (language === 'mr') {
        response = `${exceptions.length} settlement exceptions आहेत. एकूण variance ₹${totalVariance.toLocaleString('en-IN')} आहे.`;
      } else {
        response = `There are ${exceptions.length} settlement exceptions with a total variance of ₹${totalVariance.toLocaleString('en-IN')}.`;
      }
      break;
    }

    default: {
      if (language === 'hi') {
        response = 'मुझे यह समझ नहीं आया। कृपया दोबारा कहें।';
      } else if (language === 'mr') {
        response = 'मला हे समजले नाही. कृपया पुन्हा सांगा.';
      } else {
        response = 'I didn\'t understand that. You can ask about failed payments, recovery options, risk, settlements, or what needs attention.';
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
