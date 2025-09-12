'use client';

import React from 'react';
import { Save, Loader2 } from 'lucide-react';

interface SaveToGalleryButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const SaveToGalleryButton: React.FC<SaveToGalleryButtonProps> = ({
  onClick,
  isLoading,
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Saving to Gallery...</span>
        </>
      ) : (
        <>
          <Save className="w-5 h-5" />
          <span>Save to Gallery</span>
        </>
      )}
    </button>
  );
};
