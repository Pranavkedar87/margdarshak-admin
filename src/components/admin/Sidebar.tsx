import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart2, 
  Clock, 
  ShieldCheck, 
  UserX, 
  QrCode, 
  History, 
  MapPin, 
  Settings, 
  LogOut,
  Shield,
  Radio
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-colors group ${
      isActive
        ? 'bg-[#FFF4E6] text-[#CA7A00] font-bold shadow-xs'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`;

  const subNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center pl-8 pr-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
      isActive
        ? 'text-[#CA7A00] font-semibold bg-[#FFF4E6]/50'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-5 py-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2844A8] to-[#1E3482] flex items-center justify-center text-white shadow-sm">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-gray-900 leading-none">
              MARGDARSHAK
            </h1>
            <p className="text-[10px] tracking-wider uppercase font-semibold text-amber-700 mt-1">
              Admin Command Center
            </p>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* SECTION: OVERVIEW */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              Overview
            </div>
            <nav className="space-y-1">
              <NavLink to="/admin" end className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4 mr-2.5 text-gray-400 group-hover:text-gray-600" />
                Command Center
              </NavLink>
              <NavLink to="/admin/analytics" className={navLinkClass}>
                <BarChart2 className="w-4 h-4 mr-2.5 text-gray-400 group-hover:text-gray-600" />
                Analytics
              </NavLink>
            </nav>
          </div>

          {/* SECTION: SAFETY REGISTRATION */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              Safety Registration
            </div>
            <nav className="space-y-1">
              <NavLink to="/admin/pending" className={navLinkClass}>
                <Clock className="w-4 h-4 mr-2.5 text-amber-500" />
                Pending Requests
              </NavLink>
              <NavLink to="/admin/verified" className={navLinkClass}>
                <ShieldCheck className="w-4 h-4 mr-2.5 text-emerald-600" />
                Verified Profiles
              </NavLink>
              <NavLink to="/admin/rejected" className={navLinkClass}>
                <UserX className="w-4 h-4 mr-2.5 text-red-500" />
                Rejected
              </NavLink>
            </nav>
          </div>

          {/* SECTION: QR MANAGEMENT */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              QR Management
            </div>
            <nav className="space-y-1">
              <NavLink to="/admin/qr-management" end className={navLinkClass}>
                <QrCode className="w-4 h-4 mr-2.5 text-[#2844A8]" />
                QR / Safety Band
              </NavLink>
              <div className="pt-1 space-y-0.5">
                <NavLink to="/admin/qr-management?tab=GENERATED" className={subNavLinkClass}>
                  • Generated QR
                </NavLink>
                <NavLink to="/admin/qr-management?tab=ISSUED" className={subNavLinkClass}>
                  • Issued
                </NavLink>
                <NavLink to="/admin/qr-management?tab=ACTIVE" className={subNavLinkClass}>
                  • Active
                </NavLink>
                <NavLink to="/admin/qr-management?tab=SUSPENDED" className={subNavLinkClass}>
                  • Suspended
                </NavLink>
                <NavLink to="/admin/qr-management?tab=REVOKED" className={subNavLinkClass}>
                  • Revoked
                </NavLink>
              </div>
            </nav>
          </div>

          {/* SECTION: MONITORING */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              Monitoring
            </div>
            <nav className="space-y-1">
              <NavLink to="/admin/scan-history" className={navLinkClass}>
                <History className="w-4 h-4 mr-2.5 text-gray-400 group-hover:text-gray-600" />
                Scan History
              </NavLink>
              <NavLink to="/admin/scan-map" className={navLinkClass}>
                <MapPin className="w-4 h-4 mr-2.5 text-rose-500" />
                Scan Map
              </NavLink>
            </nav>
          </div>

          {/* SECTION: SYSTEM */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              System
            </div>
            <nav className="space-y-1">
              <NavLink to="/admin/settings" className={navLinkClass}>
                <Settings className="w-4 h-4 mr-2.5 text-gray-400 group-hover:text-gray-600" />
                Settings
              </NavLink>
            </nav>
          </div>
        </div>

        {/* Bottom Section: Live Status & Logout */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/70 space-y-2">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[11px] font-medium">
            <span className="flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
              <span>Cloud Telemetry</span>
            </span>
            <span className="font-bold uppercase tracking-wider text-[10px]">Real-time</span>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to exit the command center?')) {
                window.location.href = '/admin';
              }
            }}
            className="flex items-center w-full px-3 py-2 text-xs font-semibold text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2 text-red-500" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
