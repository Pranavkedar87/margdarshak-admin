import React from 'react';
import { ProfileStatus, QRStatus } from '../../types/database';

interface StatusBadgeProps {
  status: ProfileStatus | QRStatus | string;
  type?: 'profile' | 'qr';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'PENDING_REVIEW':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
          Pending Review
        </span>
      );
    case 'VERIFIED':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
          Verified
        </span>
      );
    case 'REJECTED':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 ${className}`}>
          Rejected
        </span>
      );
    case 'REQUESTED':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
          QR Requested
        </span>
      );
    case 'GENERATED':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 ${className}`}>
          QR Generated
        </span>
      );
    case 'ISSUED':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 ${className}`}>
          Issued
        </span>
      );
    case 'ACTIVE':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 ${className}`}>
          Active
        </span>
      );
    case 'SUSPENDED':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-800 border border-yellow-300 ${className}`}>
          Suspended
        </span>
      );
    case 'REVOKED':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
          Revoked
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 ${className}`}>
          {status}
        </span>
      );
  }
};
