import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  QrCode, 
  Radio, 
  Activity, 
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { KPICard } from '../../components/admin/KPICard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ProfileDetailModal } from '../../components/admin/ProfileDetailModal';
import { QRGenerationModal } from '../../components/admin/QRGenerationModal';
import { safetyService, DashboardKPIs } from '../../services/safetyService';
import { SafetyProfile } from '../../types/database';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Link } from 'react-router-dom';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProfile, setSelectedProfile] = useState<SafetyProfile | null>(null);
  const [qrModalProfile, setQrModalProfile] = useState<SafetyProfile | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      const [kpiData, pendingData] = await Promise.all([
        safetyService.getDashboardKPIs(),
        safetyService.getProfiles({ status: 'PENDING_REVIEW', limit: 10 }),
      ]);
      setKpis(kpiData);
      setPendingProfiles(pendingData);
    } catch (err: any) {
      console.error('Failed to load command center data:', err);
      setError(err.message || 'Error communicating with Supabase');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleVerify = async (id: string) => {
    await safetyService.verifyProfile(id);
    await loadData();
  };

  const handleReject = async (id: string) => {
    await safetyService.rejectProfile(id);
    await loadData();
  };

  return (
    <div className="space-y-6">
      {/* Configuration Alert if Anon key is missing */}
      {!isSupabaseConfigured && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-[#CA7A00] shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-amber-900 mb-0.5">Supabase Anon Key Configuration Required</h4>
            <p className="text-amber-800">
              The application is configured for project <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">https://jcinxlylijhteujzxyow.supabase.co</code>.
              Please add your publishable anon key to <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">.env.local</code> as <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">VITE_SUPABASE_ANON_KEY</code> to enable live database queries.
            </p>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">
              MAULINOND / MARGDARSHAK ADMIN COMMAND CENTER
            </h2>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF4E6] text-[#CA7A00] border border-amber-300">
              SAFETY GRID
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time situational awareness • Cloud Synchronized
          </p>
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

      {/* KPI Cards Row (Real Counts) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <KPICard
          title="Pending Requests"
          count={kpis.pendingRequests}
          subtitle="Awaiting admin verification"
          color="saffron"
          icon={Clock}
          loading={loading}
        />
        <KPICard
          title="Verified Profiles"
          count={kpis.verifiedProfiles}
          subtitle="Cleared for QR tag issue"
          color="green"
          icon={ShieldCheck}
          loading={loading}
        />
        <KPICard
          title="Generated QR"
          count={kpis.generatedQRs}
          subtitle="Digital tags prepared"
          color="navy"
          icon={QrCode}
          loading={loading}
        />
        <KPICard
          title="Active QR"
          count={kpis.activeQRs}
          subtitle="Operational in field"
          color="green"
          icon={Activity}
          loading={loading}
        />
        <KPICard
          title="Recent Scans"
          count={kpis.recentScans}
          subtitle="Telemetry events recorded"
          color="navy"
          icon={Radio}
          loading={loading}
        />
      </div>

      {/* Live Status & Quick Action Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live Safety Status Card */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Live Safety Status
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              NORMAL / SECURE
            </span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            All registered Family Safety bands and emergency telemetry relays are active. No critical SOS alerts or tampering flagged in current window.
          </p>
          <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
            <span>Verified Ratio:</span>
            <span className="font-bold text-gray-900">
              {kpis.totalParticipants > 0
                ? `${Math.round((kpis.verifiedProfiles / kpis.totalParticipants) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white to-[#FFF4E6]/30 rounded-xl p-5 border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
              Operational Actions
            </span>
            <h3 className="text-sm font-bold text-gray-900">
              Quick Safety Tag Management
            </h3>
            <p className="text-xs text-gray-600 mt-1 max-w-xl">
              Verify pilgrim registrations submitted via the MargDarshak mobile app, issue high-resolution physical cards/wristbands, and inspect field scan telemetry.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
            <Link
              to="/admin/pending"
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#CA7A00] text-white hover:bg-[#A96400] transition-colors shadow-xs"
            >
              Review Pending ({kpis.pendingRequests})
            </Link>
            <Link
              to="/admin/qr-management"
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2844A8] text-white hover:bg-[#1E3482] transition-colors shadow-xs"
            >
              QR Inventory
            </Link>
            <Link
              to="/admin/scan-map"
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
            >
              Open Live Scan Map
            </Link>
          </div>
        </div>
      </div>

      {/* Pending QR Requests Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Pending QR Verification Requests
            </h3>
            <p className="text-xs text-gray-500">
              Registrations awaiting verification from the MargDarshak Flutter app
            </p>
          </div>
          <Link
            to="/admin/pending"
            className="text-xs font-semibold text-[#2844A8] hover:underline inline-flex items-center"
          >
            View all pending ({kpis.pendingRequests}) &rarr;
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching pending requests from Supabase..." />
        ) : error ? (
          <div className="p-6 text-center text-xs text-red-600 bg-red-50">
            <AlertCircle className="w-5 h-5 mx-auto mb-2 text-red-500" />
            <p className="font-semibold">{error}</p>
          </div>
        ) : pendingProfiles.length === 0 ? (
          <EmptyState
            title="No Pending Verification Requests"
            description="All family safety profiles and accessories have been reviewed and verified."
            icon={ShieldCheck}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Photo</th>
                  <th className="py-3 px-4">Safety ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Age / Rel</th>
                  <th className="py-3 px-4">QR Status</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {pendingProfiles.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      {p.photo_url ? (
                        <img
                          src={p.photo_url}
                          alt={p.name}
                          className="w-9 h-9 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                          {p.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#2844A8]">
                      {p.safety_id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {p.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        {p.profile_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {p.profile_type === 'DEPENDENT' && p.family_profile ? (
                        <span>
                          {p.family_profile.age ? `${p.family_profile.age} yrs` : 'N/A'}{' '}
                          {p.family_profile.relationship ? `(${p.family_profile.relationship})` : ''}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.qr_status} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setSelectedProfile(p)}
                          className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 shadow-xs"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleVerify(p.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 rounded hover:bg-emerald-700 shadow-xs"
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

      {/* Detail Modal */}
      <ProfileDetailModal
        profile={selectedProfile}
        isOpen={selectedProfile !== null}
        onClose={() => setSelectedProfile(null)}
        onVerify={handleVerify}
        onReject={handleReject}
        onGenerateQR={(p) => {
          setSelectedProfile(null);
          setQrModalProfile(p);
        }}
      />

      {/* QR Generation Modal */}
      <QRGenerationModal
        profile={qrModalProfile}
        isOpen={qrModalProfile !== null}
        onClose={() => setQrModalProfile(null)}
        onStatusChanged={loadData}
      />
    </div>
  );
};
