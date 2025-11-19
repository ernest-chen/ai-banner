'use client';

import React from 'react';

type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | undefined;

interface LogoPositionSelectorProps {
  selectedPosition: LogoPosition;
  onPositionChange: (position: LogoPosition) => void;
}

const LOGO_POSITIONS: Array<{ value: LogoPosition; label: string; description?: string; icon?: string; isAuto?: boolean }> = [
  { value: undefined, label: 'Auto', description: 'AI chooses', isAuto: true },
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
            key={position.value ?? 'auto'}
            onClick={() => onPositionChange(position.value)}
            className={`p-3 rounded-lg border-2 transition-all hover:bg-gray-50 ${
              selectedPosition === position.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-center">
              {position.isAuto ? (
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 border-2 border-gray-400 rounded-full relative mb-1">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-0.5 bg-gray-400 transform rotate-45"></div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">{position.label}</div>
                  <div className="text-xs text-gray-500">{position.description}</div>
                </div>
              ) : (
                <>
                  <div className="text-lg mb-1">{position.icon}</div>
                  <div className="text-xs text-gray-600">{position.label}</div>
                </>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
