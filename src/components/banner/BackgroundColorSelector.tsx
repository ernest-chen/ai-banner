'use client';

import React from 'react';

interface BackgroundColorSelectorProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const BACKGROUND_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Light Gray', value: '#f3f4f6' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Dark Gray', value: '#374151' },
  { name: 'Black', value: '#000000' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
];

export const BackgroundColorSelector: React.FC<BackgroundColorSelectorProps> = ({
  selectedColor,
  onColorChange
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Background Color
      </label>
      <div className="grid grid-cols-8 gap-2">
        {BACKGROUND_COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => onColorChange(color.value)}
            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
              selectedColor === color.value
                ? 'border-gray-900 ring-2 ring-gray-300'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            style={{ backgroundColor: color.value }}
            title={color.name}
          />
        ))}
      </div>
      <div className="text-xs text-gray-500">
        Selected: {BACKGROUND_COLORS.find(c => c.value === selectedColor)?.name || 'Custom'}
      </div>
    </div>
  );
};
