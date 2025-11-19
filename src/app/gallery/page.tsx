'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { BannerGallery } from '@/components/gallery/BannerGallery';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratedBanner } from '@/types/banner';
import { databaseService } from '@/lib/database';

export default function GalleryPage() {
  const { user, loading: authLoading } = useAuth();
  const [banners, setBanners] = useState<GeneratedBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBanners = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userBanners = await databaseService.getUserBanners(user.id);
      setBanners(userBanners);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !authLoading) {
      loadBanners();
    } else if (!user && !authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, loadBanners]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your gallery...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Sign in to view your gallery
            </h1>
            <p className="text-gray-600">
              Create an account to save and manage your AI-generated banners.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Gallery
          </h1>
          <p className="text-gray-600">
            Your saved AI-generated banners
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <BannerGallery
          banners={banners}
          onBannerDelete={loadBanners}
          onBannerUpdate={loadBanners}
        />
      </div>
    </div>
  );
}
