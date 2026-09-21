import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, UserX } from 'lucide-react';
import { safetyService } from '../../services/safetyService';
import { SafetyProfile } from '../../types/database';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ProfileDetailModal } from '../../components/admin/ProfileDetailModal';

export const RejectedProfiles: React.FC = () => {
  const [profiles, setProfiles] = useState<SafetyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<SafetyProfile | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await safetyService.getProfiles({
        status: 'REJECTED',
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

  const handleReverify = async (id: string) => {
    await safetyService.verifyProfile(id);
    await loadData();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search rejected by Safety ID or Name..."
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserX className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-gray-900">
              Rejected Registrations ({profiles.length})
            </h3>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading rejected profiles..." />
        ) : profiles.length === 0 ? (
          <EmptyState
            title="No Rejected Registrations"
            description="No applications have been rejected."
            icon={UserX}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Safety ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date Submitted</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-[#2844A8]">
                      {p.safety_id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {p.name}
                    </td>
                    <td className="py-3 px-4">{p.profile_type}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(p.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedProfile(p)}
                        className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 mr-2"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleReverify(p.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 rounded hover:bg-emerald-700"
                      >
                        Re-verify
                      </button>
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
        onVerify={handleReverify}
        onReject={async () => {}}
      />
    </div>
  );
};
