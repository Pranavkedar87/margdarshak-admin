import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Globe, Database, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { CONFIG, buildSafetyQrPayload } from '../../lib/config';
import { isSupabaseConfigured } from '../../lib/supabase';

export const Settings: React.FC = () => {
  const [testSafetyId, setTestSafetyId] = useState('MD-FM-2026-384920');

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-[#2844A8]" />
          System & Cloud Connectivity Settings
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Verify Supabase integration, public URL routing, and security policies
        </p>
      </div>

      {/* Cloud Connectivity */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Database className="w-4 h-4 text-[#2844A8]" />
          Supabase Cloud Backend
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <span className="font-semibold text-gray-700 block mb-1">Supabase Project URL</span>
            <input
              type="text"
              readOnly
              value={CONFIG.SUPABASE_URL}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-mono text-gray-700 cursor-not-allowed"
            />
          </div>

          <div>
            <span className="font-semibold text-gray-700 block mb-1">Anon / Publishable Key Status</span>
            <div className="flex items-center space-x-2">
              {isSupabaseConfigured ? (
                <div className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Key configured in environment
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  Key not configured. Set VITE_SUPABASE_ANON_KEY in .env.local
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Public Domain & QR Payload */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-[#CA7A00]" />
          Public QR Payload Resolver
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <span className="font-semibold text-gray-700 block mb-1">Public Web Base URL</span>
            <input
              type="text"
              readOnly
              value={CONFIG.PUBLIC_APP_URL}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-mono text-gray-700"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Configured via <code className="font-mono text-gray-700">VITE_PUBLIC_APP_URL</code>. Production value is <code className="font-mono text-gray-700">https://margdarshak.app</code>.
            </p>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <span className="font-semibold text-gray-700 block mb-1">Live QR Payload Preview</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={testSafetyId}
                onChange={(e) => setTestSafetyId(e.target.value)}
                placeholder="Test Safety ID..."
                className="w-48 bg-white border border-gray-300 rounded-lg p-2 font-mono text-xs"
              />
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 font-mono text-xs text-gray-600 flex items-center justify-between">
                <span>{buildSafetyQrPayload(testSafetyId)}</span>
                <a
                  href={`/safety/${encodeURIComponent(testSafetyId)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#2844A8] font-sans font-bold hover:underline flex items-center gap-1 text-[11px]"
                >
                  Test Route <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Status Table */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-600" />
          Feature & Integration Readiness
        </h3>

        <div className="border border-gray-200 rounded-lg overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500">
              <tr>
                <th className="p-2.5">Feature Component</th>
                <th className="p-2.5">Architecture Level</th>
                <th className="p-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-2.5 font-semibold text-gray-900">Family Safety Profiles & Accessories</td>
                <td className="p-2.5 text-gray-600">Supabase DB Tables</td>
                <td className="p-2.5 text-emerald-700 font-bold">Active Cloud</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-gray-900">High-Resolution QR Generator (1024px SVG/PNG)</td>
                <td className="p-2.5 text-gray-600">Client Engine</td>
                <td className="p-2.5 text-emerald-700 font-bold">Active Engine</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-gray-900">Print Layouts (Card, Wristband, Sticker)</td>
                <td className="p-2.5 text-gray-600">CSS @media print</td>
                <td className="p-2.5 text-emerald-700 font-bold">Production Ready</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-gray-900">Public Sanitized Profile Endpoint</td>
                <td className="p-2.5 text-gray-600">public-safety Edge Function / RPC</td>
                <td className="p-2.5 text-emerald-700 font-bold">Production Ready</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-gray-900">Scanner GPS Telemetry</td>
                <td className="p-2.5 text-gray-600">record-qr-scan / qr_scan_events</td>
                <td className="p-2.5 text-emerald-700 font-bold">Real Telemetry</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-gray-900">Secure Contact Relay</td>
                <td className="p-2.5 text-gray-600">SMS / Telephony Relay Gateway</td>
                <td className="p-2.5 text-amber-700 font-bold">Coming Soon (Placeholder)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
