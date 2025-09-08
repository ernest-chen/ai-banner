'use client';

import React from 'react';
import { Sparkles, ArrowRight, Users, Zap, Palette } from 'lucide-react';
import { AuthButton } from '@/components/auth/AuthButton';

export const Hero: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              AI Banner
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create stunning, professional banners for LinkedIn, social media, and more using AI-powered design tools.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <AuthButton />
            <button className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <span>View Examples</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">10K+</div>
              <div className="text-gray-600">Banners Created</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">2.5s</div>
              <div className="text-gray-600">Average Generation</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Palette className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">50+</div>
              <div className="text-gray-600">Design Themes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
