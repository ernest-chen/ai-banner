'use client';

import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  onClick,
  isLoading,
  disabled
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-5 h-5" />
          <span>Generate Banner</span>
        </>
      )}
    </button>
  );
};
