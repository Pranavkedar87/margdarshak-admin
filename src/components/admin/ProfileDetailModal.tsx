import React, { useState } from 'react';
import { X, CheckCircle, XCircle, QrCode, Shield, Phone, Heart, User } from 'lucide-react';
import { SafetyProfile } from '../../types/database';
import { StatusBadge } from '../common/StatusBadge';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface ProfileDetailModalProps {
  profile: SafetyProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onGenerateQR?: (profile: SafetyProfile) => void;
}

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  profile,
  isOpen,
  onClose,
  onVerify,
  onReject,
  onGenerateQR,
}) => {
  const [confirmAction, setConfirmAction] = useState<'verify' | 'reject' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !profile) return null;

  const isDependent = profile.profile_type === 'DEPENDENT';
  const fam = profile.family_profile;
  const acc = profile.accessory;

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    setIsProcessing(true);
    try {
      if (confirmAction === 'verify') {
        await onVerify(profile.id);
      } else if (confirmAction === 'reject') {
        await onReject(profile.id);
      }
      setConfirmAction(null);
      onClose();
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#2844A8] text-white flex items-center justify-center shadow-xs">
                {isDependent ? <User className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-none">
                  {profile.name}
                </h3>
                <p className="text-xs font-mono font-semibold text-[#2844A8] mt-1">
                  {profile.safety_id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <StatusBadge status={profile.status} />
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Top Identity Row */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-[#FFF4E6]/50 border border-amber-200/60">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.name}
                  className="w-24 h-24 rounded-xl object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-amber-100/70 border border-amber-200 text-amber-800 flex items-center justify-center font-bold text-2xl">
                  {profile.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-sm font-bold text-gray-900">{profile.name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700">
                    {profile.profile_type}
                  </span>
                  <StatusBadge status={profile.qr_status} />
                </div>
                <p className="text-xs text-gray-600">
                  Registered:{' '}
                  {new Date(profile.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* DEPENDENT Details */}
            {isDependent && fam && (
              <div className="space-y-4">
                {/* General Info */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/80">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400 block">Full Name</span>
                      <span className="font-semibold text-gray-900">{fam.full_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Age / Gender</span>
                      <span className="font-semibold text-gray-900">
                        {fam.age ?? 'N/A'} yrs • {fam.gender ?? 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Relationship</span>
                      <span className="font-semibold text-gray-900">{fam.relationship ?? 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Blood Group</span>
                      <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded inline-block">
                        {fam.blood_group ?? 'Not Specified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">City / State</span>
                      <span className="font-semibold text-gray-900">
                        {[fam.city, fam.state].filter(Boolean).join(', ') || 'N/A'}
                      </span>
                    </div>
                  </div>
                  {fam.address && (
                    <div className="mt-3 pt-3 border-t border-gray-200/60 text-xs">
                      <span className="text-gray-400 block">Home Address (Private)</span>
                      <span className="text-gray-700 font-medium">{fam.address}</span>
                    </div>
                  )}
                </div>

                {/* Medical & Special Needs */}
                <div className="bg-red-50/50 rounded-xl p-4 border border-red-200/70">
                  <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-red-600" />
                    Medical Conditions & Emergency Needs
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-red-700/80 font-medium block">Medical Conditions</span>
                      <p className="font-semibold text-gray-900">{fam.medical_conditions || 'None reported'}</p>
                    </div>
                    <div>
                      <span className="text-red-700/80 font-medium block">Allergies</span>
                      <p className="font-semibold text-gray-900">{fam.allergies || 'None reported'}</p>
                    </div>
                    <div>
                      <span className="text-red-700/80 font-medium block">Medications</span>
                      <p className="font-semibold text-gray-900">{fam.medications || 'None reported'}</p>
                    </div>
                    <div>
                      <span className="text-red-700/80 font-medium block">Special Assistance</span>
                      <p className="font-semibold text-gray-900">{fam.special_needs || 'None reported'}</p>
                    </div>
                  </div>
                  {fam.emergency_instructions && (
                    <div className="mt-3 pt-2 border-t border-red-200/50 text-xs">
                      <span className="text-red-800 font-bold block">Emergency Instructions</span>
                      <p className="text-gray-800 font-medium italic mt-0.5">{fam.emergency_instructions}</p>
                    </div>
                  )}
                </div>

                {/* Guardian / Emergency Contacts */}
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-200/70">
                  <h4 className="text-xs font-bold text-[#2844A8] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#2844A8]" />
                    Guardian & Emergency Contacts (Private Admin View)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-blue-700/80 font-medium block">Primary Guardian</span>
                      <p className="font-semibold text-gray-900">
                        {fam.guardian_name || 'N/A'}{' '}
                        {fam.guardian_relationship && `(${fam.guardian_relationship})`}
                      </p>
                      <p className="text-[#2844A8] font-mono mt-0.5">{fam.guardian_phone || 'No phone provided'}</p>
                    </div>
                    {fam.secondary_contact_name && (
                      <div>
                        <span className="text-blue-700/80 font-medium block">Secondary Contact</span>
                        <p className="font-semibold text-gray-900">{fam.secondary_contact_name}</p>
                        <p className="text-[#2844A8] font-mono mt-0.5">{fam.secondary_contact_phone || 'N/A'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ACCESSORY Details */}
            {!isDependent && acc && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/80">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Accessory Information
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400 block">Item Name</span>
                      <span className="font-semibold text-gray-900">{acc.accessory_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Category</span>
                      <span className="font-semibold text-gray-900">{acc.accessory_type ?? 'General'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Brand / Model</span>
                      <span className="font-semibold text-gray-900">
                        {[acc.brand, acc.model].filter(Boolean).join(' ') || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Color</span>
                      <span className="font-semibold text-gray-900">{acc.color ?? 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Serial Number (Private)</span>
                      <span className="font-mono font-semibold text-gray-800">{acc.serial_number ?? 'N/A'}</span>
                    </div>
                  </div>
                  {acc.description && (
                    <div className="mt-3 pt-3 border-t border-gray-200/60 text-xs">
                      <span className="text-gray-400 block">Description</span>
                      <p className="text-gray-700 font-medium mt-0.5">{acc.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>

            <div className="flex items-center space-x-2">
              {profile.status === 'PENDING_REVIEW' && (
                <>
                  <button
                    onClick={() => setConfirmAction('reject')}
                    className="flex items-center px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <XCircle className="w-4 h-4 mr-1.5 text-red-600" />
                    Reject
                  </button>
                  <button
                    onClick={() => setConfirmAction('verify')}
                    className="flex items-center px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Verify Profile
                  </button>
                </>
              )}

              {profile.status === 'VERIFIED' && onGenerateQR && (
                <button
                  onClick={() => onGenerateQR(profile)}
                  className="flex items-center px-4 py-2 text-xs font-semibold text-white bg-[#2844A8] rounded-lg hover:bg-[#1F368A] transition-colors shadow-xs"
                >
                  <QrCode className="w-4 h-4 mr-1.5" />
                  {profile.qr_status === 'GENERATED' || profile.qr_status === 'ACTIVE'
                    ? 'View / Print QR'
                    : 'Generate QR'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmAction !== null}
        title={confirmAction === 'verify' ? 'Verify Safety Profile' : 'Reject Safety Profile'}
        message={
          confirmAction === 'verify'
            ? `Are you sure you want to verify profile ${profile.safety_id} (${profile.name})? This will allow QR generation and issue of safety tags.`
            : `Are you sure you want to reject profile ${profile.safety_id}? The user will be notified of rejection.`
        }
        confirmLabel={confirmAction === 'verify' ? 'Confirm Verification' : 'Confirm Rejection'}
        variant={confirmAction === 'verify' ? 'primary' : 'danger'}
        isLoading={isProcessing}
        onConfirm={handleConfirmAction}
        onClose={() => setConfirmAction(null)}
      />
    </>
  );
};
