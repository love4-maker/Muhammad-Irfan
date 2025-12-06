import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputGroupProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  icon: LucideIcon;
  unit: string;
  step?: number;
  min?: number;
  placeholder?: string;
  readOnly?: boolean;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  value,
  onChange,
  icon: Icon,
  unit,
  step = 1,
  min = 0,
  placeholder,
  readOnly = false
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Icon size={16} className="text-green-600" />
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        <input
          type="number"
          min={min}
          step={step}
          value={value === 0 && !readOnly ? '' : value}
          onChange={(e) => !readOnly && onChange(parseFloat(e.target.value) || 0)}
          readOnly={readOnly}
          className={`block w-full rounded-lg border pl-4 pr-12 py-3 sm:text-lg focus:ring-green-500 focus:border-green-500 
            ${readOnly 
              ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-white border-gray-300'
            }`}
          placeholder={placeholder}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="text-gray-500 sm:text-sm">{unit}</span>
        </div>
      </div>
    </div>
  );
};