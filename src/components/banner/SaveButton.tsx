'use client';

import React from 'react';
import { Save } from 'lucide-react';

interface SaveButtonProps {
  onClick: () => void;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
    >
      <Save className="w-5 h-5" />
      <span>Save to Gallery</span>
    </button>
  );
};
