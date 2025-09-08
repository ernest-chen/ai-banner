'use client';

import React from 'react';
import { 
  Smartphone, 
  Monitor, 
  Printer, 
  Palette, 
  Zap, 
  Download,
  Upload,
  Sparkles,
  Users,
  Shield
} from 'lucide-react';
import { AuthButton } from '@/components/auth/AuthButton';

const features = [
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: 'Social Media Ready',
    description: 'Perfect sizes for LinkedIn, Facebook, Twitter, Instagram, and YouTube banners.',
    color: 'blue'
  },
  {
    icon: <Palette className="w-8 h-8" />,
    title: 'AI-Powered Design',
    description: 'Advanced AI creates professional designs tailored to your brand and message.',
    color: 'purple'
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: 'Lightning Fast',
    description: 'Generate stunning banners in seconds with our optimized AI technology.',
    color: 'yellow'
  },
  {
    icon: <Upload className="w-8 h-8" />,
    title: 'Logo Integration',
    description: 'Upload your logo and seamlessly integrate it into your banner design.',
    color: 'green'
  },
  {
    icon: <Download className="w-8 h-8" />,
    title: 'High Quality Export',
    description: 'Download your banners in high resolution for any use case.',
    color: 'red'
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Professional Templates',
    description: 'Choose from curated templates for different industries and use cases.',
    color: 'indigo'
  }
];

const useCases = [
  {
    title: 'LinkedIn Profile Banner',
    description: 'Make a professional first impression with a custom LinkedIn banner.',
    image: 'https://dummyimage.com/400x100/2563eb/ffffff?text=LinkedIn+Banner'
  },
  {
    title: 'Social Media Campaign',
    description: 'Create eye-catching banners for your social media marketing campaigns.',
    image: 'https://dummyimage.com/400x200/7c3aed/ffffff?text=Social+Media'
  },
  {
    title: 'Event Promotion',
    description: 'Promote your events with professional banners that capture attention.',
    image: 'https://dummyimage.com/400x150/059669/ffffff?text=Event+Promotion'
  }
];

export const Features: React.FC = () => {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Create Amazing Banners
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform combines cutting-edge technology with professional design principles to help you create stunning banners in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className={`w-16 h-16 bg-${feature.color}-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-${feature.color}-600`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Use Cases Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Popular Use Cases
          </h2>
          <p className="text-xl text-gray-600">
            See how professionals use AI Banner for their projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video">
                <img
                  src={useCase.image}
                  alt={useCase.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {useCase.title}
                </h3>
                <p className="text-gray-600">
                  {useCase.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <Sparkles className="w-12 h-12 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Create Your First Banner?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of professionals who trust AI Banner for their design needs.
            </p>
            <AuthButton />
          </div>
        </div>
      </div>
    </div>
  );
};
