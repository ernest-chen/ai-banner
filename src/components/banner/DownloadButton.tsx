'use client';

import React from 'react';
import { Download } from 'lucide-react';

interface DownloadButtonProps {
  onClick: () => void;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
    >
      <Download className="w-5 h-5" />
      <span>Download Banner</span>
    </button>
  );
};
