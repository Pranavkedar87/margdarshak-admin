import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading data...', 
  className = 'py-12' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-gray-500 ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-[#2844A8] mb-2" />
      <p className="text-sm font-medium text-gray-600">{message}</p>
    </div>
  );
};
