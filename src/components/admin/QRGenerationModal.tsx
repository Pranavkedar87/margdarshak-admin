import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Printer, CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { SafetyProfile } from '../../types/database';
import { qrService } from '../../services/qrService';
import { generateQrPng, generateQrSvg, downloadDataUrl, downloadSvgString } from '../../lib/qr';
import { buildSafetyQrPayload } from '../../lib/config';
import { PrintTemplates } from './PrintTemplates';

interface QRGenerationModalProps {
  profile: SafetyProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChanged?: () => void;
}

export const QRGenerationModal: React.FC<QRGenerationModalProps> = ({
  profile,
  isOpen,
  onClose,
  onStatusChanged,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [qrPngUrl, setQrPngUrl] = useState<string>('');
  const [qrSvgString, setQrSvgString] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [printMode, setPrintMode] = useState<'card' | 'wristband' | 'sticker' | null>(null);

  useEffect(() => {
    if (!isOpen || !profile) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setPrintMode(null);

    const initQR = async () => {
      try {
        // Generate or retrieve QR database record (no duplicate row)
        await qrService.generateOrRetrieveQR(profile);

        const payload = buildSafetyQrPayload(profile.safety_id);
        const [png, svg] = await Promise.all([
          generateQrPng(payload, 1024),
          generateQrSvg(payload)
        ]);

        if (isMounted) {
          setQrPngUrl(png);
          setQrSvgString(svg);
          if (onStatusChanged) onStatusChanged();
        }
      } catch (err: any) {
        console.error('QR generation error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to generate QR');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initQR();

    return () => {
      isMounted = false;
    };
  }, [isOpen, profile]);

  if (!isOpen || !profile) return null;

  const handleDownloadPng = () => {
    if (!qrPngUrl) return;
    downloadDataUrl(qrPngUrl, `MargDarshak_QR_${profile.safety_id}.png`);
  };

  const handleDownloadSvg = () => {
    if (!qrSvgString) return;
    downloadSvgString(qrSvgString, `MargDarshak_QR_${profile.safety_id}.svg`);
  };

  const handlePrint = (type: 'card' | 'wristband' | 'sticker') => {
    setPrintMode(type);
    const cleanup = () => {
      setPrintMode(null);
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <>
      {/* Isolated Print Portal: rendered directly into #print-root (outside #root) to guarantee zero dashboard overlay and exactly 1 page */}
      {printMode &&
        createPortal(
          <div className="print-document">
            <PrintTemplates profile={profile} qrDataUrl={qrPngUrl} templateType={printMode} />
          </div>,
          document.getElementById('print-root') || document.body
        )}

      {/* Main Modal UI */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#2844A8]/5 to-transparent">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2844A8] text-white flex items-center justify-center shadow-xs">
                <Shield className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-none">
                  MargDarshak Safety QR
                </h3>
                <span className="text-[11px] font-mono font-semibold text-[#2844A8]">
                  {profile.safety_id}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            {loading ? (
              <div className="py-12 text-center text-gray-500">
                <div className="w-8 h-8 border-3 border-[#2844A8] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs font-semibold">Generating high-resolution QR...</p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            ) : (
              <>
                {/* QR Preview Card */}
                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-200/80">
                    <img
                      src={qrPngUrl}
                      alt="MargDarshak QR"
                      className="w-56 h-56 object-contain"
                    />
                  </div>

                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Digital QR Ready
                    </div>
                    <p className="text-xs text-gray-500 font-mono mt-1 break-all max-w-xs">
                      {buildSafetyQrPayload(profile.safety_id)}
                    </p>
                  </div>
                </div>

                {/* Export Downloads */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Digital Export (High Resolution)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleDownloadPng}
                      className="flex items-center justify-center space-x-2 px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-xs transition-colors"
                    >
                      <Download className="w-4 h-4 text-[#2844A8]" />
                      <span>Download PNG (1024px)</span>
                    </button>
                    <button
                      onClick={handleDownloadSvg}
                      className="flex items-center justify-center space-x-2 px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-xs transition-colors"
                    >
                      <Download className="w-4 h-4 text-[#CA7A00]" />
                      <span>Download Vector SVG</span>
                    </button>
                  </div>
                </div>

                {/* Print Physical Formats */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Physical Printing Layouts
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {profile.profile_type === 'DEPENDENT' ? (
                      <>
                        <button
                          onClick={() => handlePrint('card')}
                          className="flex items-center justify-center space-x-1.5 px-3 py-2.5 bg-[#2844A8] text-white rounded-xl text-xs font-semibold hover:bg-[#1E3482] shadow-xs transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Safety Card</span>
                        </button>
                        <button
                          onClick={() => handlePrint('wristband')}
                          className="flex items-center justify-center space-x-1.5 px-3 py-2.5 bg-gray-800 text-white rounded-xl text-xs font-semibold hover:bg-gray-900 shadow-xs transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Wristband</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handlePrint('sticker')}
                        className="col-span-full flex items-center justify-center space-x-1.5 px-3 py-2.5 bg-[#CA7A00] text-white rounded-xl text-xs font-semibold hover:bg-[#A96400] shadow-xs transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Waterproof Sticker</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
