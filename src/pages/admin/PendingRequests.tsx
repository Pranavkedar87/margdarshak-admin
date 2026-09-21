import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Clock } from 'lucide-react';
import { safetyService } from '../../services/safetyService';
import { SafetyProfile } from '../../types/database';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ProfileDetailModal } from '../../components/admin/ProfileDetailModal';
import { QRGenerationModal } from '../../components/admin/QRGenerationModal';

export const PendingRequests: React.FC = () => {
  const [profiles, setProfiles] = useState<SafetyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<SafetyProfile | null>(null);
  const [qrModalProfile, setQrModalProfile] = useState<SafetyProfile | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await safetyService.getProfiles({
        status: 'PENDING_REVIEW',
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

  const handleVerify = async (id: string) => {
    await safetyService.verifyProfile(id);
    await loadData();
  };

  const handleReject = async (id: string) => {
    await safetyService.rejectProfile(id);
    await loadData();
  };

  return (
    <div className="space-y-5">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Safety ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2844A8] focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin text-[#2844A8]' : 'text-gray-500'}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-gray-900">
              Registrations Awaiting Verification ({profiles.length})
            </h3>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading pending registrations..." />
        ) : profiles.length === 0 ? (
          <EmptyState
            title="No Pending Registrations Found"
            description={searchTerm ? 'No requests match your search criteria.' : 'All registrations have been reviewed.'}
            icon={Clock}
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
                  <th className="py-3 px-4">Guardian / Owner</th>
                  <th className="py-3 px-4">QR Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      {p.photo_url ? (
                        <img
                          src={p.photo_url}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
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
                    <td className="py-3 px-4 text-gray-700">
                      {p.family_profile?.guardian_name || 'Registered User'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.qr_status} />
                    </td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setSelectedProfile(p)}
                          className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-xs"
                        >
                          View Detail
                        </button>
                        <button
                          onClick={() => handleReject(p.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 shadow-xs"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleVerify(p.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-xs"
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

      <QRGenerationModal
        profile={qrModalProfile}
        isOpen={qrModalProfile !== null}
        onClose={() => setQrModalProfile(null)}
        onStatusChanged={loadData}
      />
    </div>
  );
};
