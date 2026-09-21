import React, { useState } from 'react';
import { Heart, Phone, Info, CheckCircle2 } from 'lucide-react';
import { PublicSafetyResponse } from '../../types/database';

interface DependentViewProps {
  data: PublicSafetyResponse;
}

export const DependentView: React.FC<DependentViewProps> = ({ data }) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const info = data.emergency_info;

  const hasAnyEmergencyInfo = Boolean(
    info?.critical_allergies ||
    info?.medical_alert ||
    info?.special_assistance ||
    info?.emergency_instructions
  );

  return (
    <div className="space-y-4">
      {/* Identity Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm text-center">
        {data.photo_url ? (
          <img
            src={data.photo_url}
            alt={data.name}
            className="w-28 h-28 rounded-2xl object-cover mx-auto mb-3 border-2 border-white shadow-md"
          />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-amber-100 text-amber-900 mx-auto mb-3 flex items-center justify-center text-3xl font-extrabold border border-amber-300">
            {data.name.charAt(0)}
          </div>
        )}

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Verified Pilgrim Profile
        </div>

        <h2 className="text-xl font-black text-gray-900">{data.name}</h2>
        <p className="text-xs font-mono font-bold text-[#2844A8] mt-0.5">
          {data.safety_id}
        </p>

        {/* Quick demographic badges */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {data.age && (
            <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-800 font-semibold text-xs">
              Age: {data.age} yrs
            </span>
          )}
          {data.relationship && (
            <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-800 font-semibold text-xs">
              {data.relationship}
            </span>
          )}
          {data.blood_group && (
            <span className="px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">
              Blood: {data.blood_group}
            </span>
          )}
        </div>
      </div>

      {/* Emergency Medical & Assistance Notice */}
      {hasAnyEmergencyInfo ? (
        <div className="bg-white rounded-2xl p-5 border border-red-200/80 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-red-700 font-bold text-xs uppercase tracking-wider">
            <Heart className="w-4 h-4 text-red-600" />
            <span>Public Safety & Medical Alerts</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {info?.medical_alert && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <span className="font-bold text-red-900 block mb-0.5">Medical Alert</span>
                <p className="text-gray-800 font-medium">{info.medical_alert}</p>
              </div>
            )}

            {info?.critical_allergies && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <span className="font-bold text-amber-900 block mb-0.5">Critical Allergies</span>
                <p className="text-gray-800 font-medium">{info.critical_allergies}</p>
              </div>
            )}

            {info?.special_assistance && (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="font-bold text-[#2844A8] block mb-0.5">Special Assistance</span>
                <p className="text-gray-800 font-medium">{info.special_assistance}</p>
              </div>
            )}

            {info?.emergency_instructions && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="font-bold text-gray-900 block mb-0.5">Emergency Instructions</span>
                <p className="text-gray-700 font-medium italic">{info.emergency_instructions}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center text-xs text-gray-500 shadow-sm">
          <Info className="w-4 h-4 text-gray-400 mx-auto mb-1" />
          <p>Safety information is limited. Please contact MargDarshak emergency assistance below.</p>
        </div>
      )}

      {/* Emergency Contact Action */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm text-center space-y-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Emergency Assistance
        </h4>

        <button
          onClick={() => setShowContactModal(true)}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-[#2844A8] hover:bg-[#1F368A] transition-colors shadow-xs"
        >
          <Phone className="w-4 h-4" />
          <span>Contact Verified Guardian</span>
        </button>

        <p className="text-[11px] text-gray-400">
          Phone numbers are masked to safeguard the family's privacy.
        </p>
      </div>

      {/* Contact Relay Modal (Controlled Placeholder) */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4 border border-gray-200 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2844A8] mx-auto flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-gray-900">
              MargDarshak Emergency Relay
            </h3>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 text-left space-y-1">
              <span className="font-bold block text-amber-950">
                Secure Contact Relay — Coming Soon
              </span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Direct telephony/SMS masking relay is being deployed in the MargDarshak cloud. In the meantime, please reach the nearest MargDarshak Sevak or local police with Safety ID: <strong className="font-mono text-gray-900">{data.safety_id}</strong>.
              </p>
            </div>

            <button
              onClick={() => setShowContactModal(false)}
              className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
