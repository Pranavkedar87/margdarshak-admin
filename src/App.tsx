import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { CommandCenter } from './pages/admin/CommandCenter';
import { PendingRequests } from './pages/admin/PendingRequests';
import { VerifiedProfiles } from './pages/admin/VerifiedProfiles';
import { RejectedProfiles } from './pages/admin/RejectedProfiles';
import { QRManagement } from './pages/admin/QRManagement';
import { ScanHistory } from './pages/admin/ScanHistory';
import { ScanMap } from './pages/admin/ScanMap';
import { Analytics } from './pages/admin/Analytics';
import { Settings } from './pages/admin/Settings';
import { PublicSafetyPage } from './pages/public/PublicSafetyPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Public QR Safety Route */}
        <Route path="/safety/:safetyId" element={<PublicSafetyPage />} />

        {/* Admin Command Center Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<CommandCenter />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="pending" element={<PendingRequests />} />
          <Route path="verified" element={<VerifiedProfiles />} />
          <Route path="rejected" element={<RejectedProfiles />} />
          <Route path="qr-management" element={<QRManagement />} />
          <Route path="scan-history" element={<ScanHistory />} />
          <Route path="scan-map" element={<ScanMap />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Root Redirect to Admin Pending Requests */}
        <Route path="/" element={<Navigate to="/admin/pending" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/admin/pending" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
