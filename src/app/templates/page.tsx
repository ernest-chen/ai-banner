'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { TemplateGallery } from '@/components/templates/TemplateGallery';
import { BANNER_SIZES, THEMES, USE_CASES } from '@/data/bannerConfigs';

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Banner Templates
          </h1>
          <p className="text-gray-600">
            Explore our collection of professional banner templates
          </p>
        </div>

        <TemplateGallery
          sizes={BANNER_SIZES}
          themes={THEMES}
          useCases={USE_CASES}
        />
      </div>
    </div>
  );
}
