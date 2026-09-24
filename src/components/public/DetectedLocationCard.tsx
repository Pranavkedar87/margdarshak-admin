import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Navigation, RefreshCw, CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { scanService } from '../../services/scanService';

interface DetectedLocationCardProps {
  safetyId: string;
  initialLat?: number | null;
  initialLng?: number | null;
}

export const DetectedLocationCard: React.FC<DetectedLocationCardProps> = ({
  safetyId,
  initialLat = null,
  initialLng = null,
}) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initialLat !== null && initialLng !== null && !isNaN(initialLat) && !isNaN(initialLng)
      ? { lat: initialLat, lng: initialLng }
      : null
  );
  const [status, setStatus] = useState<'idle' | 'requesting' | 'shared' | 'denied' | 'error'>(
    initialLat !== null && initialLng !== null ? 'shared' : 'idle'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');

  const hasAttempted = useRef(false);

  const requestGps = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setStatus('requesting');
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          await scanService.recordScanEvent({
            safety_id: safetyId,
            latitude: lat,
            longitude: lng,
            permission_granted: true,
          });
          setCoords({ lat, lng });
          setStatus('shared');
        } catch (err: any) {
          console.error('Scan recording error:', err);
          setStatus('error');
          setErrorMessage(err.message || 'Failed to record location.');
        }
      },
      (error) => {
        console.warn('Geolocation permission error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          setStatus('denied');
          scanService.recordScanEvent({
            safety_id: safetyId,
            latitude: null,
            longitude: null,
            permission_granted: false,
          }).catch(console.error);
        } else {
          setStatus('error');
          setErrorMessage(error.message || 'Unable to retrieve location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, [safetyId]);

  useEffect(() => {
    if (!hasAttempted.current) {
      hasAttempted.current = true;
      requestGps();
    }
  }, [requestGps]);

  const mapsUrl = coords
    ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
    : null;

  return (
    <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Detected Location
            </h3>
            <p className="text-[10px] text-gray-500">Live GPS telemetry</p>
          </div>
        </div>

        <button
          onClick={requestGps}
          disabled={status === 'requesting'}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors shadow-2xs"
        >
          <RefreshCw className={`w-3 h-3 ${status === 'requesting' ? 'animate-spin text-[#2844A8]' : 'text-gray-500'}`} />
          <span>Refresh GPS</span>
        </button>
      </div>

      {/* State views */}
      {status === 'requesting' && (
        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center space-x-2 text-xs text-blue-900">
          <Loader2 className="w-4 h-4 animate-spin text-[#2844A8] shrink-0" />
          <span>Acquiring exact browser GPS coordinates...</span>
        </div>
      )}

      {coords ? (
        <div className="space-y-2">
          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-1">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Location shared with the MargDarshak safety network</span>
            </div>
            <p className="text-[11px] font-mono text-emerald-800">
              GPS: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </p>
          </div>

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-[#2844A8] hover:bg-[#1E3482] transition-colors shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Track Latest Location</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}
        </div>
      ) : status === 'denied' ? (
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="flex items-center space-x-1.5 font-bold text-amber-950">
            <AlertCircle className="w-3.5 h-3.5 text-[#CA7A00] shrink-0" />
            <span>Location permission was not granted</span>
          </div>
          <p className="text-[11px] text-amber-800">
            No GPS location available. You can tap "Refresh GPS" to grant browser permission.
          </p>
        </div>
      ) : status === 'error' ? (
        <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 space-y-1">
          <div className="flex items-center space-x-1.5 font-bold">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span>Unable to retrieve GPS</span>
          </div>
          <p className="text-[11px] text-red-600">{errorMessage || 'No GPS location available.'}</p>
        </div>
      ) : (
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-500 text-center">
          No GPS location available yet. Tap "Refresh GPS" to share your position.
        </div>
      )}
    </div>
  );
};
