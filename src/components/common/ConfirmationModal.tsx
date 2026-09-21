import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-red-100 text-red-600',
          confirmBtn: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-100 text-amber-600',
          confirmBtn: 'bg-[#CA7A00] hover:bg-[#A96400] text-white focus:ring-amber-500',
        };
      default:
        return {
          iconBg: 'bg-blue-100 text-[#2844A8]',
          confirmBtn: 'bg-[#2844A8] hover:bg-[#1F368A] text-white focus:ring-blue-500',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${styles.iconBg}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center justify-end space-x-3 px-5 py-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-lg shadow-sm focus:outline-none ${styles.confirmBtn} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
