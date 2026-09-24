import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, RefreshCw, ExternalLink, Navigation, Maximize2, Radio, CheckCircle2, Clock } from 'lucide-react';
import { scanService } from '../../services/scanService';
import { QRScanEvent } from '../../types/database';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

const containerStyle = { width: '100%', height: '100%' };

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export const ScanMap: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [allEvents, setAllEvents] = useState<QRScanEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<QRScanEvent | null>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await scanService.getScanEvents(200);
      setAllEvents(data);
      setSelectedEvent(null);
    } catch (err) {
      console.error('ScanMap error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const gpsEvents = useMemo(() =>
    allEvents.filter(ev => ev.latitude !== null && ev.longitude !== null && !isNaN(ev.latitude!) && !isNaN(ev.longitude!)),
    [allEvents]
  );

  const defaultCenter = useMemo(() => {
    if (gpsEvents.length > 0) return { lat: gpsEvents[0].latitude!, lng: gpsEvents[0].longitude! };
    return { lat: 17.6775, lng: 75.3278 };
  }, [gpsEvents]);

  const latestScan = allEvents.length > 0 ? allEvents[0] : null;

  const handleFitAll = useCallback(() => {
    if (!mapRef || gpsEvents.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    gpsEvents.forEach(ev => bounds.extend({ lat: ev.latitude!, lng: ev.longitude! }));
    mapRef.fitBounds(bounds);
  }, [mapRef, gpsEvents]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
              Live Safety Tracking Map
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Real GPS locations from QR scans — Google Maps powered
            </p>
          </div>
          <div className="flex items-center gap-2">
            {gpsEvents.length > 0 && (
              <button
                onClick={handleFitAll}
                disabled={!isLoaded}
                className="flex items-center px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-xs"
              >
                <Maximize2 className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                Fit All
              </button>
            )}
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

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-xs text-center">
          <div className="text-2xl font-extrabold text-[#2844A8]">{allEvents.length}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Total Scans</div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-xs text-center">
          <div className="text-2xl font-extrabold text-emerald-600">{gpsEvents.length}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">GPS Enabled</div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-xs text-center">
          <div className="text-2xl font-extrabold text-[#CA7A00]">{allEvents.length - gpsEvents.length}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Location Denied</div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-xs text-center">
          <div className="text-xs font-bold text-gray-900 truncate leading-snug">
            {latestScan ? timeAgo(latestScan.scanned_at) : '—'}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">Latest Scan</div>
        </div>
      </div>

      {/* Main Area: Map + Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden" style={{ height: '520px' }}>
          {loading || !isLoaded ? (
            <div className="h-full flex items-center justify-center">
              <LoadingSpinner message="Loading GPS scan telemetry..." />
            </div>
          ) : gpsEvents.length === 0 ? (
            <div className="h-full flex items-center justify-center p-6">
              <EmptyState
                title="No GPS Scans Recorded Yet"
                description="When a finder grants location permission on a safety page, their coordinates will appear here."
                icon={MapPin}
              />
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={defaultCenter}
              zoom={12}
              onLoad={(map) => setMapRef(map)}
              options={{ streetViewControl: false, mapTypeControl: true, fullscreenControl: true }}
            >
              {gpsEvents.map((ev) => (
                <Marker
                  key={ev.id}
                  position={{ lat: ev.latitude!, lng: ev.longitude! }}
                  onClick={() => setSelectedEvent(ev)}
                />
              ))}
              {selectedEvent && selectedEvent.latitude !== null && selectedEvent.longitude !== null && (
                <InfoWindow
                  position={{ lat: selectedEvent.latitude, lng: selectedEvent.longitude }}
                  onCloseClick={() => setSelectedEvent(null)}
                >
                  <div className="text-xs p-1 space-y-2 min-w-[200px]">
                    <div className="font-bold text-[#2844A8] font-mono">{selectedEvent.safety_id || 'N/A'}</div>
                    <div className="font-semibold text-gray-900">{selectedEvent.safety_profile?.name || '—'}</div>
                    <div className="text-gray-500 font-mono text-[11px]">
                      {selectedEvent.latitude?.toFixed(5)}, {selectedEvent.longitude?.toFixed(5)}
                    </div>
                    <div className="text-gray-400 text-[10px]">
                      {new Date(selectedEvent.scanned_at).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedEvent.latitude},${selectedEvent.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] font-bold text-[#2844A8] hover:underline pt-1 border-t border-gray-100"
                    >
                      <Navigation className="w-3 h-3" /> Open in Google Maps
                    </a>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          )}
        </div>

        {/* Side Panel */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden flex flex-col" style={{ height: '520px' }}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
            <Clock className="w-4 h-4 text-gray-400" />
            <h3 className="text-xs font-bold text-gray-900">Latest GPS Scans</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="p-4 text-center text-xs text-gray-400">Loading...</div>
            ) : gpsEvents.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">No GPS scans yet.</div>
            ) : (
              gpsEvents.map((ev) => (
                <div
                  key={ev.id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedEvent?.id === ev.id ? 'bg-blue-50 border-l-2 border-[#2844A8]' : ''
                  }`}
                  onClick={() => setSelectedEvent(ev)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-mono font-bold text-[#2844A8] text-[11px] truncate">{ev.safety_id || 'N/A'}</div>
                      <div className="font-semibold text-gray-900 text-xs mt-0.5">{ev.safety_profile?.name || '—'}</div>
                      <div className="text-gray-400 text-[10px] mt-0.5 font-mono">
                        {ev.latitude?.toFixed(4)}, {ev.longitude?.toFixed(4)}
                      </div>
                      <div className="text-gray-400 text-[10px] mt-0.5">{timeAgo(ev.scanned_at)}</div>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${ev.latitude},${ev.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 p-1.5 rounded-lg bg-[#2844A8]/10 hover:bg-[#2844A8]/20 text-[#2844A8] transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
          {gpsEvents.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 shrink-0">
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {gpsEvents.length} real GPS locations recorded
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
