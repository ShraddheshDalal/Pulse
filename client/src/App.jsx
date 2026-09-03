import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import PaymentsPage from './pages/PaymentsPage';
import AttentionPage from './pages/AttentionPage';
import RevenuePage from './pages/RevenuePage';
import RiskPage from './pages/RiskPage';
import MoneyJourneyPage from './pages/MoneyJourneyPage';
import SettlementPage from './pages/SettlementPage';
import InsightsPage from './pages/InsightsPage';
import PlaybookPage from './pages/PlaybookPage';
import AutopilotPage from './pages/AutopilotPage';
import VoiceAssistantPage from './pages/VoiceAssistantPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="attention" element={<AttentionPage />} />
            <Route path="revenue" element={<RevenuePage />} />
            <Route path="risk" element={<RiskPage />} />
            <Route path="money-journey" element={<MoneyJourneyPage />} />
            <Route path="settlements" element={<SettlementPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="playbook" element={<PlaybookPage />} />
            <Route path="autopilot" element={<AutopilotPage />} />
            <Route path="voice" element={<VoiceAssistantPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
