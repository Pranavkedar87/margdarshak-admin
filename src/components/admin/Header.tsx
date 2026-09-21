import React, { useState, useEffect } from 'react';
import { Menu, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onMenuToggle,
  onRefresh,
  isRefreshing = false,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    update();
    const timer = setInterval(update, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight tracking-tight flex items-center gap-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-gray-500 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Real-time Live Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>LIVE</span>
        </div>

        {/* Supabase status */}
        <div
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isSupabaseConfigured
              ? 'bg-blue-50 text-[#2844A8] border-blue-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
          title={isSupabaseConfigured ? 'Supabase Connected' : 'Supabase Anon Key Missing in .env'}
        >
          {isSupabaseConfigured ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2844A8]" />
              <span className="hidden md:inline">Supabase Live</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Setup Key</span>
            </>
          )}
        </div>

        {/* Current Time */}
        <div className="hidden lg:block text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
          {currentTime}
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#2844A8]' : 'text-gray-500'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>
    </header>
  );
};
