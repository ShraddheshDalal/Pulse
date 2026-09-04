# PULSE — AI Payment Operations Autopilot

<p align="center">
  <img src="https://img.shields.io/badge/Theme-Razorpay%20Fintech%20White%20%2B%20Blue-3395FF?style=for-the-badge&logo=razorpay" alt="Razorpay Theme" />
  <img src="https://img.shields.io/badge/Track%2003-AI%20Revenue%20Recovery-0B214A?style=for-the-badge" alt="Track 03" />
  <img src="https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%205%20%7C%20Tailwind-38BDF8?style=for-the-badge&logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-16A34A?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/Voice%20AI-Trilingual%20(EN%20%7C%20HI%20%7C%20MR)-4F46E5?style=for-the-badge" alt="Voice" />
  <img src="https://img.shields.io/badge/License-MIT-slate?style=for-the-badge" alt="License" />
</p>

<h3 align="center">
  <strong>"Know what happened. Decide what to do. Let Pulse handle the rest."</strong>
</h3>

<p align="center">
  An autonomous, merchant-facing AI payment operations platform that unifies failed payment monitoring, fraud risk guardrails, recovery execution, settlement tracking, and reconciliation into <strong>one continuous operational flow</strong>.
</p>

---

## 📌 Executive Summary & Core Thesis

A merchant should not have to separately navigate between 5 fragmented dashboards:
1. Failed payments tab
2. Fraud/risk scoring dashboard
3. Abandoned checkout recovery tools
4. Bank settlement reports
5. Reconciliation accounting ledgers

The merchant cares about one fundamental question:
> **"I was supposed to receive ₹X. What happened to that money?"**

Pulse follows the entire journey of money and determines:
- **What happened?** (Temporary issuer decline, network timeout, customer cancellation)
- **Why did it happen?** (Bank switch load, expired token, insufficient funds)
- **Is it safe to act?** (Fraud anomaly score, velocity check, device fingerprinting)
- **What action has the highest expected value?** (`Expected Safe Recovery = Amount × Probability − Risk Penalty − Friction`)
- **Should AI execute it autonomously?** (Conservative, Balanced, or Autonomous Autopilot policy)
- **What happened after the action?** (Recovered & Captured ✓)
- **Where did the cash settle?** (Trace gross amount → processor fee → GST → nodal bank deposit)
- **What did we learn?** (Feed outcomes back into the Merchant Playbook to improve future decisions)

### Primary Buildathon Objective
$$\mathbf{MAXIMIZE\ SAFE\ REALIZED\ REVENUE}$$

---

## 🔄 The Unified Payment Journey

```text
       [1] PAYMENT INITIATED
                 ↓
       [2] UNDERSTAND (Root cause: Issuer Decline, Network Timeout, User Intent)
                 ↓
       [3] ASSESS RISK (Evaluate 9 Signals: Velocity, Device, Anomaly Score)
                 ↓
       [4] ESTIMATE RECOVERY (Calculate Safe Probabilities via Merchant Playbook)
                 ↓
       [5] CHOOSE BEST ACTION (Select Optimal Expected Safe Value)
                 ↓
       [6] EXECUTE (Autopilot Autonomous Policy OR One-Click Approval)
                 ↓
       [7] PAYMENT RESULT (Transition to RECOVERED & CAPTURED ✓)
                 ↓
       [8] SETTLEMENT (Track MDR Fees, 18% GST, Adjustments, Net Credit)
                 ↓
       [9] RECONCILIATION (Verify Match OR Trigger AI Discrepancy Investigation)
                 ↓
       [10] LEARN & ADAPT (Update Store-Specific Playbook Rules & Confidence)
```

---


## 📁 Repository Structure

```text
F:\razorpay\
├── client/                     # Vite + React 18 Frontend
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── components/         # Modular fintech components
│   │   │   ├── common/         # Header, Toast, AskPulseModal
│   │   │   ├── payment/        # PaymentDrawer & Money Journey timeline
│   │   │   ├── recovery/       # RecoverySimulatorModal (Hero 1)
│   │   │   └── voice/          # VoiceOverlay (Trilingual floating mic)
│   │   ├── data/
│   │   │   └── mockData.js     # High-fidelity deterministic store
│   │   ├── layouts/
│   │   │   └── DashboardLayout # Sidebar, navigation, status bar
│   │   ├── pages/              # 13 Complete Operational Pages
│   │   │   ├── AttentionPage   # Priority Action Queue (WHAT/WHY/IMPACT)
│   │   │   ├── AutopilotPage   # Conservative/Balanced/Autonomous & Action Log
│   │   │   ├── InsightsPage    # Evidence-backed merchant insights
│   │   │   ├── LoginPage       # One-click Demo Merchant access
│   │   │   ├── MoneyJourney    # Unified lifecycle chronological trace
│   │   │   ├── OverviewPage    # Payment Control Center & Health hero
│   │   │   ├── PaymentsPage    # Searchable, filterable ledger table
│   │   │   ├── PlaybookPage    # Learned store decision rules
│   │   │   ├── RevenuePage     # Leakage Map & Counterfactual AI uplift
│   │   │   ├── RiskPage        # Risk That Affects Revenue & Matrix
│   │   │   ├── SettlementPage  # Settlement & AI Recon Investigation
│   │   │   ├── SettingsPage    # Razorpay test mode & 6 Demo Scenarios
│   │   │   └── VoiceAssistant  # Full audio console
│   │   ├── services/
│   │   │   ├── api.js          # Resilient API client with offline fallback
│   │   │   └── voiceService.js # Web Speech API engine (EN / HI / MR)
│   │   ├── utils/
│   │   │   └── formatters.js   # Indian currency (₹) & status helpers
│   │   ├── App.jsx             # Route definitions & Toast provider
│   │   ├── index.css           # Tailwind design tokens & animations
│   │   └── main.jsx            # Application entry
│   ├── package.json
│   ├── tailwind.config.js      # Razorpay Blue & Navy color palette
│   └── vite.config.js          # Port 5173 with /api proxy to backend
│
├── server/                     # Node.js + Express Backend
│   ├── config/
│   │   └── db.js               # MongoDB connection with demo fallback
│   ├── controllers/            # 12 Operational controllers
│   ├── middleware/             # Centralized error handler & validation
│   ├── models/                 # 12 Mongoose data schemas
│   ├── routes/                 # Express API routes (/api/*)
│   ├── seed/                   # Deterministic generator (2,000 payments)
│   ├── utils/                  # Calculation & formatting helpers
│   ├── index.js                # Server entry on Port 5000
│   └── package.json
│
├── .env.example                # Root environment template
├── .gitignore                  # Excludes node_modules, .env, dist
├── LICENSE                     # MIT License
├── package.json                # Monorepo concurrently launcher
└── README.md                   # Complete documentation
```

---

## 🎨 Design System & Palette

Strictly follows Razorpay's trusted Indian fintech aesthetic (no dark mode, no glowing AI orbs):

| Token | Hex Value | Application |
| :--- | :--- | :--- |
| **Primary Blue** | `#3395FF` | Primary action CTAs, active highlights, key links |
| **Dark Blue** | `#0B214A` | Sidebar, hero KPI banners, modals |
| **Deep Navy** | `#081C3A` | Merchant profile cards, console headers |
| **Page Background** | `#F7F9FC` | Clean operational workspace background |
| **Card Background** | `#FFFFFF` | White cards with 14px fintech border-radius |
| **Light Blue** | `#E8F3FF` | Active badge backgrounds, sub-actions |
| **Success** | `#16A34A` | Captured & Recovered ✓ state indicators |
| **Warning** | `#F59E0B` | Settlement variance & review warnings |
| **Danger** | `#DC2626` | High-risk alerts & fraud blocks |
| **AI Accent** | `#4F46E5` | AI decision explanations (used sparingly) |

---

## 🚀 Step-by-Step Execution Guide

### Prerequisites
* **Node.js** (v18 or higher)
* **npm** (v9 or higher)
* *Optional*: Local MongoDB instance on `mongodb://localhost:27017/pulse` (Pulse operates automatically with or without MongoDB via its built-in in-memory fallback engine).

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ShraddheshDalal/pulse.git
cd pulse

# Install dependencies across root, server, and client
npm run install:all
```

### 2. Run Database Seeding (Optional)
If you have MongoDB running locally, populate 2,000 realistic payments:
```bash
npm run seed
```

### 3. Launch the Platform
```bash
npm run dev
```

* **Frontend UI**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 🧪 Build & Quality Verification

```bash
cd client
npm run build
```

**Build Output**:
```text
vite v5.4.21 building for production...
✓ 2471 modules transformed.
dist/index.html                   1.31 kB │ gzip:   0.74 kB
dist/assets/index-BotpJWRB.css   42.13 kB │ gzip:   7.16 kB
dist/assets/index-BFdVnH32.js   761.00 kB │ gzip: 215.59 kB
✓ built in 7.98s
```
* Status: **0 Errors, 0 Warnings, Production Ready.**

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

Developed with ❤️ for the **Razorpay Buildathon — Track 03: AI Revenue Recovery**.
