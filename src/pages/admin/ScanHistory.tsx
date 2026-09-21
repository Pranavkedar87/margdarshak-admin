import React, { useState, useEffect, useCallback } from 'react';
import { History, Search, RefreshCw, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { scanService } from '../../services/scanService';
import { QRScanEvent } from '../../types/database';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const ScanHistory: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<QRScanEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await scanService.getScanEvents(150);
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredEvents = events.filter((ev) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      ev.safety_id?.toLowerCase().includes(term) ||
      ev.safety_profile?.name?.toLowerCase().includes(term) ||
      ev.location_name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search scans by Safety ID, Name, or Location..."
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
          Refresh Scans
        </button>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-bold text-gray-900">
              Audit Telemetry Log ({filteredEvents.length})
            </h3>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Querying real scan events from Supabase..." />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="No Scan Events Recorded"
            description="When physical cards or stickers are scanned by finders with location enabled, real-time GPS telemetry will appear here."
            icon={History}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Safety ID</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Scan Timestamp</th>
                  <th className="py-3 px-4">Real Coordinates</th>
                  <th className="py-3 px-4">Location Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-[#2844A8]">
                      {ev.safety_id || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {ev.safety_profile?.name || 'Registered Profile'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {new Date(ev.scanned_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600">
                      {ev.latitude !== null && ev.longitude !== null ? (
                        <span>
                          {ev.latitude.toFixed(5)}, {ev.longitude.toFixed(5)}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">No GPS attached</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {ev.location_name || <span className="text-gray-400 italic">Unavailable</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {ev.status || 'RECORDED'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {ev.latitude !== null && ev.longitude !== null && (
                        <button
                          onClick={() => navigate('/admin/scan-map')}
                          className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-[#2844A8] bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
                        >
                          <MapPin className="w-3 h-3 mr-1 text-rose-500" />
                          View on Map
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
