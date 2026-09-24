import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Clock, QrCode, Radio, Activity, AlertCircle, RefreshCw,
  Users, Navigation, CheckCircle2, XCircle, MapPin, ChevronRight,
  ExternalLink, Check, Layers
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

// Pure SVG Donut Chart for Field Telemetry
const TelemetryDonut: React.FC<{ gpsScans: number; totalScans: number }> = ({ gpsScans, totalScans }) => {
  const r = 36;
  const c = 2 * Math.PI * r;
  const gpsPct = totalScans > 0 ? Math.min(1, gpsScans / totalScans) : 0;
  const gpsDash = gpsPct * c;
  const displayPct = totalScans > 0 ? Math.round(gpsPct * 100) : 0;

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg viewBox="0 0 100 100" className="w-28 h-28 transform -rotate-90">
        {/* Background track (Total Scans / Denied) */}
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          strokeWidth="12"
          stroke="#F3F4F6"
        />
        {/* GPS Active Arc */}
        {totalScans > 0 && gpsScans > 0 && (
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            strokeWidth="12"
            stroke="#059669"
            strokeDasharray={`${gpsDash} ${c - gpsDash}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-black text-gray-900 leading-none">
          {totalScans > 0 ? `${displayPct}%` : '0%'}
        </span>
        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-1">GPS Fix</span>
      </div>
    </div>
  );
};

export const CommandCenter: React.FC = () => {
  const [kpis, setKpis] = useState<DashboardKPIs>({
    totalParticipants: 0,
    pendingRequests: 0,
    verifiedProfiles: 0,
    rejectedProfiles: 0,
    requestedQRs: 0,
    generatedQRs: 0,
    issuedQRs: 0,
    activeQRs: 0,
    recentScans: 0,
    gpsScans: 0,
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
        scanService.getScanEvents(6),
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

  // Calculations derived exclusively from real live data
  const verificationRate = kpis.totalParticipants > 0
    ? Math.round((kpis.verifiedProfiles / kpis.totalParticipants) * 100)
    : 0;

  const totalQrFulfillment = kpis.verifiedProfiles > 0
    ? Math.round(((kpis.issuedQRs + kpis.activeQRs) / kpis.verifiedProfiles) * 100)
    : 0;

  const activeDeploymentRate = kpis.verifiedProfiles > 0
    ? Math.round((kpis.activeQRs / kpis.verifiedProfiles) * 100)
    : 0;

  const gpsRate = kpis.recentScans > 0
    ? Math.round((kpis.gpsScans / kpis.recentScans) * 100)
    : 0;

  // Milestone readiness checklist
  const milestones = [
    {
      id: 1,
      title: 'Registration Ingestion',
      desc: `${kpis.totalParticipants} registered profile${kpis.totalParticipants === 1 ? '' : 's'} recorded`,
      done: kpis.totalParticipants > 0,
      badge: kpis.totalParticipants > 0 ? `${kpis.totalParticipants} Profiles` : 'Waiting',
    },
    {
      id: 2,
      title: 'Verification Clearance',
      desc: kpis.pendingRequests === 0 && kpis.totalParticipants > 0
        ? 'All registrations cleared · 0 backlog'
        : `${kpis.verifiedProfiles} verified · ${kpis.pendingRequests} pending`,
      done: kpis.pendingRequests === 0 && kpis.totalParticipants > 0,
      badge: kpis.pendingRequests === 0 && kpis.totalParticipants > 0 ? '100% Cleared' : `${verificationRate}% Verified`,
    },
    {
      id: 3,
      title: 'QR Asset Preparation',
      desc: `${kpis.generatedQRs + kpis.issuedQRs + kpis.activeQRs} tags generated & print-ready`,
      done: (kpis.generatedQRs + kpis.issuedQRs + kpis.activeQRs) > 0,
      badge: (kpis.generatedQRs + kpis.issuedQRs + kpis.activeQRs) > 0 ? 'Ready' : 'Pending',
    },
    {
      id: 4,
      title: 'Physical Tag Issuance',
      desc: `${kpis.issuedQRs + kpis.activeQRs} physical safety tags handed over to pilgrims`,
      done: (kpis.issuedQRs + kpis.activeQRs) > 0,
      badge: (kpis.issuedQRs + kpis.activeQRs) > 0 ? `${kpis.issuedQRs + kpis.activeQRs} Issued` : 'Awaiting Issue',
    },
    {
      id: 5,
      title: 'Field Telemetry & Tracking',
      desc: `${kpis.recentScans} scans recorded · ${kpis.gpsScans} with verified GPS`,
      done: kpis.recentScans > 0,
      badge: kpis.recentScans > 0 ? `${kpis.recentScans} Scans` : 'Standby',
    },
  ];

  const completedMilestones = milestones.filter(m => m.done).length;
  const readinessPct = Math.round((completedMilestones / milestones.length) * 100);

  return (
    <div className="space-y-6">
      {!isSupabaseConfigured && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-[#CA7A00] shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-amber-900 mb-0.5">Supabase Anon Key Configuration Required</h4>
            <p className="text-amber-800">Add your publishable anon key as <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">VITE_SUPABASE_ANON_KEY</code> to enable live database queries.</p>
          </div>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center flex-wrap gap-2.5">
            <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">MARGDARSHAK · ADMIN COMMAND CENTER</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              LIVE TELEMETRY
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF4E6] text-[#CA7A00] border border-amber-300">
              SAFETY GRID
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Real-time situational awareness · Verified pilgrims & active safety tag telemetry</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 shadow-xs transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin text-[#2844A8]' : 'text-gray-500'}`} />
          Refresh Data
        </button>
      </div>

      {/* 2. Top KPI Strip (6 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link to="/admin/verified" className="block focus:outline-none">
          <KPICard title="Total Profiles" count={kpis.totalParticipants} subtitle="All registrations" color="navy" icon={Users} loading={loading} />
        </Link>
        <Link to="/admin/pending" className="block focus:outline-none">
          <KPICard title="Pending" count={kpis.pendingRequests} subtitle="Awaiting review" color="saffron" icon={Clock} loading={loading} />
        </Link>
        <Link to="/admin/verified" className="block focus:outline-none">
          <KPICard title="Verified" count={kpis.verifiedProfiles} subtitle="Cleared for QR" color="green" icon={ShieldCheck} loading={loading} />
        </Link>
        <Link to="/admin/qr-management" className="block focus:outline-none">
          <KPICard title="Generated QR" count={kpis.generatedQRs} subtitle="Tags prepared" color="navy" icon={QrCode} loading={loading} />
        </Link>
        <Link to="/admin/qr-management" className="block focus:outline-none">
          <KPICard title="Active QR" count={kpis.activeQRs} subtitle="In field" color="green" icon={Activity} loading={loading} />
        </Link>
        <Link to="/admin/scan-history" className="block focus:outline-none">
          <KPICard title="Scan Events" count={kpis.recentScans} subtitle="Total telemetry" color="navy" icon={Radio} loading={loading} />
        </Link>
      </div>

      {/* 3. Safety Operations Status Pipeline (Full Width) */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2844A8]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Safety Operations Status</h3>
            <span className="text-[10px] text-gray-400 font-medium">· End-to-End Pilgrim Protection Lifecycle</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              GRID OPERATIONAL
            </span>
            <span className="text-xs font-bold text-gray-700">
              {kpis.totalParticipants > 0 ? `${verificationRate}% Verified` : '0%'}
            </span>
          </div>
        </div>

        {/* 5-Step Connected Pipeline */}
        <div className="relative pt-2 pb-2">
          {/* Connecting line behind stages for desktop */}
          <div className="hidden lg:block absolute top-10 left-12 right-12 h-1 bg-gray-100 rounded-full z-0">
            <div
              className="h-full bg-gradient-to-r from-[#2844A8] via-[#CA7A00] to-emerald-600 rounded-full transition-all duration-700"
              style={{
                width: kpis.totalParticipants === 0
                  ? '0%'
                  : kpis.activeQRs > 0
                  ? '100%'
                  : kpis.issuedQRs > 0
                  ? '75%'
                  : kpis.generatedQRs > 0
                  ? '50%'
                  : kpis.verifiedProfiles > 0
                  ? '25%'
                  : '5%',
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
            {/* Stage 1: Registration */}
            <div className="bg-gray-50/80 hover:bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col justify-between transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-full bg-[#2844A8] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  1
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#2844A8]">
                  BASE
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Stage 1: Registration</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-black text-gray-900">{kpis.totalParticipants}</span>
                  <span className="text-xs text-gray-500 font-medium">Profiles</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">100% Ingested</p>
              </div>
            </div>

            {/* Stage 2: Verified */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
              kpis.verifiedProfiles > 0
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-gray-50/80 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                  kpis.verifiedProfiles > 0
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  kpis.verifiedProfiles > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {verificationRate}%
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Stage 2: Verified</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-black text-emerald-700">{kpis.verifiedProfiles}</span>
                  <span className="text-xs text-gray-500 font-medium">Cleared</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {kpis.pendingRequests} awaiting review
                </p>
              </div>
            </div>

            {/* Stage 3: QR Generated */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
              kpis.generatedQRs > 0 || (kpis.issuedQRs + kpis.activeQRs > 0)
                ? 'bg-blue-50/50 border-blue-200'
                : 'bg-gray-50/80 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                  kpis.generatedQRs > 0 || (kpis.issuedQRs + kpis.activeQRs > 0)
                    ? 'bg-[#2844A8] text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#2844A8]">
                  {kpis.verifiedProfiles > 0 ? `${Math.round(((kpis.generatedQRs + kpis.issuedQRs + kpis.activeQRs) / kpis.verifiedProfiles) * 100)}%` : '0%'}
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Stage 3: QR Generated</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-black text-[#2844A8]">{kpis.generatedQRs}</span>
                  <span className="text-xs text-gray-500 font-medium">Prepared</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Print ready assets</p>
              </div>
            </div>

            {/* Stage 4: QR Issued */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
              kpis.issuedQRs > 0
                ? 'bg-amber-50/50 border-amber-200'
                : 'bg-gray-50/80 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                  kpis.issuedQRs > 0
                    ? 'bg-[#CA7A00] text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  4
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-[#CA7A00]">
                  DISPATCH
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Stage 4: QR Issued</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-black text-[#CA7A00]">{kpis.issuedQRs}</span>
                  <span className="text-xs text-gray-500 font-medium">Handed Over</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Awaiting field scan</p>
              </div>
            </div>

            {/* Stage 5: Active in Field */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
              kpis.activeQRs > 0
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                : 'bg-gray-50/80 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                  kpis.activeQRs > 0
                    ? 'bg-emerald-600 text-white animate-pulse'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  5
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  LIVE
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Stage 5: Active</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-black text-emerald-700">{kpis.activeQRs}</span>
                  <span className="text-xs text-gray-500 font-medium">In Field</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Field active telemetry</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Row: Verification Overview Funnel + QR Fulfillment Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Verification Overview Funnel */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Verification Overview Funnel</h3>
              </div>
              <Link to="/admin/pending" className="text-[11px] font-bold text-[#2844A8] hover:underline flex items-center gap-0.5">
                Review Pending <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Rate & Progress Bar */}
            <div className="mt-4 p-4 rounded-xl bg-gray-50/70 border border-gray-100">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600">Verification Completion Rate</span>
                <span className="text-2xl font-black text-emerald-700">{verificationRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${verificationRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2">
                <span>{kpis.verifiedProfiles} verified</span>
                <span>{kpis.totalParticipants} total profiles</span>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-4 gap-2 mt-4 text-center">
              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-lg font-bold text-gray-900">{kpis.totalParticipants}</div>
                <div className="text-[10px] font-semibold text-gray-500 mt-0.5">Total</div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="text-lg font-bold text-emerald-700">{kpis.verifiedProfiles}</div>
                <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">Verified</div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                <div className="text-lg font-bold text-[#CA7A00]">{kpis.pendingRequests}</div>
                <div className="text-[10px] font-semibold text-[#CA7A00] mt-0.5">Pending</div>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100">
                <div className="text-lg font-bold text-rose-700">{kpis.rejectedProfiles}</div>
                <div className="text-[10px] font-semibold text-rose-600 mt-0.5">Rejected</div>
              </div>
            </div>
          </div>

          {/* Zero Pending Banner or Pending Action */}
          <div>
            {kpis.pendingRequests === 0 ? (
              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">All current registrations reviewed — Zero backlog</span>
                </div>
                <Link to="/admin/verified" className="text-[11px] font-bold text-emerald-800 hover:underline shrink-0">
                  View Verified →
                </Link>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#CA7A00] shrink-0" />
                  <span className="font-semibold">{kpis.pendingRequests} profile(s) awaiting review</span>
                </div>
                <Link
                  to="/admin/pending"
                  className="px-3 py-1 rounded-lg bg-[#CA7A00] text-white font-bold text-[11px] hover:bg-[#A96400] transition-colors shrink-0 shadow-xs"
                >
                  Review Pending →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* QR Fulfillment Pipeline */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#2844A8]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">QR Fulfillment Pipeline</h3>
              </div>
              <Link to="/admin/qr-management" className="text-[11px] font-bold text-[#2844A8] hover:underline flex items-center gap-0.5">
                QR Inventory <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Active Deployment Rate & Progress Bar */}
            <div className="mt-4 p-4 rounded-xl bg-gray-50/70 border border-gray-100">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600">Active Field Deployment</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#2844A8]">{activeDeploymentRate}%</span>
                  <span className="text-[10px] text-gray-400 block">{totalQrFulfillment}% Issued/Active</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#2844A8] h-full rounded-full transition-all duration-700"
                  style={{ width: `${activeDeploymentRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2">
                <span>{kpis.activeQRs} active tags in field</span>
                <span>{kpis.verifiedProfiles} verified participants</span>
              </div>
            </div>

            {/* Stages Progression Grid */}
            <div className="grid grid-cols-4 gap-2 mt-4 text-center">
              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-lg font-bold text-gray-800">{kpis.requestedQRs}</div>
                <div className="text-[10px] font-semibold text-gray-500 mt-0.5">Requested</div>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                <div className="text-lg font-bold text-[#2844A8]">{kpis.generatedQRs}</div>
                <div className="text-[10px] font-semibold text-[#2844A8] mt-0.5">Generated</div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                <div className="text-lg font-bold text-[#CA7A00]">{kpis.issuedQRs}</div>
                <div className="text-[10px] font-semibold text-[#CA7A00] mt-0.5">Issued</div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="text-lg font-bold text-emerald-700">{kpis.activeQRs}</div>
                <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">Active</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs">
            <span className="text-blue-900 font-medium">Physical Card & Band Assets Management</span>
            <Link
              to="/admin/qr-management"
              className="px-3 py-1 rounded-lg bg-[#2844A8] text-white font-bold text-[11px] hover:bg-[#1E3482] transition-colors shrink-0 shadow-xs"
            >
              Open QR Inventory →
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Row: Field Telemetry Visual + Active Safety Tags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Field Telemetry Visual with Donut Chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Field Telemetry & GPS Coverage</h3>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/admin/scan-map" className="text-[11px] font-bold text-[#2844A8] hover:underline flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-rose-500 mr-0.5" /> Live Map <ExternalLink className="w-2.5 h-2.5 opacity-70 ml-0.5" />
                </Link>
              </div>
            </div>

            {/* Donut Chart + Details Row */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mt-4 p-4 rounded-xl bg-gray-50/70 border border-gray-100">
              <TelemetryDonut gpsScans={kpis.gpsScans} totalScans={kpis.recentScans} />
              <div className="flex-1 space-y-2 text-xs w-full">
                <div className="flex items-center justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#2844A8]" /> Total Scans Recorded
                  </span>
                  <span className="font-bold text-gray-900">{kpis.recentScans}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> GPS Coordinates Captured
                  </span>
                  <span className="font-bold text-emerald-700">{kpis.gpsScans}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-gray-400" /> Location Denied / No GPS
                  </span>
                  <span className="font-bold text-gray-500">{kpis.recentScans - kpis.gpsScans}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-semibold text-gray-700">GPS Acquisition Rate</span>
                  <span className="font-black text-emerald-700">{gpsRate}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Link
              to="/admin/scan-history"
              className="flex-1 text-center py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-xs"
            >
              Audit Scan History ({kpis.recentScans})
            </Link>
            <Link
              to="/admin/scan-map"
              className="flex-1 text-center py-2 text-xs font-bold text-white bg-[#2844A8] rounded-xl hover:bg-[#1E3482] transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-400" /> Open Live Map
            </Link>
          </div>
        </div>

        {/* Active Safety Tags Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Active Safety Tags in Field</h3>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE MONITORING
              </span>
            </div>

            {/* Hero Active Count */}
            <div className="mt-4 p-5 rounded-xl bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Field Protection Fleet</span>
                <div className="text-4xl font-black text-emerald-800 mt-1">{kpis.activeQRs}</div>
                <p className="text-xs text-gray-600 mt-1">Physical tags actively linked to verified pilgrim identities</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Activity className="w-7 h-7" />
              </div>
            </div>

            {/* Operational Tags Progression */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="text-lg font-bold text-emerald-800">{kpis.activeQRs}</div>
                <div className="text-[10px] font-bold text-emerald-700 mt-0.5">Active in Field</div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <div className="text-lg font-bold text-[#CA7A00]">{kpis.issuedQRs}</div>
                <div className="text-[10px] font-bold text-[#CA7A00] mt-0.5">Issued Tags</div>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-lg font-bold text-[#2844A8]">{kpis.generatedQRs}</div>
                <div className="text-[10px] font-bold text-[#2844A8] mt-0.5">Prepared QRs</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
            <Link to="/admin/pending" className="flex-1 text-center py-2 text-[11px] font-bold rounded-lg bg-[#FFF4E6] text-[#CA7A00] hover:bg-[#FFE8CC] transition-colors border border-amber-300 shadow-xs">
              Verify ({kpis.pendingRequests})
            </Link>
            <Link to="/admin/qr-management" className="flex-1 text-center py-2 text-[11px] font-bold rounded-lg bg-[#2844A8]/10 text-[#2844A8] hover:bg-[#2844A8]/20 transition-colors border border-blue-200 shadow-xs">
              Print / Issue
            </Link>
            <Link to="/admin/scan-map" className="flex-1 text-center py-2 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors border border-emerald-200 shadow-xs">
              Live Map
            </Link>
          </div>
        </div>
      </div>

      {/* 6. Row: Live Safety Activity Timeline + Operational Readiness Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Live Safety Activity Timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2844A8]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Live Safety Activity Timeline</h3>
              </div>
              <Link to="/admin/scan-history" className="text-[11px] font-bold text-[#2844A8] hover:underline flex items-center gap-0.5">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="p-8 text-center text-xs text-gray-400">Loading live telemetry...</div>
              ) : recentScans.length === 0 ? (
                <div className="p-8 text-center">
                  <EmptyState
                    title="No Scan Events Yet"
                    description="Field scans from finders and pilgrims will appear here with live GPS coordinates."
                    icon={Radio}
                  />
                </div>
              ) : (
                <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                  {recentScans.map((ev) => (
                    <div key={ev.id} className="relative group">
                      {/* Timeline dot */}
                      <span className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${
                        ev.latitude !== null ? 'bg-emerald-500' : 'bg-gray-400'
                      }`} />

                      <div className="bg-gray-50/80 hover:bg-gray-50 p-3.5 rounded-xl border border-gray-200 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-xs text-[#2844A8]">{ev.safety_id || 'N/A'}</span>
                              <span className="font-semibold text-xs text-gray-900">{ev.safety_profile?.name || 'Safety Asset'}</span>
                              {ev.latitude !== null ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> GPS Fix
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 rounded text-[10px]">
                                  <XCircle className="w-3 h-3 text-gray-400" /> No GPS
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-2">
                              <span>{timeAgo(ev.scanned_at)}</span>
                              <span>·</span>
                              <span>{new Date(ev.scanned_at).toLocaleString('en-IN', {
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}</span>
                            </div>
                          </div>

                          {/* Action Button: Track Location */}
                          {ev.latitude !== null && ev.longitude !== null && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${ev.latitude},${ev.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-[#2844A8] rounded-lg hover:bg-[#1E3482] transition-colors shadow-xs shrink-0"
                            >
                              <Navigation className="w-3 h-3" />
                              Track Location
                              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
            <Link to="/admin/scan-history" className="text-xs font-bold text-[#2844A8] hover:underline">
              View all {kpis.recentScans} scan records in Audit Log →
            </Link>
          </div>
        </div>

        {/* Operational Readiness Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Operational Readiness Summary</h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {readinessPct}% Complete
              </span>
            </div>

            <div className="p-5 space-y-3">
              {/* Readiness Progress Bar */}
              <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-600">Pandharpur Deployment Score</span>
                  <span className="text-xs font-bold text-gray-900">{completedMilestones} of {milestones.length} Milestones Achieved</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-700"
                    style={{ width: `${readinessPct}%` }}
                  />
                </div>
              </div>

              {/* Factual Milestone Checklist */}
              <div className="space-y-2.5 pt-1">
                {milestones.map((m) => (
                  <div key={m.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-gray-50/60 border border-gray-100">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        m.done ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{m.title}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">{m.desc}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      m.done
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {m.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
            <span className="text-xs text-gray-500">
              Verified operational statistics computed exclusively from live Supabase tables
            </span>
          </div>
        </div>
      </div>

      {/* 7. Pending Verification Requests Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#CA7A00]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Pending Verification Requests</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-[#CA7A00] border border-amber-200">
              {kpis.pendingRequests}
            </span>
          </div>
          <Link to="/admin/pending" className="text-[11px] font-bold text-[#2844A8] hover:underline flex items-center gap-0.5">
            View All Pending ({kpis.pendingRequests}) <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching pending registrations..." />
        ) : error ? (
          <div className="p-6 text-center text-xs text-red-600 bg-red-50">
            <AlertCircle className="w-5 h-5 mx-auto mb-2 text-red-500" />
            <p className="font-semibold">{error}</p>
          </div>
        ) : pendingProfiles.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="All Registrations Reviewed"
              description="There are currently no pending profiles awaiting admin verification. New registrations from the mobile app will appear here automatically."
              icon={ShieldCheck}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Safety ID</th>
                  <th className="py-3 px-5">Subject Name</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {pendingProfiles.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-5 font-mono font-bold text-[#2844A8]">
                      {p.safety_id}
                    </td>
                    <td className="py-3 px-5 font-semibold text-gray-900">
                      {p.name}
                    </td>
                    <td className="py-3 px-5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                        {p.profile_type}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <StatusBadge status={p.qr_status} />
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedProfile(p)}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-xs"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleVerify(p.id)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
                        >
                          Verify
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
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
