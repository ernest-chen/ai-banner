'use client';

import React from 'react';

interface ContextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  maxLength?: number;
}

export const ContextInput: React.FC<ContextInputProps> = ({
  value,
  onChange,
  placeholder,
  label,
  maxLength = 200
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 placeholder-gray-500"
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {value.length}/{maxLength}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Provide additional context to help AI generate more relevant content
      </p>
    </div>
  );
};
