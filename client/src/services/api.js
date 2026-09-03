import axios from 'axios';
import {
  mockDashboardData,
  mockPayments,
  mockRecoveryOptions,
  mockPlaybookRules,
  mockInsights,
  mockReconciliationData,
  mockAutopilotData,
  heroPayment1,
  heroPayment2,
  heroPayment3
} from '../data/mockData';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 3500,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dynamic in-memory local state for seamless mutations when in mock/offline mode
let localPayments = [...mockPayments];
let localAutopilot = { ...mockAutopilotData };

export const api = {
  // Check backend health / status
  async checkStatus() {
    try {
      const res = await apiClient.get('/dashboard');
      return { online: true, source: 'Pulse Live API' };
    } catch {
      return { online: false, source: 'Pulse Demo Mode (Local AI Store)' };
    }
  },

  // Dashboard
  async getDashboard() {
    try {
      const res = await apiClient.get('/dashboard');
      return { data: res.data.data, isLive: true };
    } catch (e) {
      // Return deterministic fallback
      return { data: mockDashboardData, isLive: false };
    }
  },

  // Attention Items
  async getAttentionItems(category) {
    try {
      const url = category ? `/attention?category=${category}` : '/attention';
      const res = await apiClient.get(url);
      return { data: res.data.data, isLive: true };
    } catch (e) {
      const actNow = localPayments.filter(p => p.attentionCategory === 'act_now');
      const review = localPayments.filter(p => p.attentionCategory === 'review');
      const monitor = localPayments.filter(p => p.attentionCategory === 'monitor');
      const resolved = localPayments.filter(p => p.attentionCategory === 'resolved');

      return {
        data: {
          summary: {
            actNowCount: actNow.length,
            actNowAmount: actNow.reduce((s, p) => s + p.amount, 0),
            reviewCount: review.length,
            reviewAmount: review.reduce((s, p) => s + p.amount, 0),
            monitorCount: monitor.length,
            resolvedCount: resolved.length,
          },
          actNow: actNow.map(p => ({
            ...p,
            what: `₹${p.amount.toLocaleString('en-IN')} payment ${p.status.replace(/_/g, ' ')}`,
            why: p.failureReason ? p.failureReason.replace(/_/g, ' ') : 'Risk threshold flagged',
            impact: `₹${p.amount.toLocaleString('en-IN')} at risk`,
            recommendedActionLabel: p.recommendedAction ? p.recommendedAction.replace(/_/g, ' ').toUpperCase() : 'REVIEW',
          })),
          review: review.map(p => ({
            ...p,
            what: `₹${p.amount.toLocaleString('en-IN')} payment review`,
            why: p.failureReason ? p.failureReason.replace(/_/g, ' ') : 'Settlement variance',
            impact: `₹${p.amount.toLocaleString('en-IN')} review`,
            recommendedActionLabel: p.recommendedAction ? p.recommendedAction.replace(/_/g, ' ').toUpperCase() : 'VERIFY',
          })),
          monitor,
          resolved,
        },
        isLive: false,
      };
    }
  },

  // Payments List
  async getPayments(params = {}) {
    try {
      const res = await apiClient.get('/payments', { params });
      return { data: res.data.data, isLive: true };
    } catch (e) {
      let filtered = [...localPayments];
      if (params.status) {
        filtered = filtered.filter(p => p.status === params.status);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.paymentId.toLowerCase().includes(q) || 
          p.customerName.toLowerCase().includes(q)
        );
      }
      return {
        data: {
          payments: filtered,
          pagination: { total: filtered.length, page: 1, limit: 20, pages: 1 },
        },
        isLive: false,
      };
    }
  },

  // Payment by ID
  async getPaymentById(id) {
    try {
      const res = await apiClient.get(`/payments/${id}`);
      return { data: res.data.data, isLive: true };
    } catch (e) {
      const p = localPayments.find(p => p.paymentId === id) || heroPayment1;
      return {
        data: {
          payment: p,
          customer: {
            customerId: p.customerId || 'CUST00001',
            name: p.customerName,
            email: p.customerEmail || 'customer@example.com',
            phone: p.customerPhone || '+91 98765 43210',
            totalTransactions: 14,
            successfulTransactions: 12,
            preferredMethod: 'upi',
          },
        },
        isLive: false,
      };
    }
  },

  // Payment Journey Timeline
  async getPaymentJourney(id) {
    try {
      const res = await apiClient.get(`/payments/${id}/journey`);
      return { data: res.data.data, isLive: true };
    } catch (e) {
      const p = localPayments.find(p => p.paymentId === id) || heroPayment1;
      const isRecovered = p.status === 'recovered';
      const isBlocked = p.status === 'blocked';

      const timeline = [
        {
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          event: 'Payment Initiated',
          detail: `₹${p.amount.toLocaleString('en-IN')} via ${p.method.toUpperCase()}`,
          type: 'info',
        },
        {
          timestamp: new Date(Date.now() - 14.8 * 60 * 1000).toISOString(),
          event: `${p.method.toUpperCase()} Attempt Failed`,
          detail: p.failureReason ? p.failureReason.replace(/_/g, ' ') : 'Issuer decline',
          type: 'error',
        },
        {
          timestamp: new Date(Date.now() - 14.5 * 60 * 1000).toISOString(),
          event: 'Risk Engine Evaluated',
          detail: `Risk Score: ${p.riskScore}% (${p.riskScore <= 20 ? 'Low' : p.riskScore <= 50 ? 'Medium' : 'Critical'})`,
          type: p.riskScore > 50 ? 'warning' : 'info',
        },
        {
          timestamp: new Date(Date.now() - 14.2 * 60 * 1000).toISOString(),
          event: 'Recovery Potential Estimated',
          detail: `${p.recoveryProbability}% probability calculated via Merchant Playbook`,
          type: 'info',
        },
      ];

      if (isBlocked) {
        timeline.push({
          timestamp: new Date(Date.now() - 14.0 * 60 * 1000).toISOString(),
          event: 'Recovery Action Blocked',
          detail: 'Risk score exceeds safe threshold. Automatic retry withheld.',
          type: 'error',
        });
      } else {
        timeline.push({
          timestamp: new Date(Date.now() - 14.0 * 60 * 1000).toISOString(),
          event: 'AI Recommendation Generated',
          detail: `Pulse recommended: ${p.recommendedAction ? p.recommendedAction.replace(/_/g, ' ').toUpperCase() : 'OFFER UPI'}`,
          type: 'ai',
        });
      }

      if (isRecovered) {
        timeline.push(
          {
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            event: 'Recovery Action Executed',
            detail: 'Customer switched to UPI after instant prompt',
            type: 'action',
          },
          {
            timestamp: new Date(Date.now() - 9.8 * 60 * 1000).toISOString(),
            event: 'Payment Recovered & Captured ✓',
            detail: `₹${p.amount.toLocaleString('en-IN')} received via UPI`,
            type: 'success',
          },
          {
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            event: 'Settlement Prepared',
            detail: `Fees: ₹${Math.round(p.amount * 0.018)} | GST: ₹${Math.round(p.amount * 0.018 * 0.18)} | Net: ₹${Math.round(p.amount * 0.978).toLocaleString('en-IN')}`,
            type: 'info',
          },
          {
            timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
            event: 'Reconciled ✓',
            detail: 'Settlement confirmed into nodal merchant account with 0 variance',
            type: 'success',
          }
        );
      }

      return {
        data: {
          payment: p,
          timeline,
          riskAssessment: {
            riskScore: p.riskScore,
            riskLevel: p.riskScore <= 20 ? 'low' : p.riskScore <= 50 ? 'medium' : 'critical',
            explanation: p.aiReasoning,
          },
        },
        isLive: false,
      };
    }
  },

  // Payment Health Breakdown
  async getPaymentHealth(id) {
    try {
      const res = await apiClient.get(`/payments/${id}/health`);
      return { data: res.data.data, isLive: true };
    } catch (e) {
      const p = localPayments.find(p => p.paymentId === id) || heroPayment1;
      return {
        data: {
          healthScore: p.healthScore || 78,
          breakdown: {
            legitimacy: p.legitimacyScore || 96,
            customerIntent: p.customerIntent || 89,
            recoveryPotential: p.recoveryProbability || 81,
            settlementConfidence: p.settlementConfidence || 98,
            risk: p.riskScore || 4,
          },
        },
        isLive: false,
      };
    }
  },

  // Recovery Options & "What if I do nothing"
  async getRecoveryOptions(id) {
    try {
      const res = await apiClient.get(`/payments/${id}/recovery-options`);
      return { data: res.data.data, isLive: true };
    } catch (e) {
      const p = localPayments.find(p => p.paymentId === id) || heroPayment1;
      const expectedRev = Math.round(p.amount * (p.recoveryProbability / 100));
      return {
        data: {
          ...mockRecoveryOptions,
          payment: {
            paymentId: p.paymentId,
            amount: p.amount,
            customerName: p.customerName,
            failureReason: p.failureReason,
            method: p.method,
            riskScore: p.riskScore,
            recoveryProbability: p.recoveryProbability,
          },
          doNothing: {
            estimatedRecovery: Math.round(p.amount * 0.19),
            expectedLostRevenue: Math.round(p.amount * 0.81),
            recoveryRate: 19,
          },
        },
        isLive: false,
      };
    }
  },

  // Simulate Recovery
  async simulateRecovery(id) {
    try {
      const res = await apiClient.post(`/recovery/${id}/simulate`);
      return { data: res.data.data, isLive: true };
    } catch (e) {
      return { data: mockRecoveryOptions, isLive: false };
    }
  },

  // Execute Recovery
  async executeRecovery(id, action) {
    try {
      const res = await apiClient.post(`/recovery/${id}/execute`, { action });
      return { data: res.data.data, isLive: true };
    } catch (e) {
      // Mutate local state for smooth demo experience
      const idx = localPayments.findIndex(p => p.paymentId === id);
      if (idx >= 0) {
        localPayments[idx] = {
          ...localPayments[idx],
          status: 'recovered',
          actualRecoveryAction: action,
          recoveredAt: new Date().toISOString(),
          attentionCategory: 'resolved',
        };
      }
      const payment = localPayments.find(p => p.paymentId === id) || heroPayment1;

      return {
        data: {
          paymentId: id,
          action,
          outcome: 'recovered',
          payment: {
            status: 'recovered',
            amount: payment.amount,
            recoveredAt: new Date().toISOString(),
          },
          revenueImpact: {
            recovered: payment.amount,
            withoutPulse: Math.round(payment.amount * 0.19),
            incrementalImpact: Math.round(payment.amount * 0.81),
            label: 'Modelled incremental impact',
          },
        },
        isLive: false,
      };
    }
  },

  // Recovery Summary & Leakage
  async getRecoverySummary() {
    try {
      const res = await apiClient.get('/recovery/summary');
      return { data: res.data.data, isLive: true };
    } catch (e) {
      return {
        data: {
          summary: {
            totalFailed: 460,
            totalFailedAmount: 482000,
            totalRecovered: 184,
            totalRecoveredAmount: 214000,
            totalBlocked: 4,
            totalBlockedAmount: 71000,
            recoverableAmount: 266000,
            recoveryRate: 44,
          },
          leakage: {
            temporaryFailures: 174000,
            customerAbandonment: 92000,
            riskHolds: 71000,
            permanentDeclines: 63000,
            unresolved: 42000,
            settlementVariance: 40000,
          },
          counterfactual: {
            attemptedGMV: 4820000,
            actualRecovered: 214000,
            baselineRecovery: 83000,
            additionalAiUplift: 131000,
            breakdown: [
              { channel: 'Alternative Payment Routing (Cards → UPI)', amount: 71000 },
              { channel: 'Smart Delay Retry Timing', amount: 32000 },
              { channel: 'High-Intent Cart Abandonment Recovery', amount: 19000 },
              { channel: 'Subscription Auto-Retry Optimization', amount: 9000 },
            ],
          },
        },
        isLive: false,
      };
    }
  },

  // Risk Summary
  async getRiskSummary() {
    try {
      const res = await apiClient.get('/risk/summary');
      return { data: res.data.data, isLive: true };
    } catch (e) {
      return {
        data: {
          summary: {
            totalHighRisk: 18,
            highRiskVolume: 71000,
            criticalCount: 4,
            blockedRecovery: 85000,
            worthInvestigating: 3,
            worthInvestigatingAmount: 12400,
            averageRiskScore: 16,
          },
          riskDistribution: [
            { level: 'Low (0-20)', count: 1840, amount: 4210000 },
            { level: 'Medium (21-50)', count: 142, amount: 539000 },
            { level: 'High (51-75)', count: 14, amount: 48600 },
            { level: 'Critical (76-100)', count: 4, amount: 22400 },
          ],
          recentHighRisk: [heroPayment2],
          insight: '₹71,000 is high-risk, but only ₹12,400 is worth further merchant investigation.',
        },
        isLive: false,
      };
    }
  },

  // Settlements & Reconciliation
  async getSettlements() {
    try {
      const res = await apiClient.get('/settlements');
      return { data: res.data.data, isLive: true };
    } catch (e) {
      return {
        data: {
          settlements: [
            {
              settlementId: 'STL48293',
              paymentId: 'PAY48293',
              capturedAmount: 9500,
              fees: 190,
              tax: 34,
              expectedAmount: 9112,
              actualAmount: 8712,
              variance: 400,
              status: 'exception',
              settledAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
            },
            {
              settlementId: 'STL48291',
              paymentId: 'PAY48291',
              capturedAmount: 7499,
              fees: 141,
              tax: 25,
              expectedAmount: 7333,
              actualAmount: 7333,
              variance: 0,
              status: 'reconciled',
              settledAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
            },
          ],
          summary: { totalExpected: 16445, totalActual: 16045, totalVariance: 400, exceptionCount: 1 },
        },
        isLive: false,
      };
    }
  },

  async getReconciliation() {
    try {
      const res = await apiClient.get('/reconciliation');
      return { data: res.data.data, isLive: true };
    } catch (e) {
      return { data: mockReconciliationData, isLive: false };
    }
  },

  async investigateReconciliation(id) {
    try {
      const res = await apiClient.get(`/reconciliation/${id}/investigate`);
      return { data: res.data.data, isLive: true };
    } catch (e) {
      return {
        data: {
          reconciliation: mockReconciliationData.reconciliations[0],
          settlement: {
            capturedAmount: 9500,
            fees: 190,
            tax: 34,
            adjustments: 400,
            expectedAmount: 9112,
            actualAmount: 8712,
            variance: 400,
          },
          investigation: mockReconciliationData.reconciliations[0].investigation,
        },
        isLive: false,
      };
    }
  },

  // Insights
  async getInsights() {
    try {
      const res = await apiClient.get('/insights');
      return { data: res.data.data, isLive: true };
    } catch (e) {
      return { data: { insights: mockInsights }, isLive: false };
    }
  },

  // Playbook
  async getPlaybook() {
    try {
      const res = await apiClient.get('/playbook');
      return { data: res.data.data, isLive: true };
    } catch (e) {
      return { data: { rules: mockPlaybookRules }, isLive: false };
    }
  },

  // Autopilot
  async getAutopilot() {
    try {
      const res = await apiClient.get('/autopilot');
      return { data: res.data.data, isLive: true };
    } catch (e) {
      return { data: localAutopilot, isLive: false };
    }
  },

  async updateAutopilot(mode, settings) {
    try {
      const res = await apiClient.put('/autopilot', { mode, settings });
      return { data: res.data.data, isLive: true };
    } catch (e) {
      localAutopilot.mode = mode || localAutopilot.mode;
      localAutopilot.settings = { ...localAutopilot.settings, ...settings };
      return { data: localAutopilot, isLive: false };
    }
  },

  // Audit Log
  async getAuditLog() {
    try {
      const res = await apiClient.get('/audit-log');
      return { data: res.data.data, isLive: true };
    } catch (e) {
      return { data: { logs: localAutopilot.recentActions }, isLive: false };
    }
  },

  // Voice Command Dispatch
  async sendVoiceCommand(transcript, language = 'en') {
    try {
      const res = await apiClient.post('/voice/command', { transcript, language });
      return { data: res.data.data, isLive: true };
    } catch (e) {
      // Local natural language fallback engine matching requirements
      const lower = transcript.toLowerCase();
      let intent = 'GET_RECOVERY_SUMMARY';
      let response = '';
      let requiresConfirmation = false;

      if (lower.includes('fail') || lower.includes('फेल') || lower.includes('झाले')) {
        intent = 'GET_FAILED_PAYMENTS';
        response = language === 'hi'
          ? 'आज 23 payments fail हुए हैं। इनमें से 17 low-risk हैं और लगभग ₹42,800 recover किए जा सकते हैं।'
          : language === 'mr'
          ? 'आज 23 payments fail झाले आहेत. त्यापैकी 17 low-risk आहेत आणि सुमारे ₹42,800 recover होऊ शकतात.'
          : '23 payments failed today. 17 are low-risk and approximately ₹42,800 can safely be recovered.';
      } else if (lower.includes('first') || lower.includes('पहल') || lower.includes('आधी')) {
        intent = 'GET_ATTENTION_FIRST';
        response = language === 'hi'
          ? '₹14,000 का payment सबसे पहले recover करने की शिफारस है। इसका risk 8% है और recovery probability 84% है। UPI सबसे अच्छा option है।'
          : language === 'mr'
          ? '₹14,000 चा payment सर्वात आधी recover करण्याची शिफारस आहे. त्याचा risk 8% आहे आणि recovery probability 84% आहे. UPI हा सर्वोत्तम पर्याय आहे.'
          : 'The highest priority is a ₹14,000 payment with 84% recovery probability and 8% risk. UPI is the optimal route.';
      } else if (lower.includes('recover') || lower.includes('proceed') || lower.includes('कर') || lower.includes('करा')) {
        intent = 'EXECUTE_RECOVERY';
        requiresConfirmation = true;
        response = language === 'hi'
          ? '₹7,499 payment का risk score 4% है और recovery probability 81% है। Pulse UPI recovery recommend करता है। Proceed करूं?'
          : language === 'mr'
          ? '₹7,499 payment साठी UPI recovery execute करण्यापूर्वी तुमची confirmation आवश्यक आहे. Proceed करू?'
          : '₹7,499 payment has a 4% risk score and 81% recovery probability. Pulse recommends switching to UPI. Shall I proceed?';
      } else {
        response = language === 'hi'
          ? '₹1.4 लाख revenue risk पर है। ₹84,200 potentially recoverable है।'
          : language === 'mr'
          ? '₹1.4 लाख revenue risk वर आहे. ₹84,200 recover होऊ शकतात.'
          : '₹1.4 lakh is currently at risk. ₹84,200 is potentially recoverable.';
      }

      return {
        data: {
          intent,
          response,
          detectedLanguage: language,
          transcript,
          requiresConfirmation,
        },
        isLive: false,
      };
    }
  },
};

export default api;
