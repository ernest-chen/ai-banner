'use client';

import React, { useState } from 'react';
import { GeneratedBanner } from '@/types/banner';
import { Download, ExternalLink, Calendar } from 'lucide-react';

interface BannerCardProps {
  banner: GeneratedBanner;
  onDelete: () => void;
  onUpdate: () => void;
  priority?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const BannerCard: React.FC<BannerCardProps> = ({ banner, onDelete, onUpdate, priority }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  console.log('BannerCard received banner:', {
    id: banner?.id,
    imageUrl: banner?.imageUrl,
    hasRequest: !!banner?.request,
    bannerKeys: banner ? Object.keys(banner) : 'no banner'
  });

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(banner.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `banner-${banner.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // These handlers are kept for future use with dropdown menu
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await onDelete();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleToggleVisibility = async () => {
    try {
      setIsLoading(true);
      await onUpdate();
    } catch (error) {
      console.error('Toggle visibility failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
      {/* Banner Image - Very simple approach */}
      <div className="bg-gray-100 relative min-h-[200px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={banner.imageUrl}
          alt="Banner"
          className="w-full h-full object-cover"
          onLoad={() => {
            console.log('✅ Image loaded successfully:', banner.imageUrl);
          }}
          onError={(e) => {
            console.error('❌ Image failed to load:', banner.imageUrl, e);
          }}
        />
      </div>

      {/* Banner Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 text-sm mb-1">
              {banner.request?.useCase?.name || 'Banner'}
            </h3>
            <p className="text-xs text-gray-500">
              {banner.request?.size?.name || 'Standard'} • {banner.request?.theme?.name || 'Default'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-3">
          <button
            onClick={handleDownload}
            disabled={isLoading}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <Download className="w-3 h-3" />
            <span>Download</span>
          </button>
          
          <button
            onClick={() => window.open(banner.imageUrl, '_blank')}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span>View</span>
          </button>
        </div>

        {/* Date and Visibility */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(banner.createdAt)}
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            banner.isPublic 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {banner.isPublic !== false ? 'Public' : 'Private'}
          </div>
        </div>
      </div>
    </div>
  );
};