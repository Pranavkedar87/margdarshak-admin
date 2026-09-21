import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/admin/Sidebar';
import { Header } from '../components/admin/Header';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') {
      return { title: 'COMMAND CENTER', subtitle: 'Real-time situational awareness & Family Safety' };
    }
    if (path.includes('/admin/analytics')) {
      return { title: 'ANALYTICS & METRICS', subtitle: 'Platform usage & registration trends' };
    }
    if (path.includes('/admin/pending')) {
      return { title: 'PENDING REGISTRATIONS', subtitle: 'Awaiting administrative verification' };
    }
    if (path.includes('/admin/verified')) {
      return { title: 'VERIFIED PROFILES', subtitle: 'Profiles cleared for QR generation & band issue' };
    }
    if (path.includes('/admin/rejected')) {
      return { title: 'REJECTED REGISTRATIONS', subtitle: 'Registrations declined during review' };
    }
    if (path.includes('/admin/qr-management')) {
      return { title: 'QR & SAFETY BAND INVENTORY', subtitle: 'Generated, issued, active and suspended tags' };
    }
    if (path.includes('/admin/scan-history')) {
      return { title: 'SCAN MONITORING HISTORY', subtitle: 'Audit log of public QR scans and geolocation' };
    }
    if (path.includes('/admin/scan-map')) {
      return { title: 'LIVE SAFETY MAP', subtitle: 'Geographic visualization of scanned safety tags' };
    }
    if (path.includes('/admin/settings')) {
      return { title: 'SYSTEM CONFIGURATION', subtitle: 'Cloud connectivity, endpoints & security' };
    }
    return { title: 'ADMIN COMMAND CENTER', subtitle: 'MargDarshak Operations' };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="min-h-screen bg-[#FFF4E6]/20 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          title={title}
          subtitle={subtitle}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
