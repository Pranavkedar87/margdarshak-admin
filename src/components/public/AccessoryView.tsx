import React from 'react';
import { Shield, Package, Phone, Navigation, ExternalLink } from 'lucide-react';
import { PublicSafetyResponse } from '../../types/database';
import { DetectedLocationCard } from './DetectedLocationCard';
import { EmergencyAssistanceCard } from './EmergencyAssistanceCard';

interface AccessoryViewProps {
  data: PublicSafetyResponse;
}

export const AccessoryView: React.FC<AccessoryViewProps> = ({ data }) => {
  const acc = data.accessory;

  return (
    <div className="space-y-4">
      {/* 1. Item Identity Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs text-center space-y-3">
        {data.photo_url ? (
          <img
            src={data.photo_url}
            alt={data.name}
            className="w-32 h-32 rounded-2xl object-cover mx-auto border-2 border-white shadow-sm ring-2 ring-gray-100"
          />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-amber-50 text-[#CA7A00] mx-auto flex items-center justify-center border border-amber-200 shadow-xs">
            <Package className="w-10 h-10" />
          </div>
        )}

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2844A8] text-xs font-bold">
          <Shield className="w-3.5 h-3.5" />
          <span>REGISTERED TRAVEL ITEM</span>
        </div>

        <div>
          <h2 className="text-xl font-black text-gray-900 leading-tight">
            {acc?.item_name || data.name}
          </h2>
          <div className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-[#CA7A00]/10 text-[#CA7A00] font-mono font-bold text-xs">
            {data.safety_id}
          </div>
        </div>

        {/* Item attributes */}
        <div className="grid grid-cols-2 gap-2 text-left text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Type</span>
            <span className="font-semibold text-gray-800">{acc?.accessory_type || 'General Luggage'}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Brand / Model</span>
            <span className="font-semibold text-gray-800">
              {[acc?.brand, acc?.model].filter(Boolean).join(' ') || 'Standard'}
            </span>
          </div>
          {acc?.color && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Color</span>
              <span className="font-semibold text-gray-800">{acc.color}</span>
            </div>
          )}
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Status</span>
            <span className="font-semibold text-emerald-700">Active Tag</span>
          </div>
        </div>

        {acc?.description && (
          <div className="text-left p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs">
            <span className="text-amber-900 font-bold block mb-0.5">Description</span>
            <p className="text-gray-700 leading-relaxed">{acc.description}</p>
          </div>
        )}
      </div>

      {/* 2. Detected Location Card (Real coordinates & Google Maps link) */}
      <DetectedLocationCard
        safetyId={data.safety_id}
        initialLat={data.last_scan_latitude}
        initialLng={data.last_scan_longitude}
      />

      {/* 3. Found This Item? Action Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider text-center">
          Found This Item?
        </h3>

        <div className="space-y-2">
          {/* Real Contact Owner Button (Only when verified, active, and real phone exists in margdarshak_user_map) */}
          {data.owner_action_phone ? (
            <a
              href={`tel:${data.owner_action_phone}`}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-[#2844A8] hover:bg-[#1E3482] transition-colors shadow-xs"
            >
              <Phone className="w-4 h-4" />
              <span>Contact Owner</span>
            </a>
          ) : (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 text-left space-y-1">
              <span className="font-bold text-gray-900 block">
                Item Recovery Assistance
              </span>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Owner direct phone is not available for this item. Please hand over found property to the nearest MargDarshak Sevak assistance desk, station master, or police with Safety ID: <strong className="font-mono text-gray-900">{data.safety_id}</strong>.
              </p>
            </div>
          )}

          {data.last_scan_latitude !== null && data.last_scan_longitude !== null && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${data.last_scan_latitude},${data.last_scan_longitude}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-xs text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-2xs"
            >
              <Navigation className="w-3.5 h-3.5 text-[#2844A8]" />
              <span>Track Latest Location</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          )}

          <p className="text-[11px] text-gray-400 text-center">
            Owner phone is protected through the MargDarshak safety network. Direct dial connects via native dialer.
          </p>
        </div>
      </div>

      {/* 4. Emergency Assistance Panel */}
      <EmergencyAssistanceCard
        safetyId={data.safety_id}
        guardianActionPhone={data.owner_action_phone}
      />
    </div>
  );
};
