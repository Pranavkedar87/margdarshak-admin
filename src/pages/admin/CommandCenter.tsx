import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Clock, QrCode, Radio, Activity, AlertCircle, RefreshCw,
  Users, Navigation, CheckCircle2, XCircle, MapPin, BarChart2, ChevronRight
} from 'lucide-react';
import { KPICard } from '../../components/admin/KPICard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ProfileDetailModal } from '../../components/admin/ProfileDetailModal';
import { QRGenerationModal } from '../../components/admin/QRGenerationModal';
import { safetyService, DashboardKPIs } from '../../services/safetyService';
import { scanService } from '../../services/scanService';
import { SafetyProfile, QRScanEvent } from '../../types/database';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Link } from 'react-router-dom';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export const CommandCenter: React.FC = () => {
  const [kpis, setKpis] = useState<DashboardKPIs>({
    totalParticipants: 0,
    pendingRequests: 0,
    verifiedProfiles: 0,
    rejectedProfiles: 0,
    generatedQRs: 0,
    activeQRs: 0,
    recentScans: 0,
  });
  const [pendingProfiles, setPendingProfiles] = useState<SafetyProfile[]>([]);
  const [recentScans, setRecentScans] = useState<QRScanEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<SafetyProfile | null>(null);
  const [qrModalProfile, setQrModalProfile] = useState<SafetyProfile | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isSupabaseConfigured) { setLoading(false); return; }
      const [kpiData, pendingData, scanData] = await Promise.all([
        safetyService.getDashboardKPIs(),
        safetyService.getProfiles({ status: 'PENDING_REVIEW', limit: 8 }),
        scanService.getScanEvents(5),
      ]);
      setKpis(kpiData);
      setPendingProfiles(pendingData);
      setRecentScans(scanData);
    } catch (err: any) {
      setError(err.message || 'Error communicating with Supabase');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleVerify = async (id: string) => { await safetyService.verifyProfile(id); await loadData(); };
  const handleReject = async (id: string) => { await safetyService.rejectProfile(id); await loadData(); };

  const gpsScans = recentScans.filter(s => s.latitude !== null).length;

  return (
    <div className="space-y-5">
      {!isSupabaseConfigured && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-[#CA7A00] shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-amber-900 mb-0.5">Supabase Anon Key Configuration Required</h4>
            <p className="text-amber-800">Add your publishable anon key as <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">VITE_SUPABASE_ANON_KEY</code> to enable live database queries.</p>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-black text-gray-900 tracking-tight">MARGDARSHAK · ADMIN COMMAND CENTER</h2>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF4E6] text-[#CA7A00] border border-amber-300">SAFETY GRID</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Real-time situational awareness · Cloud Synchronized</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-xs transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin text-[#2844A8]' : 'text-gray-500'}`} />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard title="Total Profiles" count={kpis.totalParticipants} subtitle="All registrations" color="navy" icon={Users} loading={loading} />
        <KPICard title="Pending" count={kpis.pendingRequests} subtitle="Awaiting review" color="saffron" icon={Clock} loading={loading} />
        <KPICard title="Verified" count={kpis.verifiedProfiles} subtitle="Cleared for QR" color="green" icon={ShieldCheck} loading={loading} />
        <KPICard title="Generated QR" count={kpis.generatedQRs} subtitle="Tags prepared" color="navy" icon={QrCode} loading={loading} />
        <KPICard title="Active QR" count={kpis.activeQRs} subtitle="In field" color="green" icon={Activity} loading={loading} />
        <KPICard title="Scan Events" count={kpis.recentScans} subtitle="Total telemetry" color="navy" icon={Radio} loading={loading} />
      </div>

      {/* Middle Row: Live Safety Status + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live Safety Status */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Live Safety Status</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              NORMAL / SECURE
            </span>
          </div>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-emerald-500" /> Active safety tags</span>
              <span className="font-bold text-gray-900">{kpis.activeQRs}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 text-[#2844A8]" /> QR scans recorded</span>
              <span className="font-bold text-gray-900">{kpis.recentScans}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-500" /> GPS-enabled scans</span>
              <span className="font-bold text-gray-900">{gpsScans}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
              <span>Verification rate</span>
              <span className="font-bold text-gray-900">
                {kpis.totalParticipants > 0 ? `${Math.round((kpis.verifiedProfiles / kpis.totalParticipants) * 100)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white to-[#FFF4E6]/30 rounded-xl p-5 border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Operational Actions</span>
            <h3 className="text-sm font-bold text-gray-900">Quick Safety Tag Management</h3>
            <p className="text-xs text-gray-600 mt-1">Verify pilgrim registrations, issue physical cards, and inspect field scan telemetry.</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
            <Link to="/admin/pending" className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#CA7A00] text-white hover:bg-[#A96400] transition-colors shadow-xs">
              Review Pending ({kpis.pendingRequests})
            </Link>
            <Link to="/admin/qr-management" className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2844A8] text-white hover:bg-[#1E3482] transition-colors shadow-xs">
              QR Inventory
            </Link>
            <Link to="/admin/scan-history" className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors shadow-xs">
              Scan History ({kpis.recentScans})
            </Link>
            <Link to="/admin/scan-map" className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors shadow-xs">
              <MapPin className="w-3 h-3 mr-1 text-rose-500" /> Live Map
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity + Pending Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent GPS Scans */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold text-gray-900">Recent Scan Activity</h3>
            </div>
            <Link to="/admin/scan-history" className="text-[11px] font-semibold text-[#2844A8] hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-4 text-center text-xs text-gray-400">Loading...</div>
            ) : recentScans.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">No scan events yet.</div>
            ) : (
              recentScans.map((ev) => (
                <div key={ev.id} className="px-4 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#2844A8] text-[11px]">{ev.safety_id || 'N/A'}</span>
                        {ev.latitude !== null ? (
                          <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-bold">
                            <CheckCircle2 className="w-2.5 h-2.5" /> GPS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-gray-50 text-gray-400 border border-gray-200 rounded text-[9px]">
                            <XCircle className="w-2.5 h-2.5" /> No GPS
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{timeAgo(ev.scanned_at)}</div>
                    </div>
                    {ev.latitude !== null && ev.longitude !== null && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${ev.latitude},${ev.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 p-1.5 rounded-lg bg-[#2844A8]/10 hover:bg-[#2844A8]/20 text-[#2844A8] transition-colors"
                        title="Open in Google Maps"
                      >
                        <Navigation className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Requests Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-gray-900">Pending Verification Requests</h3>
            </div>
            <Link to="/admin/pending" className="text-[11px] font-semibold text-[#2844A8] hover:underline flex items-center gap-1">
              View all ({kpis.pendingRequests}) <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <LoadingSpinner message="Fetching pending requests..." />
          ) : error ? (
            <div className="p-4 text-center text-xs text-red-600 bg-red-50">
              <AlertCircle className="w-4 h-4 mx-auto mb-1.5 text-red-500" />
              <p className="font-semibold">{error}</p>
            </div>
          ) : pendingProfiles.length === 0 ? (
            <EmptyState title="No Pending Requests" description="All profiles have been reviewed." icon={ShieldCheck} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Safety ID</th>
                    <th className="py-2.5 px-4">Name</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {pendingProfiles.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#2844A8]">{p.safety_id}</td>
                      <td className="py-2.5 px-4 font-semibold text-gray-900">{p.name}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">{p.profile_type}</span>
                      </td>
                      <td className="py-2.5 px-4"><StatusBadge status={p.qr_status} /></td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setSelectedProfile(p)} className="px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 shadow-xs">View</button>
                          <button onClick={() => handleVerify(p.id)} className="px-2 py-1 text-xs font-semibold text-white bg-emerald-600 rounded hover:bg-emerald-700 shadow-xs">Verify</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="w-4 h-4 text-[#2844A8]" />
            <span className="text-xs font-bold text-gray-700">Verification Rate</span>
          </div>
          <div className="text-3xl font-extrabold text-[#2844A8]">
            {kpis.totalParticipants > 0 ? `${Math.round((kpis.verifiedProfiles / kpis.totalParticipants) * 100)}%` : '0%'}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">{kpis.verifiedProfiles} verified out of {kpis.totalParticipants} total</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <QrCode className="w-4 h-4 text-[#CA7A00]" />
            <span className="text-xs font-bold text-gray-700">QR Issuance Rate</span>
          </div>
          <div className="text-3xl font-extrabold text-[#CA7A00]">
            {kpis.verifiedProfiles > 0 ? `${Math.round((kpis.generatedQRs / kpis.verifiedProfiles) * 100)}%` : '0%'}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">{kpis.generatedQRs} QR codes for {kpis.verifiedProfiles} verified profiles</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-bold text-gray-700">GPS Scan Rate</span>
          </div>
          <div className="text-3xl font-extrabold text-rose-500">
            {kpis.recentScans > 0 ? `${Math.round((gpsScans / kpis.recentScans) * 100)}%` : '0%'}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">{gpsScans} GPS-enabled out of {kpis.recentScans} scans</p>
        </div>
      </div>

      <ProfileDetailModal
        profile={selectedProfile}
        isOpen={selectedProfile !== null}
        onClose={() => setSelectedProfile(null)}
        onVerify={handleVerify}
        onReject={handleReject}
        onGenerateQR={(p) => { setSelectedProfile(null); setQrModalProfile(p); }}
      />
      <QRGenerationModal
        profile={qrModalProfile}
        isOpen={qrModalProfile !== null}
        onClose={() => setQrModalProfile(null)}
        onStatusChanged={loadData}
      />
    </div>
  );
};
