import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, ShieldCheck, QrCode, Printer, RotateCw } from 'lucide-react';
import { safetyService } from '../../services/safetyService';
import { qrService } from '../../services/qrService';
import { SafetyProfile } from '../../types/database';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ProfileDetailModal } from '../../components/admin/ProfileDetailModal';
import { QRGenerationModal } from '../../components/admin/QRGenerationModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

export const VerifiedProfiles: React.FC = () => {
  const [profiles, setProfiles] = useState<SafetyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<SafetyProfile | null>(null);
  const [qrModalProfile, setQrModalProfile] = useState<SafetyProfile | null>(null);
  const [regenerateTarget, setRegenerateTarget] = useState<SafetyProfile | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await safetyService.getProfiles({
        status: 'VERIFIED',
        searchQuery: searchTerm,
      });
      setProfiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRegenerate = async () => {
    if (!regenerateTarget) return;
    setIsRegenerating(true);
    try {
      await qrService.regenerateQR(regenerateTarget.safety_id, regenerateTarget.id);
      setRegenerateTarget(null);
      await loadData();
    } catch (err: any) {
      alert(`Regeneration failed: ${err.message}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search verified by Safety ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2844A8] focus:bg-white"
          />
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin text-[#2844A8]' : 'text-gray-500'}`} />
          Refresh
        </button>
      </div>

      {/* Verified List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-gray-900">
              Verified Profiles & QR Issuance ({profiles.length})
            </h3>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading verified profiles..." />
        ) : profiles.length === 0 ? (
          <EmptyState
            title="No Verified Profiles"
            description="Verified family safety profiles and accessories will be listed here for QR preparation."
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
                  <th className="py-3 px-4">QR Status</th>
                  <th className="py-3 px-4">Last Telemetry</th>
                  <th className="py-3 px-4 text-right">QR Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {profiles.map((p) => {
                  const hasQR = p.qr_status === 'GENERATED' || p.qr_status === 'ISSUED' || p.qr_status === 'ACTIVE';

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4">
                        {p.photo_url ? (
                          <img
                            src={p.photo_url}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">
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
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                          {p.profile_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={p.qr_status} />
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {p.last_scanned_at ? (
                          <span className="text-emerald-700 font-medium">
                            {new Date(p.last_scanned_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        ) : (
                          <span className="text-gray-400">Never Scanned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setSelectedProfile(p)}
                            className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            View
                          </button>

                          {hasQR ? (
                            <>
                              <button
                                onClick={() => setQrModalProfile(p)}
                                className="flex items-center px-2.5 py-1 text-xs font-semibold text-[#2844A8] bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                              >
                                <Printer className="w-3 h-3 mr-1" />
                                Print / Export
                              </button>
                              <button
                                onClick={() => setRegenerateTarget(p)}
                                title="Regenerate QR"
                                className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100"
                              >
                                <RotateCw className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setQrModalProfile(p)}
                              className="flex items-center px-3 py-1 text-xs font-semibold text-white bg-[#2844A8] rounded-lg hover:bg-[#1E3482] shadow-xs"
                            >
                              <QrCode className="w-3 h-3 mr-1" />
                              Generate QR
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProfileDetailModal
        profile={selectedProfile}
        isOpen={selectedProfile !== null}
        onClose={() => setSelectedProfile(null)}
        onVerify={async () => {}}
        onReject={async () => {}}
        onGenerateQR={(p) => {
          setSelectedProfile(null);
          setQrModalProfile(p);
        }}
      />

      <QRGenerationModal
        profile={qrModalProfile}
        isOpen={qrModalProfile !== null}
        onClose={() => setQrModalProfile(null)}
        onStatusChanged={loadData}
      />

      {/* Explicit Regeneration Confirmation */}
      <ConfirmationModal
        isOpen={regenerateTarget !== null}
        title="Regenerate Safety QR"
        message={`Are you sure you want to regenerate the QR code for Safety ID ${regenerateTarget?.safety_id}? Any previously printed tags will continue pointing to the same public safety URL, but digital records will refresh.`}
        confirmLabel="Regenerate Now"
        variant="warning"
        isLoading={isRegenerating}
        onConfirm={handleRegenerate}
        onClose={() => setRegenerateTarget(null)}
      />
    </div>
  );
};
