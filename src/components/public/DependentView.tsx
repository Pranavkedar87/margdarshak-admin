import React from 'react';
import { Heart, Phone, Info, CheckCircle2, UserCheck } from 'lucide-react';
import { PublicSafetyResponse } from '../../types/database';
import { DetectedLocationCard } from './DetectedLocationCard';
import { EmergencyAssistanceCard } from './EmergencyAssistanceCard';

interface DependentViewProps {
  data: PublicSafetyResponse;
}

export const DependentView: React.FC<DependentViewProps> = ({ data }) => {
  const info = data.emergency_info;

  const hasAnyEmergencyInfo = Boolean(
    info?.critical_allergies ||
    info?.medical_alert ||
    info?.special_assistance ||
    info?.emergency_instructions
  );

  return (
    <div className="space-y-4">
      {/* 1. Safety Identity Hero Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs text-center space-y-3">
        {/* Verified Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>VERIFIED PILGRIM PROFILE</span>
        </div>

        {/* Profile Photo */}
        <div>
          {data.photo_url ? (
            <img
              src={data.photo_url}
              alt={data.name}
              className="w-28 h-28 rounded-2xl object-cover mx-auto border-2 border-white shadow-md ring-2 ring-gray-100"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-amber-100 text-amber-900 mx-auto flex items-center justify-center text-3xl font-extrabold border border-amber-300 shadow-xs">
              {data.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Name and Safety ID */}
        <div>
          <h2 className="text-xl font-black text-gray-900 leading-tight">{data.name}</h2>
          <div className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-[#2844A8]/10 text-[#2844A8] font-mono font-bold text-xs">
            {data.safety_id}
          </div>
        </div>

        {/* Demographic Badges: Age, Blood, Gender, Relationship */}
        <div className="flex flex-wrap justify-center gap-2 pt-1 text-xs">
          {data.age && (
            <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-800 font-semibold">
              Age: {data.age} yrs
            </span>
          )}
          {data.gender && (
            <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-800 font-semibold">
              {data.gender}
            </span>
          )}
          {data.blood_group && (
            <span className="px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold">
              Blood: {data.blood_group}
            </span>
          )}
          {data.relationship && (
            <span className="px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[#2844A8] font-semibold">
              {data.relationship}
            </span>
          )}
        </div>
      </div>

      {/* 2. Detected Location Card (Immediately after hero card) */}
      <DetectedLocationCard
        safetyId={data.safety_id}
        helperText="Send your current location to the verified safety network so the family can locate this person."
      />

      {/* 3. Emergency Contacts Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-3.5">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2844A8] flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Emergency Contacts
            </h3>
            <p className="text-[10px] text-gray-500">Verified guardian reachability</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Primary Guardian */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block">
                  Primary Guardian
                </span>
                <p className="text-xs font-bold text-gray-900">
                  {data.guardian_name || 'Primary Guardian'}
                </p>
                <p className="text-[11px] text-gray-500">
                  {data.guardian_relationship || 'Parent / Primary Guardian'}
                </p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200">
                Verified
              </span>
            </div>

            {data.guardian_action_phone ? (
              <a
                href={`tel:${data.guardian_action_phone}`}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-[#2844A8] hover:bg-[#1E3482] transition-colors shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Guardian</span>
              </a>
            ) : (
              <p className="text-[11px] text-gray-400 italic">No direct phone registered</p>
            )}
          </div>

          {/* Secondary Emergency Contact if available */}
          {data.secondary_contact_action_phone && (
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block">
                    Secondary Emergency Contact
                  </span>
                  <p className="text-xs font-bold text-gray-900">
                    {data.secondary_contact_name || 'Emergency Contact'}
                  </p>
                  <p className="text-[11px] text-gray-500">Secondary Contact</p>
                </div>
              </div>

              <a
                href={`tel:${data.secondary_contact_action_phone}`}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-bold text-xs text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition-colors shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5 text-gray-600" />
                <span>Call Emergency Contact</span>
              </a>
            </div>
          )}
        </div>

        <p className="text-[10px] text-gray-400 text-center">
          Contact numbers are securely protected. Direct call connects through native dialer.
        </p>
      </div>

      {/* 4. Public Safety & Medical Alerts */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-red-700 font-bold text-xs uppercase tracking-wider">
          <Heart className="w-4 h-4 text-red-600" />
          <span>Public Safety & Medical Alerts</span>
        </div>

        {hasAnyEmergencyInfo ? (
          <div className="space-y-2 text-xs">
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
        ) : (
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center text-xs text-gray-500">
            <Info className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <p>Safety information is limited. Please contact emergency assistance if required.</p>
          </div>
        )}
      </div>

      {/* 5. Registration & Pilgrim Details */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-gray-900 font-bold text-xs uppercase tracking-wider">
          <UserCheck className="w-4 h-4 text-[#2844A8]" />
          <span>Registration & Pilgrim Details</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">District / Region</span>
            <span className="font-semibold text-gray-900">{data.district || 'Maharashtra'}</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Registration Type</span>
            <span className="font-semibold text-gray-900">Family Dependent</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Verification</span>
            <span className="font-semibold text-emerald-700">Verified Pilgrim</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Tag Status</span>
            <span className="font-semibold text-[#2844A8]">Active Safety Grid</span>
          </div>
        </div>
      </div>

      {/* 6. Emergency Assistance Interactive Panel */}
      <EmergencyAssistanceCard
        guardianActionPhone={data.guardian_action_phone}
        safetyId={data.safety_id}
      />
    </div>
  );
};
