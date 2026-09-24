import React from 'react';
import { SafetyProfile } from '../../types/database';
import { Shield } from 'lucide-react';

interface PrintTemplateProps {
  profile: SafetyProfile;
  qrDataUrl: string;
  templateType: 'card' | 'wristband' | 'sticker';
}

export const PrintTemplates: React.FC<PrintTemplateProps> = ({
  profile,
  qrDataUrl,
  templateType,
}) => {
  const fam = profile.family_profile;
  const acc = profile.accessory;

  if (templateType === 'card') {
    return (
      <div className="printable-card p-6 w-[340px] max-w-full mx-auto bg-white border-2 border-gray-800 rounded-2xl text-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#2844A8] pb-3 mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#2844A8] text-amber-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight text-[#2844A8] leading-none">
                MARGDARSHAK
              </h2>
              <span className="text-[9px] uppercase tracking-wider font-bold text-[#CA7A00]">
                Safety Card
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-gray-500 font-semibold block uppercase">Safety ID</span>
            <span className="text-xs font-mono font-bold text-gray-900">{profile.safety_id}</span>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex items-center space-x-3 mb-3">
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.name}
              className="w-16 h-16 rounded-xl object-cover border border-gray-300 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-center font-bold text-xl shrink-0">
              {profile.name.charAt(0)}
            </div>
          )}
          <div className="space-y-0.5 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 leading-tight truncate">{profile.name}</h3>
            {fam && (
              <p className="text-xs text-gray-600 font-medium">
                Age: <span className="font-bold text-gray-900">{fam.age ?? 'N/A'}</span> yrs
              </p>
            )}
            {fam?.blood_group && (
              <div className="inline-block px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[10px]">
                Blood: {fam.blood_group}
              </div>
            )}
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center p-2.5 bg-gray-50 rounded-xl border border-gray-200 mb-3">
          <img src={qrDataUrl} alt="Safety QR" className="w-40 h-40 rounded-lg object-contain" />
          <span className="text-[10px] font-mono font-bold text-gray-700 mt-1">
            {profile.safety_id}
          </span>
        </div>

        {/* Safe Public Message */}
        <div className="text-center bg-[#FFF4E6] p-2 rounded-lg border border-amber-200">
          <p className="text-[11px] font-semibold text-gray-800 leading-snug">
            "If found, scan this QR for safety assistance."
          </p>
          <p className="text-[8px] text-gray-500 mt-0.5">
            Official MargDarshak Pilgrim & Family Protection Network
          </p>
        </div>
      </div>
    );
  }

  if (templateType === 'wristband') {
    return (
      <div className="printable-band w-[540px] max-w-full mx-auto bg-white border-2 border-dashed border-gray-800 p-3.5 rounded-xl flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#2844A8] text-amber-400 flex items-center justify-center font-bold shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-black text-[#2844A8] leading-tight">MARGDARSHAK SAFETY BAND</h3>
            <p className="text-sm font-bold text-gray-900 truncate">{profile.name}</p>
            {fam?.blood_group && (
              <span className="text-[10px] font-bold text-rose-600 block mt-0.5">
                Blood Group: {fam.blood_group}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 border-l-2 border-gray-200 pl-3.5 shrink-0">
          <div className="text-right">
            <span className="text-[9px] font-bold text-gray-500 block uppercase">Emergency Scan</span>
            <span className="text-xs font-mono font-extrabold text-gray-900">{profile.safety_id}</span>
          </div>
          <img src={qrDataUrl} alt="Safety QR" className="w-18 h-18 rounded object-contain" />
        </div>
      </div>
    );
  }

  // templateType === 'sticker' (for Accessories / luggage)
  return (
    <div className="printable-sticker w-[260px] max-w-full mx-auto bg-white border-2 border-gray-900 p-4 rounded-xl text-center">
      <div className="flex items-center justify-center space-x-1.5 border-b-2 border-gray-200 pb-1.5 mb-2.5">
        <Shield className="w-4 h-4 text-[#2844A8]" />
        <h3 className="text-[11px] font-extrabold text-[#2844A8] uppercase tracking-wider">
          MargDarshak Travel Safety
        </h3>
      </div>

      <div className="flex justify-center mb-1.5">
        <img src={qrDataUrl} alt="Item QR" className="w-32 h-32 rounded-lg object-contain" />
      </div>

      <p className="font-mono text-xs font-bold text-gray-900 mb-0.5">{profile.safety_id}</p>
      <p className="text-xs font-bold text-gray-800 mb-2 truncate">
        {acc?.accessory_name || profile.name}
      </p>

      <div className="bg-[#FFF4E6] p-1.5 rounded-lg border border-amber-200 text-[10px] font-semibold text-gray-800">
        "Found this item? Scan to help return it."
      </div>
    </div>
  );
};
