import React, { useState } from 'react';
import { MapPin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { scanService } from '../../services/scanService';

interface LocationShareCardProps {
  safetyId: string;
}

export const LocationShareCard: React.FC<LocationShareCardProps> = ({ safetyId }) => {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'success' | 'denied' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [recordedCoords, setRecordedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleShareLocation = () => {
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
          });
          setRecordedCoords({ lat, lng });
          setStatus('success');
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
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-amber-200/70 shadow-sm space-y-3">
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-full bg-[#FFF4E6] flex items-center justify-center text-[#CA7A00]">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900 leading-tight">
            Help the Family Find This Person/Item
          </h4>
          <p className="text-[11px] text-gray-500">
            Send your current GPS position to the verified emergency team
          </p>
        </div>
      </div>

      {status === 'idle' && (
        <div className="pt-2">
          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
            Sharing your location is optional and safe. It updates the emergency command center so the registered guardian can navigate here.
          </p>
          <button
            onClick={handleShareLocation}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-[#CA7A00] hover:bg-[#A96400] transition-colors shadow-xs"
          >
            <MapPin className="w-4 h-4" />
            <span>Share My Location</span>
          </button>
        </div>
      )}

      {status === 'requesting' && (
        <div className="py-4 flex flex-col items-center justify-center text-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#CA7A00]" />
          <p className="text-xs font-semibold text-gray-800">
            Requesting browser GPS permission...
          </p>
          <p className="text-[11px] text-gray-500">Please tap "Allow" in your browser prompt.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Location Successfully Shared</span>
          </div>
          <p className="text-[11px] text-emerald-700">
            Real GPS coordinates have been recorded in the MargDarshak safety network.
          </p>
          {recordedCoords && (
            <p className="text-[10px] font-mono text-emerald-800 pt-1">
              Coordinates: {recordedCoords.lat.toFixed(5)}, {recordedCoords.lng.toFixed(5)}
            </p>
          )}
        </div>
      )}

      {status === 'denied' && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-800">
            <AlertCircle className="w-4 h-4 text-[#CA7A00] shrink-0" />
            <span>Location Sharing Disabled</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Location sharing was not enabled. You can still view the safety information below and assist this person.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <p className="font-semibold">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};
