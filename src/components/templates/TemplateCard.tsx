'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Palette, Monitor } from 'lucide-react';

interface Template {
  id: string;
  useCase: {
    name: string;
    description: string;
    category: string;
  };
  theme: {
    name: string;
    style: string;
    colorPalette: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  size: {
    name: string;
    width: number;
    height: number;
    category: string;
  };
  preview: string;
}

interface TemplateCardProps {
  template: Template;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
      {/* Preview Image */}
      <div className="aspect-video bg-gray-100 relative">
        <Image
          src={template.preview}
          alt={`${template.useCase.name} template`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>

      {/* Template Info */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-1">
            {template.useCase.name}
          </h3>
          <p className="text-sm text-gray-600">
            {template.useCase.description}
          </p>
        </div>

        {/* Template Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Palette className="w-4 h-4" />
            <span>{template.theme.name} • {template.theme.style}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Monitor className="w-4 h-4" />
            <span>{template.size.name} • {template.size.width}×{template.size.height}</span>
          </div>
        </div>

        {/* Color Palette Preview */}
        <div className="flex space-x-1 mb-4">
          <div
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: template.theme.colorPalette.primary }}
            title="Primary"
          />
          <div
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: template.theme.colorPalette.secondary }}
            title="Secondary"
          />
          <div
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: template.theme.colorPalette.accent }}
            title="Accent"
          />
        </div>

        {/* Use Template Button */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 w-full justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <span>Use This Template</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
