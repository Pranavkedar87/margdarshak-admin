import React, { useState, useEffect, useCallback } from 'react';
import { History, Search, RefreshCw, MapPin, Navigation, ExternalLink, Eye, X, CheckCircle2, XCircle } from 'lucide-react';
import { scanService } from '../../services/scanService';
import { QRScanEvent } from '../../types/database';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface DetailDrawerProps {
  event: QRScanEvent | null;
  onClose: () => void;
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({ event, onClose }) => {
  if (!event) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="relative w-full max-w-sm bg-white h-full shadow-2xl overflow-y-auto border-l border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Scan Event Detail</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-4 text-xs">
          <div className="bg-[#2844A8]/5 rounded-xl p-4 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#2844A8]">Safety ID</p>
            <p className="font-mono font-bold text-lg text-[#2844A8]">{event.safety_id || 'N/A'}</p>
          </div>
          <div className="space-y-0 border border-gray-100 rounded-xl overflow-hidden">
            {[
              { label: 'Subject', value: event.safety_profile?.name || '—' },
              {
                label: 'Scan Time',
                value: new Date(event.scanned_at).toLocaleString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })
              },
              {
                label: 'GPS',
                value: event.latitude !== null ? '✓ Permission Granted' : '✗ Permission Denied',
                className: event.latitude !== null ? 'text-emerald-700' : 'text-gray-400',
              },
              { label: 'Latitude', value: event.latitude !== null ? event.latitude.toFixed(6) : '—', mono: true },
              { label: 'Longitude', value: event.longitude !== null ? event.longitude.toFixed(6) : '—', mono: true },
              { label: 'Location Name', value: event.location_name || '—' },
              { label: 'Status', value: event.status || 'RECORDED' },
            ].map(({ label, value, className, mono }) => (
              <div key={label} className="flex justify-between items-center px-4 py-2.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50">
                <span className="text-gray-500">{label}</span>
                <span className={`font-semibold text-right ${className || 'text-gray-900'} ${mono ? 'font-mono' : ''}`}>{value}</span>
              </div>
            ))}
          </div>
          {event.latitude !== null && event.longitude !== null && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#2844A8] text-white text-xs font-bold hover:bg-[#1E3482] transition-colors shadow-sm"
            >
              <Navigation className="w-4 h-4" />
              Open in Google Maps
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export const ScanHistory: React.FC = () => {
  const [events, setEvents] = useState<QRScanEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<QRScanEvent | null>(null);

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

  useEffect(() => { loadData(); }, [loadData]);

  const filteredEvents = events.filter((ev) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      ev.safety_id?.toLowerCase().includes(term) ||
      ev.safety_profile?.name?.toLowerCase().includes(term) ||
      ev.location_name?.toLowerCase().includes(term)
    );
  });

  const gpsCount = events.filter(e => e.latitude !== null).length;

  return (
    <div className="space-y-5">
      {selectedEvent && (
        <DetailDrawer event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <History className="w-4 h-4 text-[#2844A8]" />
              Audit Telemetry Log
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {events.length} total scan events · {gpsCount} with GPS · {events.length - gpsCount} location denied
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by ID, name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2844A8] focus:bg-white w-48"
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
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Querying real scan events from Supabase..." />
        ) : filteredEvents.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No Scan Events Recorded"
              description="When physical cards or stickers are scanned by finders with location enabled, real-time GPS telemetry will appear here."
              icon={History}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Safety ID</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Scan Time</th>
                  <th className="py-3 px-4">Coordinates</th>
                  <th className="py-3 px-4 text-center">GPS</th>
                  <th className="py-3 px-4">Track Location</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#2844A8]">
                      {ev.safety_id || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900">{ev.safety_profile?.name || '—'}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      <div>{new Date(ev.scanned_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{timeAgo(ev.scanned_at)}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600">
                      {ev.latitude !== null && ev.longitude !== null ? (
                        <span className="text-[11px]">
                          {ev.latitude.toFixed(5)}, {ev.longitude.toFixed(5)}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">No GPS</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {ev.latitude !== null ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> GPS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-50 text-gray-400 border border-gray-200 rounded text-[10px]">
                          <XCircle className="w-3 h-3" /> None
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {ev.latitude !== null && ev.longitude !== null ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${ev.latitude},${ev.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-[#2844A8] rounded-lg hover:bg-[#1E3482] transition-colors shadow-xs"
                        >
                          <Navigation className="w-3 h-3" />
                          Track Location
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed">
                          <MapPin className="w-3 h-3" />
                          No GPS
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedEvent(ev)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
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
