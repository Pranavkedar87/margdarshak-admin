import React, { useState } from 'react';
import { Shield, Package, Tag, Phone, ArrowLeft } from 'lucide-react';
import { PublicSafetyResponse } from '../../types/database';
import { DetectedLocationCard } from './DetectedLocationCard';
import { EmergencyAssistanceCard } from './EmergencyAssistanceCard';

interface AccessoryViewProps {
  data: PublicSafetyResponse;
}

export const AccessoryView: React.FC<AccessoryViewProps> = ({ data }) => {
  const [showReporting, setShowReporting] = useState(false);
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

        {!showReporting ? (
          <div className="space-y-2">
            <button
              onClick={() => setShowReporting(true)}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-[#2844A8] hover:bg-[#1E3482] transition-colors shadow-xs"
            >
              <Tag className="w-4 h-4" />
              <span>Report Found Item / Recovery Assistance</span>
            </button>

            <p className="text-[11px] text-gray-400 text-center">
              Owner identity is protected through the MargDarshak recovery grid.
            </p>
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-950 space-y-2">
              <span className="font-bold block text-[#2844A8]">
                Item Recovery Instructions
              </span>
              <p className="text-[11px] text-blue-900 leading-relaxed">
                Please hand over this item to the nearest MargDarshak Sevak assistance desk, railway station master, or local police station with Safety ID: <strong className="font-mono text-gray-900">{data.safety_id}</strong>.
              </p>
              <p className="text-[11px] text-blue-900 leading-relaxed">
                The registered owner will be notified with the recorded recovery location.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:112"
                className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call 112 Help</span>
              </a>
              <button
                onClick={() => setShowReporting(false)}
                className="flex items-center justify-center space-x-1 py-2.5 px-3 rounded-xl font-semibold text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Emergency Assistance Panel */}
      <EmergencyAssistanceCard safetyId={data.safety_id} />
    </div>
  );
};
