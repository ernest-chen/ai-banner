'use client';

import React, { useState } from 'react';
import { BannerSize, Theme, UseCase, BannerGenerationRequest, GeneratedBanner } from '@/types/banner';
import { BANNER_SIZES, THEMES, USE_CASES } from '@/data/bannerConfigs';
import { secureImageService } from '@/lib/secureImageService';
import { useAuth } from '@/contexts/AuthContext';
import { SizeSelector } from './SizeSelector';
import { ThemeSelector } from './ThemeSelector';
import { UseCaseSelector } from './UseCaseSelector';
import { TextInput } from './TextInput';
import { LogoUpload } from './LogoUpload';
import { ContextInput } from './ContextInput';
import { BannerPreview } from './BannerPreview';
import { GenerateButton } from './GenerateButton';
import { DownloadButton } from './DownloadButton';
import { SaveButton } from './SaveButton';
import { SaveToGalleryButton } from './SaveToGalleryButton';
import { BackgroundColorSelector } from './BackgroundColorSelector';
import { LogoPositionSelector } from './LogoPositionSelector';
import { FontColorSelector } from './FontColorSelector';
import { FontSizeSelector } from './FontSizeSelector';

export const BannerCreator: React.FC = () => {
  const { user } = useAuth();
  const [selectedSize, setSelectedSize] = useState<BannerSize>(BANNER_SIZES[0]);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(THEMES[0]);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase>(USE_CASES[0]);
  const [customText, setCustomText] = useState('');
  const [context, setContext] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [fontColor, setFontColor] = useState('');
  const [fontSize, setFontSize] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('');
  const [logoPosition, setLogoPosition] = useState<string>('');
  const [generatedBanner, setGeneratedBanner] = useState<GeneratedBanner | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!user) {
      setError('Please sign in to generate banners');
      return;
    }

    if (!customText.trim()) {
      setError('Custom text is required');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const request: BannerGenerationRequest = {
        size: selectedSize,
        theme: selectedTheme,
        useCase: selectedUseCase,
        customText: customText.trim(),
        logo: logo || undefined,
        context: context || undefined,
        backgroundColor: backgroundColor,
        logoPosition: logoPosition,
        fontColor: fontColor,
        fontSize: fontSize
      };

      const result = await secureImageService.generateBanner(request, user);
      setGeneratedBanner({
        id: 'temp-' + Date.now(),
        userId: user.id,
        request,
        imageUrl: result.imageUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (generatedBanner) {
      try {
        // Create a download link for the local image
        const link = document.createElement('a');
        link.href = generatedBanner.imageUrl;
        link.download = `banner-${generatedBanner.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to download banner');
      }
    }
  };

  const handleSave = async () => {
    if (generatedBanner) {
      try {
        await imageService.toggleBannerVisibility(generatedBanner);
        setGeneratedBanner({
          ...generatedBanner,
          isPublic: !generatedBanner.isPublic
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to save banner');
      }
    }
  };

  const handleSaveToGallery = async () => {
    if (generatedBanner && user) {
      try {
        setIsGenerating(true);
        const result = await secureImageService.saveToGallery(
          generatedBanner.imageUrl,
          generatedBanner.request,
          user
        );
        
        // Update the banner with the saved version
        setGeneratedBanner({
          ...generatedBanner,
          id: result.bannerId,
          imageUrl: result.imageUrl
        });
        
        console.log('Banner saved to gallery:', result);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to save to gallery');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Basic Configuration Panel */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Banner Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SizeSelector
              sizes={BANNER_SIZES}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
            />

            <UseCaseSelector
              useCases={USE_CASES}
              selectedUseCase={selectedUseCase}
              onUseCaseChange={setSelectedUseCase}
            />

            <ThemeSelector
              themes={THEMES}
              selectedTheme={selectedTheme}
              onThemeChange={setSelectedTheme}
            />
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Banner Preview
          </h2>
          <BannerPreview
            size={selectedSize}
            theme={selectedTheme}
            useCase={selectedUseCase}
            customText={customText}
            generatedImageUrl={generatedBanner?.imageUrl || null}
            isGenerating={isGenerating}
            backgroundColor={backgroundColor}
            fontColor={fontColor}
            fontSize={fontSize}
            logoPosition={logoPosition}
            logo={logo}
            error={error}
          />
        </div>

        {/* Customization Panel */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Customization & Actions
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Content Customization */}
            <div className="space-y-6">
              <TextInput
                value={customText}
                onChange={setCustomText}
                placeholder="Enter custom text for your banner"
                label="Custom Text"
                required={true}
              />

              <ContextInput
                value={context}
                onChange={setContext}
                placeholder="Describe the context or purpose of your banner"
                label="Context"
              />

              <LogoUpload
                logo={logo}
                onLogoChange={setLogo}
              />

              <LogoPositionSelector
                selectedPosition={logoPosition}
                onPositionChange={setLogoPosition}
              />
            </div>

            {/* Right Column - Design Options & Action Buttons */}
            <div className="space-y-6">
              <div className="space-y-4">
                <BackgroundColorSelector
                  selectedColor={backgroundColor}
                  onColorChange={setBackgroundColor}
                />

                <FontColorSelector
                  selectedColor={fontColor}
                  onColorChange={setFontColor}
                />

                <FontSizeSelector
                  selectedSize={fontSize}
                  onSizeChange={setFontSize}
                />
              </div>

              <div className="space-y-3">
                        <GenerateButton
                          onClick={handleGenerate}
                          isLoading={isGenerating}
                          disabled={isGenerating || !customText.trim()}
                        />

                {generatedBanner && !isGenerating && (
                  <>
                    <DownloadButton onClick={handleDownload} />
                    <SaveToGalleryButton 
                      onClick={handleSaveToGallery}
                      isLoading={false}
                      disabled={generatedBanner.id.startsWith('temp-') === false}
                    />
                  </>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
