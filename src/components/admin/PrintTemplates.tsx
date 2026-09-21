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
      <div className="printable-area p-8 max-w-sm mx-auto bg-white border-2 border-gray-800 rounded-2xl text-gray-900 shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#2844A8] pb-3 mb-4">
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
            <span className="text-[10px] text-gray-500 font-semibold block">Safety ID</span>
            <span className="text-xs font-mono font-bold text-gray-900">{profile.safety_id}</span>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex items-center space-x-4 mb-4">
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.name}
              className="w-20 h-20 rounded-xl object-cover border border-gray-300"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-center font-bold text-2xl">
              {profile.name.charAt(0)}
            </div>
          )}
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900 leading-tight">{profile.name}</h3>
            {fam && (
              <p className="text-xs text-gray-600 font-medium">
                Age: <span className="font-bold text-gray-900">{fam.age ?? 'N/A'}</span> yrs
              </p>
            )}
            {fam?.blood_group && (
              <div className="inline-block px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">
                Blood: {fam.blood_group}
              </div>
            )}
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-200 mb-4">
          <img src={qrDataUrl} alt="Safety QR" className="w-48 h-48 rounded-lg" />
          <span className="text-[11px] font-mono font-bold text-gray-700 mt-2">
            {profile.safety_id}
          </span>
        </div>

        {/* Safe Public Message */}
        <div className="text-center bg-[#FFF4E6] p-3 rounded-lg border border-amber-200">
          <p className="text-xs font-semibold text-gray-800 leading-snug">
            "If found, scan this QR for safety assistance."
          </p>
          <p className="text-[9px] text-gray-500 mt-1">
            Official MargDarshak Pilgrim & Family Protection Network
          </p>
        </div>
      </div>
    );
  }

  if (templateType === 'wristband') {
    return (
      <div className="printable-area max-w-2xl mx-auto bg-white border-2 border-dashed border-gray-800 p-4 rounded-xl flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#2844A8] text-amber-400 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#2844A8]">MARGDARSHAK SAFETY BAND</h3>
            <p className="text-sm font-bold text-gray-900">{profile.name}</p>
            {fam?.blood_group && (
              <span className="text-[10px] font-bold text-rose-600">
                Blood Group: {fam.blood_group}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 border-l-2 border-gray-200 pl-4">
          <div className="text-right">
            <span className="text-[9px] font-bold text-gray-500 block uppercase">Emergency Scan</span>
            <span className="text-xs font-mono font-extrabold text-gray-900">{profile.safety_id}</span>
          </div>
          <img src={qrDataUrl} alt="Safety QR" className="w-20 h-20 rounded" />
        </div>
      </div>
    );
  }

  // templateType === 'sticker' (for Accessories / luggage)
  return (
    <div className="printable-area max-w-xs mx-auto bg-white border-2 border-gray-900 p-5 rounded-xl text-center">
      <div className="flex items-center justify-center space-x-2 border-b-2 border-gray-200 pb-2 mb-3">
        <Shield className="w-4 h-4 text-[#2844A8]" />
        <h3 className="text-xs font-extrabold text-[#2844A8] uppercase tracking-wider">
          MargDarshak Travel Safety
        </h3>
      </div>

      <div className="flex justify-center mb-2">
        <img src={qrDataUrl} alt="Item QR" className="w-36 h-36 rounded-lg" />
      </div>

      <p className="font-mono text-xs font-bold text-gray-900 mb-1">{profile.safety_id}</p>
      <p className="text-sm font-bold text-gray-800 mb-2">
        {acc?.accessory_name || profile.name}
      </p>

      <div className="bg-[#FFF4E6] p-2 rounded-lg border border-amber-200 text-xs font-semibold text-gray-800">
        "Found this item? Scan to help return it."
      </div>
    </div>
  );
};
