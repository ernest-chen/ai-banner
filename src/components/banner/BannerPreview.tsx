'use client';

import React from 'react';
import { BannerSize, Theme, UseCase } from '@/types/banner';
import { Loader2 } from 'lucide-react';

interface BannerPreviewProps {
  size: BannerSize;
  theme: Theme;
  useCase: UseCase;
  customText: string;
  generatedImageUrl: string | null;
  isGenerating: boolean;
  backgroundColor?: string;
  fontColor?: string;
  fontSize?: string;
  logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  logo?: File | null;
  error?: string | null;
}

export const BannerPreview: React.FC<BannerPreviewProps> = ({
  size,
  theme,
  useCase,
  customText,
  generatedImageUrl,
  isGenerating,
  backgroundColor = '#ffffff',
  fontColor = '#000000',
  fontSize = '16',
  logoPosition = 'top-right',
  logo = null,
  error = null
}) => {
  const aspectRatio = size.width / size.height;
  const maxWidth = 600;
  const maxHeight = 400;
  
  let previewWidth = maxWidth;
  let previewHeight = maxWidth / aspectRatio;
  
  if (previewHeight > maxHeight) {
    previewHeight = maxHeight;
    previewWidth = maxHeight * aspectRatio;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Banner Preview
      </h2>
      
      <div className="flex justify-center">
        <div
          className="relative border border-gray-200 rounded-lg overflow-hidden shadow-sm"
          style={{
            width: previewWidth,
            height: previewHeight
          }}
        >
          {isGenerating ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Generating your banner...</p>
              </div>
            </div>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center bg-red-50 border-2 border-red-200 border-dashed">
              <div className="text-center p-6">
                <div className="text-red-500 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Generation Failed</h3>
                <p className="text-sm text-red-600 max-w-md">
                  {error}
                </p>
                <p className="text-xs text-red-500 mt-2">
                  Please try again or check your internet connection.
                </p>
              </div>
            </div>
          ) : generatedImageUrl ? (
            <img
              src={generatedImageUrl}
              alt="Generated banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center relative"
              style={{
                backgroundColor: backgroundColor,
                color: fontColor
              }}
            >
              <div className="text-center p-6">
                <div
                  className="font-bold mb-2"
                  style={{
                    color: fontColor,
                    fontFamily: theme.fontFamily,
                    fontSize: `${fontSize}px`
                  }}
                >
                  {customText || useCase.suggestedText[0]}
                </div>
                <div
                  className="text-sm opacity-75"
                  style={{ 
                    fontFamily: theme.fontFamily,
                    color: fontColor
                  }}
                >
                  {useCase.name}
                </div>
              </div>
              
              {/* Logo preview */}
              {logo && (
                <div
                  className="absolute w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
                  style={(() => {
                    const baseStyle: React.CSSProperties = {};
                    
                    switch (logoPosition) {
                      case 'top-left':
                        baseStyle.top = '16px';
                        baseStyle.left = '16px';
                        break;
                      case 'top-right':
                        baseStyle.top = '16px';
                        baseStyle.right = '16px';
                        break;
                      case 'center':
                        baseStyle.top = '50%';
                        baseStyle.left = '50%';
                        baseStyle.transform = 'translate(-50%, -50%)';
                        break;
                      case 'bottom-left':
                        baseStyle.bottom = '16px';
                        baseStyle.left = '16px';
                        break;
                      case 'bottom-right':
                        baseStyle.bottom = '16px';
                        baseStyle.right = '16px';
                        break;
                    }
                    
                    return baseStyle;
                  })()}
                >
                  <img
                    src={URL.createObjectURL(logo)}
                    alt="Logo preview"
                    className="w-8 h-8 object-contain max-w-full max-h-full"
                    style={{
                      display: 'block',
                      margin: 'auto'
                    }}
                  />
                </div>
              )}
              
              {/* Decorative elements based on theme - follow logo position */}
              {theme.style === 'modern' && (
                <div 
                  className="absolute w-16 h-16 border-2 opacity-20 rounded-full"
                  style={{
                    borderColor: fontColor,
                    ...(() => {
                      const baseStyle: React.CSSProperties = {};
                      
                      switch (logoPosition) {
                        case 'top-left':
                          baseStyle.top = '20px';
                          baseStyle.left = '20px';
                          break;
                        case 'top-right':
                          baseStyle.top = '20px';
                          baseStyle.right = '20px';
                          break;
                        case 'center':
                          baseStyle.top = '50%';
                          baseStyle.left = '50%';
                          baseStyle.transform = 'translate(-50%, -50%)';
                          break;
                        case 'bottom-left':
                          baseStyle.bottom = '20px';
                          baseStyle.left = '20px';
                          break;
                        case 'bottom-right':
                          baseStyle.bottom = '20px';
                          baseStyle.right = '20px';
                          break;
                      }
                      
                      return baseStyle;
                    })()
                  }}
                />
              )}
              {theme.style === 'bold' && (
                <div 
                  className="absolute w-12 h-12 opacity-20 transform rotate-45"
                  style={{
                    backgroundColor: fontColor,
                    ...(() => {
                      const baseStyle: React.CSSProperties = {};
                      
                      switch (logoPosition) {
                        case 'top-left':
                          baseStyle.top = '24px';
                          baseStyle.left = '24px';
                          break;
                        case 'top-right':
                          baseStyle.top = '24px';
                          baseStyle.right = '24px';
                          break;
                        case 'center':
                          baseStyle.top = '50%';
                          baseStyle.left = '50%';
                          baseStyle.transform = 'translate(-50%, -50%) rotate(45deg)';
                          break;
                        case 'bottom-left':
                          baseStyle.bottom = '24px';
                          baseStyle.left = '24px';
                          break;
                        case 'bottom-right':
                          baseStyle.bottom = '24px';
                          baseStyle.right = '24px';
                          break;
                      }
                      
                      return baseStyle;
                    })()
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        {size.name} • {size.width} × {size.height}px
      </div>
      
      {!generatedImageUrl && !isGenerating && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            This is a preview of how your banner will look. Click "Generate Banner" to create the final version with AI.
          </p>
        </div>
      )}
    </div>
  );
};
