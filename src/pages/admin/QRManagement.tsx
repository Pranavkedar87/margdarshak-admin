import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  QrCode, 
  Search, 
  RefreshCw, 
  Printer, 
  CheckCircle2, 
  Send, 
  PauseCircle, 
  Ban, 
  ExternalLink
} from 'lucide-react';
import { safetyService } from '../../services/safetyService';
import { qrService } from '../../services/qrService';
import { SafetyProfile, QRStatus } from '../../types/database';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { QRGenerationModal } from '../../components/admin/QRGenerationModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

export const QRManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as QRStatus) || undefined;

  const [profiles, setProfiles] = useState<SafetyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfileForQR, setSelectedProfileForQR] = useState<SafetyProfile | null>(null);

  // Status transition confirmation state
  const [actionTarget, setActionTarget] = useState<{
    profile: SafetyProfile;
    newStatus: QRStatus;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'primary';
  } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await safetyService.getProfiles({
        qrStatus: currentTab,
        searchQuery: searchTerm,
      });
      setProfiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentTab, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = (status?: QRStatus) => {
    if (status) {
      setSearchParams({ tab: status });
    } else {
      setSearchParams({});
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!actionTarget) return;
    setIsUpdatingStatus(true);
    try {
      await qrService.updateQRStatus(
        actionTarget.profile.safety_id,
        actionTarget.profile.id,
        actionTarget.newStatus
      );
      setActionTarget(null);
      await loadData();
    } catch (err: any) {
      alert(`Status transition failed: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const tabs: { label: string; value?: QRStatus }[] = [
    { label: 'All Tags', value: undefined },
    { label: 'Requested', value: 'REQUESTED' },
    { label: 'Generated', value: 'GENERATED' },
    { label: 'Issued', value: 'ISSUED' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Suspended', value: 'SUSPENDED' },
    { label: 'Revoked', value: 'REVOKED' },
  ];

  return (
    <div className="space-y-5">
      {/* Search & Tabs */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by Safety ID or Name..."
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

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1 border-t border-gray-100 pt-3">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.value;
            return (
              <button
                key={tab.label}
                onClick={() => handleTabChange(tab.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#2844A8] text-white shadow-xs'
                    : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main QR Inventory Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode className="w-4 h-4 text-[#2844A8]" />
            <h3 className="text-sm font-bold text-gray-900">
              Safety Tags & QR Code Records ({profiles.length})
            </h3>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Querying QR code inventory..." />
        ) : profiles.length === 0 ? (
          <EmptyState
            title="No QR Records Found"
            description={currentTab ? `No safety profiles currently match '${currentTab}' status.` : 'No profiles available.'}
            icon={QrCode}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Safety ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Lifecycle Status</th>
                  <th className="py-3 px-4">Last Scanned</th>
                  <th className="py-3 px-4 text-right">Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/70">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#2844A8]">{p.safety_id}</div>
                      <a
                        href={`/safety/${p.safety_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-gray-400 hover:text-[#2844A8] inline-flex items-center gap-1 mt-0.5"
                      >
                        <span>View Public URL</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{p.name}</td>
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
                        <span className="text-gray-400">Never</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Print / Export button */}
                        <button
                          onClick={() => setSelectedProfileForQR(p)}
                          className="flex items-center px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 shadow-xs"
                          title="Print or Export QR"
                        >
                          <Printer className="w-3 h-3 mr-1" />
                          Print / Export
                        </button>

                        {/* Lifecycle buttons */}
                        {p.qr_status === 'GENERATED' && (
                          <button
                            onClick={() =>
                              setActionTarget({
                                profile: p,
                                newStatus: 'ISSUED',
                                title: 'Mark Safety Tag as Issued',
                                message: `Mark tag ${p.safety_id} as physically handed over or shipped to the pilgrim?`,
                                variant: 'primary',
                              })
                            }
                            className="flex items-center px-2 py-1 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 shadow-xs"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Mark Issued
                          </button>
                        )}

                        {p.qr_status === 'ISSUED' && (
                          <button
                            onClick={() =>
                              setActionTarget({
                                profile: p,
                                newStatus: 'ACTIVE',
                                title: 'Activate Safety Tag',
                                message: `Activate safety monitoring for tag ${p.safety_id}?`,
                                variant: 'primary',
                              })
                            }
                            className="flex items-center px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 shadow-xs"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Activate
                          </button>
                        )}

                        {p.qr_status === 'ACTIVE' && (
                          <button
                            onClick={() =>
                              setActionTarget({
                                profile: p,
                                newStatus: 'SUSPENDED',
                                title: 'Suspend Safety Tag',
                                message: `Are you sure you want to temporarily suspend ${p.safety_id}? The public page will show a temporary inactive message and hide emergency info.`,
                                variant: 'warning',
                              })
                            }
                            className="flex items-center px-2 py-1 text-xs font-semibold text-amber-800 bg-yellow-50 border border-yellow-300 rounded hover:bg-yellow-100 shadow-xs"
                          >
                            <PauseCircle className="w-3 h-3 mr-1" />
                            Suspend
                          </button>
                        )}

                        {p.qr_status === 'SUSPENDED' && (
                          <button
                            onClick={() =>
                              setActionTarget({
                                profile: p,
                                newStatus: 'ACTIVE',
                                title: 'Reactivate Safety Tag',
                                message: `Re-activate safety tag ${p.safety_id}? Public safety info will be restored.`,
                                variant: 'primary',
                              })
                            }
                            className="flex items-center px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 shadow-xs"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Re-activate
                          </button>
                        )}

                        {p.qr_status !== 'REVOKED' && (
                          <button
                            onClick={() =>
                              setActionTarget({
                                profile: p,
                                newStatus: 'REVOKED',
                                title: 'Revoke Safety Tag Permanently',
                                message: `CRITICAL ACTION: Are you sure you want to REVOKE tag ${p.safety_id}? This is permanent and prevents any further usage of this physical tag.`,
                                variant: 'danger',
                              })
                            }
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200"
                            title="Revoke Tag"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <QRGenerationModal
        profile={selectedProfileForQR}
        isOpen={selectedProfileForQR !== null}
        onClose={() => setSelectedProfileForQR(null)}
        onStatusChanged={loadData}
      />

      <ConfirmationModal
        isOpen={actionTarget !== null}
        title={actionTarget?.title || 'Confirm Action'}
        message={actionTarget?.message || ''}
        variant={actionTarget?.variant || 'warning'}
        isLoading={isUpdatingStatus}
        onConfirm={handleConfirmStatusChange}
        onClose={() => setActionTarget(null)}
      />
    </div>
  );
};
