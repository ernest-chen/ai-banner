'use client';

import React from 'react';
import { Theme } from '@/types/banner';

interface ThemeSelectorProps {
  themes: Theme[];
  selectedTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  themes,
  selectedTheme,
  onThemeChange
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Design Theme
      </label>
      <div className="grid grid-cols-1 gap-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme)}
            className={`p-4 text-left border rounded-lg transition-all duration-200 cursor-pointer ${
              selectedTheme.id === theme.id
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md hover:scale-[1.02]'
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Color Palette Preview */}
              <div className="flex space-x-1">
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: theme.colorPalette.primary }}
                />
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: theme.colorPalette.secondary }}
                />
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: theme.colorPalette.accent }}
                />
              </div>
              
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">
                  {theme.name}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {theme.description}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs text-gray-500">
                    {theme.fontFamily}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                    {theme.style}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
