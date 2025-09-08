'use client';

import React from 'react';
import { UseCase } from '@/types/banner';
import { Briefcase, Users, Calendar, Rocket, GraduationCap, Heart } from 'lucide-react';

interface UseCaseSelectorProps {
  useCases: UseCase[];
  selectedUseCase: UseCase;
  onUseCaseChange: (useCase: UseCase) => void;
}

const getUseCaseIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'professional':
      return <Briefcase className="w-4 h-4" />;
    case 'business':
      return <Users className="w-4 h-4" />;
    case 'events':
      return <Calendar className="w-4 h-4" />;
    case 'marketing':
      return <Rocket className="w-4 h-4" />;
    case 'education':
      return <GraduationCap className="w-4 h-4" />;
    case 'nonprofit':
      return <Heart className="w-4 h-4" />;
    default:
      return <Briefcase className="w-4 h-4" />;
  }
};

export const UseCaseSelector: React.FC<UseCaseSelectorProps> = ({
  useCases,
  selectedUseCase,
  onUseCaseChange
}) => {
  const groupedUseCases = useCases.reduce((acc, useCase) => {
    if (!acc[useCase.category]) {
      acc[useCase.category] = [];
    }
    acc[useCase.category].push(useCase);
    return acc;
  }, {} as Record<string, UseCase[]>);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Use Case
      </label>
      <div className="space-y-4">
        {Object.entries(groupedUseCases).map(([category, categoryUseCases]) => (
          <div key={category}>
            <div className="flex items-center space-x-2 mb-2">
              {getUseCaseIcon(category)}
              <h3 className="text-sm font-medium text-gray-600">
                {category}
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {categoryUseCases.map((useCase) => (
                <button
                  key={useCase.id}
                  onClick={() => onUseCaseChange(useCase)}
                  className={`p-3 text-left border rounded-lg transition-colors ${
                    selectedUseCase.id === useCase.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900">
                    {useCase.name}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {useCase.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
