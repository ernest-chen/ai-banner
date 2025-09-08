'use client';

import React from 'react';

interface FontSizeSelectorProps {
  selectedSize: string;
  onSizeChange: (size: string) => void;
}

const FONT_SIZES = [
  { value: '12', label: '12px', description: 'Small' },
  { value: '14', label: '14px', description: 'Small' },
  { value: '16', label: '16px', description: 'Medium' },
  { value: '18', label: '18px', description: 'Medium' },
  { value: '20', label: '20px', description: 'Large' },
  { value: '24', label: '24px', description: 'Large' },
  { value: '28', label: '28px', description: 'XL' },
  { value: '32', label: '32px', description: 'XL' },
  { value: '36', label: '36px', description: 'XXL' },
  { value: '48', label: '48px', description: 'XXL' },
];

export const FontSizeSelector: React.FC<FontSizeSelectorProps> = ({
  selectedSize,
  onSizeChange
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Font Size
      </label>
      <div className="grid grid-cols-5 gap-2">
        {FONT_SIZES.map((size) => (
          <button
            key={size.value}
            onClick={() => onSizeChange(size.value)}
            className={`p-2 rounded-lg border-2 transition-all hover:bg-gray-50 ${
              selectedSize === size.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-center">
              <div className="text-sm font-medium">{size.label}</div>
              <div className="text-xs text-gray-500">{size.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
