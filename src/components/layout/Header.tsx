'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, GalleryVertical, User } from 'lucide-react';
import { AuthButton } from '@/components/auth/AuthButton';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AI Banner</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-200 transition-colors"
            >
              Create
            </Link>
            <Link
              href="/gallery"
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-200 transition-colors flex items-center space-x-1"
            >
              <GalleryVertical className="w-4 h-4" />
              <span>Gallery</span>
            </Link>
            <Link
              href="/templates"
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-200 transition-colors"
            >
              Templates
            </Link>
          </nav>

          {/* Auth Button */}
          <AuthButton />
        </div>
      </div>
    </header>
  );
};
