import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, RefreshCw, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
import { scanService } from '../../services/scanService';

interface DetectedLocationCardProps {
  safetyId: string;
  helperText?: string;
}

export const DetectedLocationCard: React.FC<DetectedLocationCardProps> = ({
  safetyId,
  helperText,
}) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'sent' | 'denied' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const hasAttempted = useRef(false);

  const sendCurrentLocation = useCallback(() => {
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
          // Send current coordinates to backend & wait for confirmation
          await scanService.recordScanEvent({
            safety_id: safetyId,
            latitude: lat,
            longitude: lng,
            permission_granted: true,
          });
          // Show confirmation ONLY after backend confirms write
          setCoords({ lat, lng });
          setStatus('sent');
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
          // Still log that a scan occurred but location was denied
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

  // Automatic GPS attempt on initial load
  useEffect(() => {
    if (!hasAttempted.current) {
      hasAttempted.current = true;
      sendCurrentLocation();
    }
  }, [sendCurrentLocation]);

  return (
    <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs space-y-3.5">
      {/* Header */}
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-xl bg-[#FFF4E6] text-[#CA7A00] flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Current Location
          </h3>
          <p className="text-[11px] text-gray-500">
            {helperText || 'Send your location to the verified safety network'}
          </p>
        </div>
      </div>

      {/* State: Acquiring GPS */}
      {status === 'requesting' && (
        <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center space-x-2.5 text-xs text-blue-900">
          <Loader2 className="w-4 h-4 animate-spin text-[#2844A8] shrink-0" />
          <div>
            <span className="font-semibold block">Acquiring current GPS coordinates...</span>
            <span className="text-[10px] text-blue-700">Please tap "Allow" if prompted by your browser.</span>
          </div>
        </div>
      )}

      {/* State: Successfully Sent */}
      {status === 'sent' && coords && (
        <div className="space-y-2.5">
          <div className="p-3.5 bg-emerald-50/90 rounded-xl border border-emerald-200 space-y-1">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Current Location Sent</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              Location shared with the MargDarshak safety network
            </p>
            <p className="text-[11px] font-mono text-emerald-900 pt-0.5">
              GPS: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </p>
          </div>

          <button
            onClick={sendCurrentLocation}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-xs text-gray-700 bg-gray-50 border border-gray-300 hover:bg-gray-100 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-600" />
            <span>Send Location Again</span>
          </button>
        </div>
      )}

      {/* State: Permission Denied */}
      {status === 'denied' && (
        <div className="space-y-2.5">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-amber-950">
              <AlertCircle className="w-3.5 h-3.5 text-[#CA7A00] shrink-0" />
              <span>Location permission was not granted</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Browser location was not shared. Tap below to allow permission and send your current GPS coordinates.
            </p>
          </div>

          <button
            onClick={sendCurrentLocation}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-[#CA7A00] hover:bg-[#A96400] transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send My Current Location</span>
          </button>
        </div>
      )}

      {/* State: Error */}
      {status === 'error' && (
        <div className="space-y-2.5">
          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>Unable to retrieve GPS</span>
            </div>
            <p className="text-[11px] text-red-600">{errorMessage || 'Location request failed.'}</p>
          </div>

          <button
            onClick={sendCurrentLocation}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-[#2844A8] hover:bg-[#1E3482] transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Send My Current Location</span>
          </button>
        </div>
      )}

      {/* State: Idle fallback */}
      {status === 'idle' && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600 leading-relaxed">
            Send your current GPS position so the emergency safety team and family can navigate to this exact spot.
          </p>
          <button
            onClick={sendCurrentLocation}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-[#CA7A00] hover:bg-[#A96400] transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send My Current Location</span>
          </button>
        </div>
      )}
    </div>
  );
};
