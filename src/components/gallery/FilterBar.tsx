'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';

interface FilterBarProps {
  filter: 'all' | 'public' | 'private';
  onFilterChange: (filter: 'all' | 'public' | 'private') => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  totalCount: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  searchTerm,
  onSearchChange,
  totalCount,
  filteredCount
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search banners..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Filter:</span>
          </div>
          
          <div className="flex space-x-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'public', label: 'Public' },
              { key: 'private', label: 'Private' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onFilterChange(key as 'all' | 'public' | 'private')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filter === key
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="text-sm text-gray-500">
          {filteredCount === totalCount ? (
            `${totalCount} banner${totalCount !== 1 ? 's' : ''}`
          ) : (
            `${filteredCount} of ${totalCount} banner${totalCount !== 1 ? 's' : ''}`
          )}
        </div>
      </div>
    </div>
  );
};
