'use client';

import React from 'react';
import { BannerSize } from '@/types/banner';
import { Monitor, Smartphone, Printer } from 'lucide-react';

interface SizeSelectorProps {
  sizes: BannerSize[];
  selectedSize: BannerSize;
  onSizeChange: (size: BannerSize) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'social':
      return <Smartphone className="w-4 h-4" />;
    case 'web':
      return <Monitor className="w-4 h-4" />;
    case 'print':
      return <Printer className="w-4 h-4" />;
    default:
      return <Monitor className="w-4 h-4" />;
  }
};

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSizeChange
}) => {
  const groupedSizes = sizes.reduce((acc, size) => {
    if (!acc[size.category]) {
      acc[size.category] = [];
    }
    acc[size.category].push(size);
    return acc;
  }, {} as Record<string, BannerSize[]>);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Banner Size
      </label>
      <div className="space-y-4">
        {Object.entries(groupedSizes).map(([category, categorySizes]) => (
          <div key={category}>
            <div className="flex items-center space-x-2 mb-2">
              {getCategoryIcon(category)}
              <h3 className="text-sm font-medium text-gray-600 capitalize">
                {category}
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {categorySizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => onSizeChange(size)}
                  className={`p-3 text-left border rounded-lg transition-all duration-200 cursor-pointer ${
                    selectedSize.id === size.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {size.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {size.width} × {size.height}px
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {size.width > size.height ? 'Landscape' : 
                       size.width < size.height ? 'Portrait' : 'Square'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {size.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
