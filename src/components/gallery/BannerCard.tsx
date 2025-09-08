'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { GeneratedBanner } from '@/types/banner';
import { imageService } from '@/lib/imageService';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Download, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar, 
  Tag,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface BannerCardProps {
  banner: GeneratedBanner;
  onDelete: () => void;
  onUpdate: () => void;
  priority?: boolean;
}

export const BannerCard: React.FC<BannerCardProps> = ({
  banner,
  onDelete,
  onUpdate,
  priority = false
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      await imageService.downloadBanner(banner, user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Download failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      setIsLoading(true);
      await imageService.deleteBanner(banner);
      onDelete();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      setIsLoading(true);
      await imageService.toggleBannerVisibility(banner);
      onUpdate();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Update failed');
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
      {/* Banner Image */}
      <div className="aspect-video bg-gray-100 relative group min-h-[200px]">
        {(() => {
          const isFirebase = banner.imageUrl.startsWith('https://firebasestorage.googleapis.com');
          const finalUrl = isFirebase 
            ? `/api/proxy-image?url=${encodeURIComponent(banner.imageUrl)}`
            : banner.imageUrl;
          console.log('BannerCard image URL:', {
            original: banner.imageUrl,
            isFirebase,
            finalUrl
          });
          
          if (isFirebase) {
            // Use regular img tag for proxy URLs to avoid Next.js Image issues
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={finalUrl}
                alt={`${banner.request.useCase.name} banner`}
                className="absolute inset-0 w-full h-full object-cover relative z-10"
                onLoad={() => {
                  console.log('Image loaded successfully:', banner.imageUrl);
                }}
                onError={() => {
                  console.error('Image failed to load:', banner.imageUrl);
                }}
              />
            );
          } else {
            // Use Next.js Image for non-Firebase URLs
            return (
              <Image
                src={finalUrl}
                alt={`${banner.request.useCase.name} banner`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={priority}
                className="object-cover relative z-10"
                onLoad={() => {
                  console.log('Image loaded successfully:', banner.imageUrl);
                }}
                onError={() => {
                  console.error('Image failed to load:', banner.imageUrl);
                }}
              />
            );
          }
        })()}
        
        {/* Debug Label */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded z-30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={(() => {
              const isFirebase = banner.imageUrl.startsWith('https://firebasestorage.googleapis.com');
              return isFirebase 
                ? `/api/proxy-image?url=${encodeURIComponent(banner.imageUrl)}`
                : banner.imageUrl;
            })()} 
            alt="Thumbnail" 
            className="w-88 object-cover mt-1" 
          />
        </div>
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-end justify-center pb-4 z-20 pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2 pointer-events-auto">
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Download"
            >
              <Download className="w-4 h-4 text-gray-700" />
            </button>
            
            <button
              onClick={() => window.open(
                banner.imageUrl.startsWith('https://firebasestorage.googleapis.com') 
                  ? `/api/proxy-image?url=${encodeURIComponent(banner.imageUrl)}`
                  : banner.imageUrl, 
                '_blank'
              )}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
              title="View full size"
            >
              <ExternalLink className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Visibility Badge */}
        <div className="absolute top-2 right-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            banner.isPublic 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {banner.isPublic ? 'Public' : 'Private'}
          </div>
        </div>
      </div>

      {/* Banner Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 text-sm mb-1">
              {banner.request.useCase.name}
            </h3>
            <p className="text-xs text-gray-500">
              {banner.request.size.name} • {banner.request.theme.name}
            </p>
          </div>
          
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </DropdownMenu.Trigger>
            
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="bg-white border border-gray-200 rounded-lg shadow-lg p-1 min-w-[160px]">
                <DropdownMenu.Item
                  onClick={handleToggleVisibility}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 rounded cursor-pointer disabled:opacity-50"
                >
                  {banner.isPublic ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span>Make Private</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Make Public</span>
                    </>
                  )}
                </DropdownMenu.Item>
                
                <DropdownMenu.Item
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 rounded cursor-pointer text-red-600 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {banner.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
          {banner.tags.length > 3 && (
            <span className="text-xs text-gray-400">
              +{banner.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Date */}
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDate(banner.createdAt)}
        </div>
      </div>

      {error && (
        <div className="px-4 pb-4">
          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
            {error}
          </div>
        </div>
      )}
    </div>
  );
};
