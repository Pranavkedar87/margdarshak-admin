import React, { useState, useEffect } from 'react';
import { BarChart2, PieChart, TrendingUp, Users, QrCode, MapPin, CheckCircle2, Clock, Activity } from 'lucide-react';
import { safetyService, DashboardKPIs } from '../../services/safetyService';
import { scanService } from '../../services/scanService';
import { QRScanEvent } from '../../types/database';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface BarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

const Bar: React.FC<BarProps> = ({ label, value, max, color }) => (
  <div className="flex items-center gap-3 text-xs">
    <span className="w-20 text-right text-gray-600 shrink-0 truncate">{label}</span>
    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }}
      />
    </div>
    <span className="w-6 text-left font-bold text-gray-900 shrink-0">{value}</span>
  </div>
);

interface DonutSegment { label: string; value: number; color: string; }
const DonutChart: React.FC<{ segments: DonutSegment[]; total: number }> = ({ segments, total }) => {
  if (total === 0) return (
    <div className="flex items-center justify-center h-32 text-xs text-gray-400">No data available</div>
  );
  let offset = 0;
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-28 h-28 shrink-0">
        {segments.filter(s => s.value > 0).map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * c;
          const el = (
            <circle
              key={i}
              cx="50" cy="50" r={r}
              fill="none"
              strokeWidth="18"
              stroke={seg.color}
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 50 50)"
            />
          );
          offset += dash;
          return el;
        })}
        <text x="50" y="54" textAnchor="middle" className="text-base" style={{ fontSize: '16px', fontWeight: 700, fill: '#1f2937' }}>{total}</text>
      </svg>
      <div className="space-y-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
            <span className="text-gray-600">{seg.label}</span>
            <span className="font-bold text-gray-900 ml-1">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

function buildScanDailyBuckets(scans: QRScanEvent[], days: number): { date: string; count: number }[] {
  const result: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const count = scans.filter(s => {
      const sd = new Date(s.scanned_at);
      return sd.toDateString() === d.toDateString();
    }).length;
    result.push({ date: key, count });
  }
  return result;
}

export const Analytics: React.FC = () => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [scans, setScans] = useState<QRScanEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [kpiData, scanData] = await Promise.all([
          safetyService.getDashboardKPIs(),
          scanService.getScanEvents(200),
        ]);
        setKpis(kpiData);
        setScans(scanData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner message="Calculating real-time analytics..." />;

  const dailyBuckets = buildScanDailyBuckets(scans, 7);
  const maxDaily = Math.max(...dailyBuckets.map(b => b.count), 1);
  const gpsScans = scans.filter(s => s.latitude !== null).length;
  const noGpsScans = scans.length - gpsScans;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-[#2844A8]" />
          Platform Operational Analytics
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Real aggregated data from Supabase — no mock statistics
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Profiles', value: kpis?.totalParticipants ?? 0, icon: Users, color: 'text-[#2844A8]', bg: 'bg-[#2844A8]/10' },
          { label: 'Verified', value: kpis?.verifiedProfiles ?? 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending Review', value: kpis?.pendingRequests ?? 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Total Scans', value: kpis?.recentScans ?? 0, icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
              <div className="text-[11px] text-gray-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scan Activity Last 7 Days */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 mb-4">
            <TrendingUp className="w-4 h-4 text-[#2844A8]" /> Scan Activity — Last 7 Days
          </h3>
          {scans.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-4 text-center">No scan events recorded yet.</p>
          ) : (
            <div className="space-y-2.5">
              {dailyBuckets.map(({ date, count }) => (
                <Bar key={date} label={date} value={count} max={maxDaily} color="bg-[#2844A8]" />
              ))}
            </div>
          )}
        </div>

        {/* GPS Scan Distribution */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 mb-4">
            <MapPin className="w-4 h-4 text-rose-500" /> GPS Scan Distribution
          </h3>
          <DonutChart
            total={scans.length}
            segments={[
              { label: 'GPS Granted', value: gpsScans, color: '#10b981' },
              { label: 'Location Denied', value: noGpsScans, color: '#d1d5db' },
            ]}
          />
        </div>

        {/* Verification Status */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verification Status
          </h3>
          <DonutChart
            total={kpis?.totalParticipants ?? 0}
            segments={[
              { label: 'Verified', value: kpis?.verifiedProfiles ?? 0, color: '#10b981' },
              { label: 'Pending', value: kpis?.pendingRequests ?? 0, color: '#f59e0b' },
              { label: 'Rejected', value: kpis?.rejectedProfiles ?? 0, color: '#ef4444' },
            ]}
          />
        </div>

        {/* QR Lifecycle */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 mb-4">
            <QrCode className="w-4 h-4 text-[#CA7A00]" /> QR Lifecycle
          </h3>
          {(kpis?.generatedQRs ?? 0) + (kpis?.activeQRs ?? 0) === 0 ? (
            <p className="text-xs text-gray-400 italic py-4 text-center">No QR codes generated yet.</p>
          ) : (
            <div className="space-y-2.5">
              <Bar label="Generated" value={kpis?.generatedQRs ?? 0} max={kpis?.totalParticipants ?? 1} color="bg-[#CA7A00]" />
              <Bar label="Active" value={kpis?.activeQRs ?? 0} max={kpis?.totalParticipants ?? 1} color="bg-emerald-500" />
            </div>
          )}

          {/* Profile type */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5" /> Conversion Summary
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Verification Conversion</span>
                <span className="font-bold text-gray-900">
                  {kpis && kpis.totalParticipants > 0
                    ? `${Math.round((kpis.verifiedProfiles / kpis.totalParticipants) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">QR Issuance Rate</span>
                <span className="font-bold text-gray-900">
                  {kpis && kpis.verifiedProfiles > 0
                    ? `${Math.round((kpis.generatedQRs / kpis.verifiedProfiles) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">GPS Scan Rate</span>
                <span className="font-bold text-gray-900">
                  {scans.length > 0 ? `${Math.round((gpsScans / scans.length) * 100)}%` : '0%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
