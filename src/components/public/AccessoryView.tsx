import React, { useState } from 'react';
import { Shield, Package, Phone, Tag } from 'lucide-react';
import { PublicSafetyResponse } from '../../types/database';

interface AccessoryViewProps {
  data: PublicSafetyResponse;
}

export const AccessoryView: React.FC<AccessoryViewProps> = ({ data }) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const acc = data.accessory;

  return (
    <div className="space-y-4">
      {/* Identity Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm text-center">
        {data.photo_url ? (
          <img
            src={data.photo_url}
            alt={data.name}
            className="w-32 h-32 rounded-2xl object-cover mx-auto mb-3 border border-gray-200 shadow-sm"
          />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-amber-50 text-[#CA7A00] mx-auto mb-3 flex items-center justify-center border border-amber-200">
            <Package className="w-10 h-10" />
          </div>
        )}

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2844A8] text-xs font-bold mb-2">
          <Shield className="w-3.5 h-3.5" />
          Registered Travel Item
        </div>

        <h2 className="text-xl font-black text-gray-900">{acc?.item_name || data.name}</h2>
        <p className="text-xs font-mono font-bold text-[#CA7A00] mt-0.5">
          {data.safety_id}
        </p>

        {/* Item attributes */}
        <div className="grid grid-cols-2 gap-2 mt-4 text-left text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
          <div>
            <span className="text-gray-400 block text-[10px]">Type</span>
            <span className="font-semibold text-gray-800">{acc?.accessory_type || 'General'}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px]">Brand / Model</span>
            <span className="font-semibold text-gray-800">
              {[acc?.brand, acc?.model].filter(Boolean).join(' ') || 'Standard'}
            </span>
          </div>
          {acc?.color && (
            <div>
              <span className="text-gray-400 block text-[10px]">Color</span>
              <span className="font-semibold text-gray-800">{acc.color}</span>
            </div>
          )}
        </div>

        {acc?.description && (
          <div className="mt-3 text-left p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs">
            <span className="text-amber-900 font-bold block mb-0.5">Description</span>
            <p className="text-gray-700 leading-relaxed">{acc.description}</p>
          </div>
        )}
      </div>

      {/* Found Item Actions */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm text-center space-y-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Found This Item?
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={() => setShowContactModal(true)}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-[#2844A8] hover:bg-[#1F368A] transition-colors shadow-xs"
          >
            <Phone className="w-4 h-4" />
            <span>Contact Owner</span>
          </button>
          <button
            onClick={() => setShowContactModal(true)}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Tag className="w-4 h-4" />
            <span>I Found This Item</span>
          </button>
        </div>

        <p className="text-[11px] text-gray-400">
          Owner contact credentials are protected through MargDarshak secure relay.
        </p>
      </div>

      {/* Relay Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4 border border-gray-200 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2844A8] mx-auto flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-gray-900">
              MargDarshak Item Recovery
            </h3>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 text-left space-y-1">
              <span className="font-bold block text-amber-950">
                Secure Contact Relay — Coming Soon
              </span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Direct telephony/SMS masking relay is being deployed in the MargDarshak cloud. In the meantime, please surrender found luggage to the nearest MargDarshak Sevak desk or railway lost property office with Safety ID: <strong className="font-mono text-gray-900">{data.safety_id}</strong>.
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
