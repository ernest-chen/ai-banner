'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { BannerCreator } from '@/components/banner/BannerCreator';
import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {user ? (
        <BannerCreator />
      ) : (
        <div>
          <Hero />
          <Features />
        </div>
      )}
    </div>
  );
}