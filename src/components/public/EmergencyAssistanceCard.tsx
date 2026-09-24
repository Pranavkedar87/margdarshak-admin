import React, { useState } from 'react';
import { Heart, Shield, Flame, Phone, UserX, AlertTriangle, ArrowLeft, Ambulance } from 'lucide-react';

interface EmergencyAssistanceCardProps {
  guardianActionPhone?: string | null;
  safetyId: string;
}

type EmergencyType = 'MEDICAL' | 'POLICE' | 'FIRE' | 'ACCIDENT' | 'MISSING' | 'OTHER' | null;

export const EmergencyAssistanceCard: React.FC<EmergencyAssistanceCardProps> = ({
  guardianActionPhone,
  safetyId,
}) => {
  const [selectedType, setSelectedType] = useState<EmergencyType>(null);

  const emergencyCategories = [
    {
      id: 'MEDICAL' as EmergencyType,
      label: 'Medical Emergency',
      icon: Heart,
      color: 'text-rose-600',
      bg: 'bg-rose-50 hover:bg-rose-100 border-rose-200',
    },
    {
      id: 'POLICE' as EmergencyType,
      label: 'Police / Security',
      icon: Shield,
      color: 'text-blue-600',
      bg: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    },
    {
      id: 'FIRE' as EmergencyType,
      label: 'Fire Emergency',
      icon: Flame,
      color: 'text-orange-600',
      bg: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
    },
    {
      id: 'ACCIDENT' as EmergencyType,
      label: 'Accident',
      icon: Ambulance,
      color: 'text-amber-600',
      bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
    },
    {
      id: 'MISSING' as EmergencyType,
      label: 'Missing Person',
      icon: UserX,
      color: 'text-purple-600',
      bg: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
    },
    {
      id: 'OTHER' as EmergencyType,
      label: 'Other Emergency',
      icon: AlertTriangle,
      color: 'text-gray-700',
      bg: 'bg-gray-50 hover:bg-gray-100 border-gray-200',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Emergency Assistance
          </h3>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          You're at the right place. Select the type of assistance you need.
        </p>
      </div>

      {!selectedType ? (
        /* Category Grid */
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {emergencyCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedType(cat.id)}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${cat.bg} shadow-2xs active:scale-[0.98]`}
              >
                <Icon className={`w-6 h-6 mb-1.5 ${cat.color}`} />
                <span className="text-xs font-bold text-gray-900 leading-tight">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        /* Action view for selected emergency */
        <div className="space-y-3 pt-1 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-900">
              {emergencyCategories.find((c) => c.id === selectedType)?.label} Actions
            </span>
            <button
              onClick={() => setSelectedType(null)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back</span>
            </button>
          </div>

          <div className="space-y-2">
            {/* Primary National Emergency Call */}
            {(selectedType === 'MEDICAL' || selectedType === 'ACCIDENT') && (
              <a
                href="tel:108"
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>Call 108 (Ambulance / Medical)</span>
              </a>
            )}

            {(selectedType === 'POLICE' || selectedType === 'ACCIDENT' || selectedType === 'MISSING' || selectedType === 'OTHER') && (
              <a
                href="tel:112"
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>Call 112 (Police & National Emergency)</span>
              </a>
            )}

            {selectedType === 'FIRE' && (
              <a
                href="tel:101"
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>Call 101 (Fire Brigade)</span>
              </a>
            )}

            {/* Direct Call Guardian Button */}
            {guardianActionPhone ? (
              <a
                href={`tel:${guardianActionPhone}`}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-[#2844A8] hover:bg-[#1E3482] transition-colors shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>Call Registered Guardian</span>
              </a>
            ) : null}

            {/* Safe reference note */}
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-500">
              When reporting to officials, quote verified Safety ID: <strong className="font-mono text-gray-900">{safetyId}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
