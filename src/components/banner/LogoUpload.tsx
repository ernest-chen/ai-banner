'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface LogoUploadProps {
  logo: File | null;
  onLogoChange: (file: File | null) => void;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({
  logo,
  onLogoChange
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onLogoChange(acceptedFiles[0]);
    }
  }, [onLogoChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const removeLogo = () => {
    onLogoChange(null);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Logo Upload (Optional)
      </label>
      
      {logo ? (
        <div className="relative">
          <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg">
            <ImageIcon className="w-8 h-8 text-gray-400" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {logo.name}
              </div>
              <div className="text-xs text-gray-500">
                {(logo.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            <button
              onClick={removeLogo}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <div className="text-sm text-gray-600">
            {isDragActive ? (
              'Drop your logo here...'
            ) : (
              <>
                <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
              </>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            PNG, JPG, GIF, SVG up to 5MB
          </div>
        </div>
      )}
    </div>
  );
};
