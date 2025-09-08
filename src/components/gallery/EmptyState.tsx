'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Plus } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-12 h-12 text-blue-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        No banners yet
      </h2>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Start creating amazing banners with AI. Choose from our pre-configured sizes, themes, and use cases to get started.
      </p>
      
      <Link
        href="/"
        className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
      >
        <Plus className="w-5 h-5" />
        <span>Create Your First Banner</span>
      </Link>
    </div>
  );
};
