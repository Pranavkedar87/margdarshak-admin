import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, RefreshCw, ExternalLink } from 'lucide-react';
import { scanService } from '../../services/scanService';
import { QRScanEvent } from '../../types/database';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

// Create custom high-visibility SVG pin for Leaflet
const createPinIcon = (color: string = '#2844A8') => {
  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%);">
        <div style="background-color: ${color}; color: white; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white;">
          <div style="transform: rotate(45deg); width: 8px; height: 8px; background-color: #CA7A00; border-radius: 50%;"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [0, 0],
  });
};

export const ScanMap: React.FC = () => {
  const [events, setEvents] = useState<QRScanEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await scanService.getScanEvents(200);
      // Filter only real coordinates
      const withCoords = data.filter(
        (ev) => ev.latitude !== null && ev.longitude !== null && !isNaN(ev.latitude) && !isNaN(ev.longitude)
      );
      setEvents(withCoords);
    } catch (err) {
      console.error('ScanMap error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Default center: Pandharpur / Maharashtra pilgrimage center (17.6775, 75.3278) or first scan
  const defaultCenter: [number, number] = events.length > 0 && events[0].latitude && events[0].longitude
    ? [events[0].latitude, events[0].longitude]
    : [17.6775, 75.3278];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            Live Scanned Telemetry Map
          </h2>
          <p className="text-xs text-gray-500">
            Real GPS coordinate pins plotted directly from verified public scan events ({events.length} active points)
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-xs shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin text-[#2844A8]' : 'text-gray-500'}`} />
          Refresh Coordinates
        </button>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden h-[600px] relative">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner message="Loading GPS scan telemetry..." />
          </div>
        ) : events.length === 0 ? (
          <div className="h-full flex items-center justify-center p-6">
            <EmptyState
              title="No GPS Scans Recorded Yet"
              description="Zero mocked coordinates. As soon as finders tap 'Share My Location' upon scanning a physical card, their live GPS location will be pinned here."
              icon={MapPin}
            />
          </div>
        ) : (
          <MapContainer
            center={defaultCenter}
            zoom={12}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', zIndex: 10 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {events.map((ev) => {
              if (ev.latitude === null || ev.longitude === null) return null;
              return (
                <Marker
                  key={ev.id}
                  position={[ev.latitude, ev.longitude]}
                  icon={createPinIcon('#2844A8')}
                >
                  <Popup>
                    <div className="text-xs p-1 space-y-1.5 min-w-[200px]">
                      <div className="flex items-center justify-between border-b pb-1">
                        <span className="font-bold text-[#2844A8] font-mono">
                          {ev.safety_id || 'ID Unavailable'}
                        </span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                          {ev.status || 'RECORDED'}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {ev.safety_profile?.name || 'Safety Profile'}
                      </p>
                      <div className="text-[11px] text-gray-500 font-mono">
                        Lat: {ev.latitude.toFixed(5)}, Lng: {ev.longitude.toFixed(5)}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Scanned:{' '}
                        {new Date(ev.scanned_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {ev.safety_id && (
                        <a
                          href={`/safety/${ev.safety_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#2844A8] font-semibold hover:underline inline-flex items-center gap-1 pt-1 border-t"
                        >
                          <span>Open Public Card</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
};
