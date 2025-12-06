import React from 'react';
import { DollarSign, Scale, Sprout, Tractor } from 'lucide-react';

interface ResultCardProps {
  label: string;
  value: string;
  subValue?: string;
  type: 'income' | 'yield' | 'cost' | 'total';
  icon?: React.ElementType;
}

export const ResultCard: React.FC<ResultCardProps> = ({ label, value, subValue, type, icon }) => {
  let bgClass = 'bg-white text-gray-800 border border-gray-100';
  let iconBgClass = 'bg-green-100';
  let iconColorClass = 'text-green-600';
  let subTextClass = 'text-gray-400';

  if (type === 'income' || type === 'total') {
    bgClass = 'bg-gradient-to-br from-green-600 to-green-700 text-white';
    iconBgClass = 'bg-white/20';
    iconColorClass = 'text-white';
    subTextClass = 'text-green-200';
  } else if (type === 'cost') {
    bgClass = 'bg-white text-gray-800 border border-gray-200';
    iconBgClass = 'bg-orange-100';
    iconColorClass = 'text-orange-600';
    subTextClass = 'text-gray-500';
  }

  // Default Icon logic if not provided
  const IconToRender = icon || (type === 'total' || type === 'income' ? DollarSign : Scale);

  return (
    <div className={`relative overflow-hidden rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg ${bgClass}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${type === 'total' ? 'text-green-100' : 'text-gray-500'}`}>
            {label}
          </p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight">
            {value}
          </h3>
          {subValue && (
            <p className={`mt-1 text-sm ${subTextClass}`}>
              {subValue}
            </p>
          )}
        </div>
        <div className={`rounded-full p-3 ${iconBgClass}`}>
          <IconToRender className={`h-6 w-6 ${iconColorClass}`} />
        </div>
      </div>
    </div>
  );
};