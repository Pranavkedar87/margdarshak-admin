import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, AlertTriangle, AlertCircle, Ban, PauseCircle } from 'lucide-react';
import { publicSafetyService } from '../../services/publicSafetyService';
import { PublicSafetyResponse } from '../../types/database';
import { DependentView } from '../../components/public/DependentView';
import { AccessoryView } from '../../components/public/AccessoryView';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const PublicSafetyPage: React.FC = () => {
  const { safetyId } = useParams<{ safetyId: string }>();
  const [profile, setProfile] = useState<PublicSafetyResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorType, setErrorType] = useState<'NOT_FOUND' | 'ERROR' | null>(null);

  useEffect(() => {
    if (!safetyId) return;

    let isMounted = true;
    setLoading(true);
    setErrorType(null);

    const loadProfile = async () => {
      try {
        const data = await publicSafetyService.getPublicProfile(safetyId);
        if (isMounted) {
          setProfile(data);
        }
      } catch (err: any) {
        console.warn('Public safety profile resolution error:', err);
        if (isMounted) {
          if (err.code === 'NOT_FOUND' || err.message?.toLowerCase().includes('not found')) {
            setErrorType('NOT_FOUND');
          } else {
            setErrorType('ERROR');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [safetyId]);

  return (
    <div className="min-h-screen bg-[#FFF4E6]/40 flex flex-col justify-between py-6 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto space-y-4">
        {/* Brand Header */}
        <header className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2844A8] to-[#1E3482] flex items-center justify-center text-white shadow-xs">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-gray-900 leading-tight">
                MARGDARSHAK
              </h1>
              <p className="text-[10px] tracking-wider uppercase font-bold text-[#CA7A00]">
                Public Safety Network
              </p>
            </div>
          </div>

          <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Emergency Portal
          </div>
        </header>

        {/* Dynamic State Rendering */}
        {loading ? (
          <div className="bg-white rounded-2xl p-10 border border-gray-200 shadow-xs text-center">
            <LoadingSpinner message="Verifying safety tag with cloud network..." />
          </div>
        ) : errorType === 'NOT_FOUND' ? (
          /* Invalid Safety ID State */
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Safety ID Not Found</h2>
            <p className="text-xs text-gray-600 leading-relaxed max-w-xs mx-auto">
              This QR code could not be verified by MargDarshak. Please verify the tag code or contact the helpline.
            </p>
            {safetyId && (
              <p className="text-[11px] font-mono text-gray-400">ID: {safetyId}</p>
            )}
          </div>
        ) : errorType === 'ERROR' ? (
          /* General Error / Unreachable State */
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-700 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Unable to Connect</h2>
            <p className="text-xs text-gray-600 leading-relaxed max-w-xs mx-auto">
              Unable to reach the safety verification server. Please check your network connection and scan again.
            </p>
          </div>
        ) : profile?.qr_status === 'SUSPENDED' ? (
          /* Suspended QR State */
          <div className="bg-white rounded-2xl p-8 border border-yellow-200 shadow-sm text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-yellow-50 text-yellow-800 mx-auto flex items-center justify-center">
              <PauseCircle className="w-7 h-7 text-yellow-700" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Safety Tag Inactive</h2>
            <p className="text-xs text-yellow-800 leading-relaxed max-w-xs mx-auto">
              This MargDarshak Safety QR is temporarily inactive. Private safety records are protected and cannot be viewed at this time.
            </p>
            <p className="text-[11px] font-mono text-gray-400">Tag ID: {profile.safety_id}</p>
          </div>
        ) : profile?.qr_status === 'REVOKED' ? (
          /* Revoked QR State */
          <div className="bg-white rounded-2xl p-8 border border-red-200 shadow-sm text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
              <Ban className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Safety Tag Revoked</h2>
            <p className="text-xs text-red-700 leading-relaxed max-w-xs mx-auto">
              This MargDarshak Safety QR has been permanently revoked. It cannot be used for identification.
            </p>
            <p className="text-[11px] font-mono text-gray-400">Tag ID: {profile.safety_id}</p>
          </div>
        ) : profile ? (
          /* Active Profile Display */
          <div className="space-y-4 animate-in fade-in duration-300">
            {profile.profile_type === 'DEPENDENT' ? (
              <DependentView data={profile} />
            ) : (
              <AccessoryView data={profile} />
            )}
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-gray-400 space-y-1">
        <p className="font-semibold text-gray-600">
          MargDarshak Pilgrim & Family Protection Grid
        </p>
        <p className="text-[10px]">
          Dedicated to safe spiritual journeys • Powered by Supabase Cloud
        </p>
      </footer>
    </div>
  );
};
