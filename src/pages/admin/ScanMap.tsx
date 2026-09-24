import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, RefreshCw, ExternalLink } from 'lucide-react';
import { scanService } from '../../services/scanService';
import { QRScanEvent } from '../../types/database';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

const containerStyle = {
  width: '100%',
  height: '100%'
};

export const ScanMap: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [events, setEvents] = useState<QRScanEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<QRScanEvent | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await scanService.getScanEvents(200);
      // Filter only real coordinates
      const withCoords = data.filter(
        (ev) => ev.latitude !== null && ev.longitude !== null && !isNaN(ev.latitude) && !isNaN(ev.longitude)
      );
      setEvents(withCoords);
      setSelectedEvent(null);
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
  const defaultCenter = useMemo(() => {
    if (events.length > 0 && events[0].latitude && events[0].longitude) {
      return { lat: events[0].latitude, lng: events[0].longitude };
    }
    return { lat: 17.6775, lng: 75.3278 };
  }, [events]);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            Live Scanned Telemetry Map (Google Maps)
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
        {loading || !isLoaded ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner message="Loading GPS scan telemetry..." />
          </div>
        ) : events.length === 0 ? (
          <div className="h-full flex items-center justify-center p-6">
            <EmptyState
              title="No GPS Scans Recorded Yet"
              description="Zero mocked coordinates. As soon as finders automatically share their location upon scanning a physical card, their live GPS location will be pinned here."
              icon={MapPin}
            />
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={12}
            options={{
              streetViewControl: false,
              mapTypeControl: true,
              fullscreenControl: true,
            }}
          >
            {events.map((ev) => {
              if (ev.latitude === null || ev.longitude === null) return null;
              return (
                <Marker
                  key={ev.id}
                  position={{ lat: ev.latitude, lng: ev.longitude }}
                  onClick={() => setSelectedEvent(ev)}
                />
              );
            })}

            {selectedEvent && selectedEvent.latitude && selectedEvent.longitude && (
              <InfoWindow
                position={{ lat: selectedEvent.latitude, lng: selectedEvent.longitude }}
                onCloseClick={() => setSelectedEvent(null)}
              >
                <div className="text-xs p-1 space-y-1.5 min-w-[200px]">
                  <div className="flex items-center justify-between border-b pb-1">
                    <span className="font-bold text-[#2844A8] font-mono">
                      {selectedEvent.safety_id || 'ID Unavailable'}
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                      {selectedEvent.status || 'RECORDED'}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {selectedEvent.safety_profile?.name || 'Safety Profile'}
                  </p>
                  <div className="text-[11px] text-gray-500 font-mono">
                    Lat: {selectedEvent.latitude.toFixed(5)}, Lng: {selectedEvent.longitude.toFixed(5)}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Scanned:{' '}
                    {new Date(selectedEvent.scanned_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  {selectedEvent.safety_id && (
                    <a
                      href={`/safety/${selectedEvent.safety_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#2844A8] font-semibold hover:underline inline-flex items-center gap-1 pt-1 border-t"
                    >
                      <span>Open Public Card</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </div>
    </div>
  );
};
