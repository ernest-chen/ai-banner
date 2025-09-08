'use client';

import React from 'react';
import { BannerSize, Theme, UseCase } from '@/types/banner';
import { TemplateCard } from './TemplateCard';

interface TemplateGalleryProps {
  sizes: BannerSize[];
  themes: Theme[];
  useCases: UseCase[];
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  sizes,
  themes,
  useCases
}) => {
  // Create template combinations
  const templates = useCases.slice(0, 6).map((useCase, index) => ({
    id: `template-${index}`,
    useCase,
    theme: themes[index % themes.length],
    size: sizes[index % sizes.length],
    preview: `https://dummyimage.com/400x200/${themes[index % themes.length].colorPalette.primary.replace('#', '')}/ffffff?text=${encodeURIComponent(useCase.name)}`
  }));

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
          />
        ))}
      </div>
    </div>
  );
};
