'use client';

import React from 'react';

interface LogoPositionSelectorProps {
  selectedPosition: string;
  onPositionChange: (position: string) => void;
}

const LOGO_POSITIONS = [
  { value: 'top-left', label: 'Top Left', icon: '↖️' },
  { value: 'top-right', label: 'Top Right', icon: '↗️' },
  { value: 'center', label: 'Center', icon: '⭕' },
  { value: 'bottom-left', label: 'Bottom Left', icon: '↙️' },
  { value: 'bottom-right', label: 'Bottom Right', icon: '↘️' },
];

export const LogoPositionSelector: React.FC<LogoPositionSelectorProps> = ({
  selectedPosition,
  onPositionChange
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Logo Position
      </label>
      <div className="grid grid-cols-3 gap-2">
        {LOGO_POSITIONS.map((position) => (
          <button
            key={position.value}
            onClick={() => onPositionChange(position.value)}
            className={`p-3 rounded-lg border-2 transition-all hover:bg-gray-50 ${
              selectedPosition === position.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-center">
              <div className="text-lg mb-1">{position.icon}</div>
              <div className="text-xs text-gray-600">{position.label}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
