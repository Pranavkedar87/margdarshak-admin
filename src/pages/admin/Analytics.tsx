import React, { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';
import { safetyService, DashboardKPIs } from '../../services/safetyService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const Analytics: React.FC = () => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await safetyService.getDashboardKPIs();
        setKpis(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating real-time analytics..." />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-[#2844A8]" />
          Platform Operational Metrics
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Direct cloud aggregation across pilgrims, tags, and field telemetry
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase">Verification Conversion</span>
          <div className="text-3xl font-extrabold text-[#2844A8]">
            {kpis && kpis.totalParticipants > 0
              ? `${Math.round((kpis.verifiedProfiles / kpis.totalParticipants) * 100)}%`
              : '0%'}
          </div>
          <p className="text-xs text-gray-500">
            {kpis?.verifiedProfiles} verified out of {kpis?.totalParticipants} registrations
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase">Tag Issuance Ratio</span>
          <div className="text-3xl font-extrabold text-[#CA7A00]">
            {kpis && kpis.verifiedProfiles > 0
              ? `${Math.round((kpis.generatedQRs / kpis.verifiedProfiles) * 100)}%`
              : '0%'}
          </div>
          <p className="text-xs text-gray-500">
            {kpis?.generatedQRs} QR codes generated for {kpis?.verifiedProfiles} verified profiles
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase">Total Field Scans</span>
          <div className="text-3xl font-extrabold text-emerald-600">
            {kpis?.recentScans ?? 0}
          </div>
          <p className="text-xs text-gray-500">
            Telemetry pings received from unauthenticated public finders
          </p>
        </div>
      </div>
    </div>
  );
};
