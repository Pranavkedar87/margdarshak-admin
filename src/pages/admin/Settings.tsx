import React, { useState } from 'react';
import { Settings as SettingsIcon, CheckCircle2, XCircle, Map, RefreshCw, Database } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

export const Settings: React.FC = () => {
  const mapsReady = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  const [lastRefresh, setLastRefresh] = useState<string>(new Date().toLocaleTimeString('en-IN'));

  const handleRefreshStatus = () => {
    setLastRefresh(new Date().toLocaleTimeString('en-IN'));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-[#2844A8]" />
          Admin Settings
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          System status and operational configuration
        </p>
      </div>

      {/* System Status — Read Only */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">System Status</h3>
          <button
            onClick={handleRefreshStatus}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 hover:text-gray-900 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>

        <div className="space-y-3">
          {/* Supabase */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Database className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-900">Supabase Database</div>
                <div className="text-[11px] text-gray-500">Safety profiles, QR codes, scan events</div>
              </div>
            </div>
            {isSupabaseConfigured ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold">
                <XCircle className="w-3.5 h-3.5" /> Not Configured
              </div>
            )}
          </div>

          {/* Google Maps */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Map className="w-4 h-4 text-[#2844A8]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-900">Google Maps</div>
                <div className="text-[11px] text-gray-500">Admin scan telemetry map</div>
              </div>
            </div>
            {mapsReady ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> API Key Configured
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold">
                <XCircle className="w-3.5 h-3.5" /> API Key Missing
              </div>
            )}
          </div>

          {/* Last refresh */}
          <div className="flex items-center justify-between py-2 text-xs">
            <span className="text-gray-500">Last status check</span>
            <span className="font-semibold text-gray-900">{lastRefresh}</span>
          </div>
        </div>
      </div>

      {/* Map Settings */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Map className="w-4 h-4 text-[#2844A8]" />
          Map Settings
        </h3>
        <div className="space-y-3 text-xs text-gray-600">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span>Map Provider</span>
            <span className="font-semibold text-gray-900">Google Maps (JavaScript API)</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span>Default Zoom</span>
            <span className="font-semibold text-gray-900">12 (City Level)</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span>Default Center</span>
            <span className="font-semibold text-gray-900">Maharashtra, India</span>
          </div>
        </div>
      </div>

      {/* Telemetry Settings */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Telemetry</h3>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span>Scan Data Refresh</span>
            <span className="font-semibold text-gray-900">Manual (Refresh button)</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span>Auto-Scan on QR Page Load</span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">Enabled</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span>GPS Permission Request</span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">Automatic</span>
          </div>
        </div>
      </div>
    </div>
  );
};
