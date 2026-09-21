import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  count: number | string;
  subtitle: string;
  icon?: LucideIcon;
  color?: 'navy' | 'saffron' | 'green' | 'red' | 'gray';
  loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  count,
  subtitle,
  icon: Icon,
  color = 'navy',
  loading = false,
}) => {
  const getBorderColor = () => {
    switch (color) {
      case 'saffron':
        return 'border-t-[#CA7A00]';
      case 'green':
        return 'border-t-emerald-600';
      case 'red':
        return 'border-t-rose-600';
      case 'gray':
        return 'border-t-gray-400';
      default:
        return 'border-t-[#2844A8]';
    }
  };

  const getBadgeColor = () => {
    switch (color) {
      case 'saffron':
        return 'text-[#CA7A00] bg-[#FFF4E6]';
      case 'green':
        return 'text-emerald-700 bg-emerald-50';
      case 'red':
        return 'text-rose-700 bg-rose-50';
      default:
        return 'text-[#2844A8] bg-blue-50';
    }
  };

  return (
    <div
      className={`bg-white rounded-xl p-5 border border-gray-200 border-t-4 ${getBorderColor()} shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-sm`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
          {title}
        </span>
        {Icon && (
          <div className={`p-1.5 rounded-lg ${getBadgeColor()}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="my-2">
        {loading ? (
          <div className="h-9 w-20 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {count}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 font-medium">
        {subtitle}
      </div>
    </div>
  );
};
