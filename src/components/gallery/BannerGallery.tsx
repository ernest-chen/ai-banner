'use client';

import React, { useState } from 'react';
import { GeneratedBanner } from '@/types/banner';
import { BannerCard } from './BannerCard';
import { EmptyState } from './EmptyState';
import { FilterBar } from './FilterBar';

interface BannerGalleryProps {
  banners: GeneratedBanner[];
  onBannerDelete: () => void;
  onBannerUpdate: () => void;
}

export const BannerGallery: React.FC<BannerGalleryProps> = ({
  banners,
  onBannerDelete,
  onBannerUpdate
}) => {
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBanners = banners.filter(banner => {
    // Filter by visibility
    if (filter === 'public' && !banner.isPublic) return false;
    if (filter === 'private' && banner.isPublic) return false;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        banner.request.useCase.name.toLowerCase().includes(searchLower) ||
        banner.request.theme.name.toLowerCase().includes(searchLower) ||
        banner.request.size.name.toLowerCase().includes(searchLower) ||
        banner.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  if (banners.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <FilterBar
        filter={filter}
        onFilterChange={setFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalCount={banners.length}
        filteredCount={filteredBanners.length}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBanners.map((banner, index) => (
          <BannerCard
            key={banner.id}
            banner={banner}
            onDelete={onBannerDelete}
            onUpdate={onBannerUpdate}
            priority={index < 4} // Priority for first 4 images (above the fold)
          />
        ))}
      </div>

      {filteredBanners.length === 0 && banners.length > 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No banners match your current filters.</p>
        </div>
      )}
    </div>
  );
};
