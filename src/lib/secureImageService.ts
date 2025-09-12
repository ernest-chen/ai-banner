import { BannerGenerationRequest, User, GeneratedBanner } from '@/types/banner';
import { SecurityValidator } from './validation';

interface SecureImageServiceResponse {
  banner: GeneratedBanner;
  imageUrl: string;
}

export class SecureImageService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  async generateAndSaveBanner(
    request: BannerGenerationRequest,
    user: User
  ): Promise<SecureImageServiceResponse> {
    try {
      // Validate request on client side as well
      const validatedRequest = SecurityValidator.validateBannerRequest(request);

      // Get Firebase ID token for authentication
      const token = await this.getFirebaseIdToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      let logoUrl: string | undefined;

      // Handle logo upload if present
      if (validatedRequest.logo) {
        try {
          logoUrl = await this.uploadLogo(validatedRequest.logo, token);
          console.log('Logo uploaded successfully:', logoUrl);
        } catch (logoError) {
          console.warn('Failed to upload logo:', logoError);
          // Continue without logo if upload fails
        }
      }

      // Generate banner using server-side API
      const aiResult = await this.generateBanner(validatedRequest, token);
      
      if (!aiResult.success || !aiResult.imageUrl) {
        throw new Error(aiResult.error || 'Failed to generate banner');
      }

      // Create composite image with logo if available
      let finalImageUrl = aiResult.imageUrl;
      if (logoUrl) {
        console.log('Creating composite image with logo...');
        finalImageUrl = await this.createCompositeImage(aiResult.imageUrl, logoUrl, validatedRequest);
      }

      // Save banner to database
      const bannerData = await this.saveBannerToDatabase(validatedRequest, user, finalImageUrl, logoUrl);

      return {
        banner: bannerData,
        imageUrl: finalImageUrl
      };

    } catch (error) {
      console.error('Secure image service error:', error);
      throw error;
    }
  }

  private async getFirebaseIdToken(): Promise<string | null> {
    try {
      const { auth } = await import('./firebase');
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Failed to get Firebase ID token:', error);
      return null;
    }
  }

  private async uploadLogo(file: File, token: string): Promise<string> {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await fetch(`${this.baseUrl}/api/upload-logo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload logo');
    }

    const result = await response.json();
    return result.logoUrl;
  }

  private async generateBanner(request: BannerGenerationRequest, token: string): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    const response = await fetch(`${this.baseUrl}/api/generate-banner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Failed to generate banner' };
    }

    return await response.json();
  }

  private async createCompositeImage(imageUrl: string, logoUrl: string, request: BannerGenerationRequest): Promise<string> {
    try {
      // Use the existing composite image creation logic
      const { imageService } = await import('./imageService');
      const tempService = new (imageService as any).ImageService();
      
      // Create a temporary request object for composite creation
      const tempRequest = { ...request, logoUrl };
      
      const compositeBlob = await tempService.createCompositeImage(imageUrl, logoUrl, tempRequest);
      
      // Upload composite image to storage
      const compositeUrl = await this.uploadCompositeImage(compositeBlob);
      
      return compositeUrl;
    } catch (error) {
      console.error('Failed to create composite image:', error);
      // Return original image if composite creation fails
      return imageUrl;
    }
  }

  private async uploadCompositeImage(blob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('image', blob, 'composite-banner.png');

    const token = await this.getFirebaseIdToken();
    if (!token) {
      throw new Error('Authentication required for upload');
    }

    const response = await fetch(`${this.baseUrl}/api/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload composite image');
    }

    const result = await response.json();
    return result.imageUrl;
  }

  private async saveBannerToDatabase(
    request: BannerGenerationRequest,
    user: User,
    imageUrl: string,
    logoUrl?: string
  ): Promise<GeneratedBanner> {
    const { databaseService } = await import('./database');
    
    // Sanitize request for database
    const sanitizedRequest = this.sanitizeRequestForDatabase(request);
    
    if (logoUrl) {
      sanitizedRequest.logoUrl = logoUrl;
    }

    const bannerData = {
      userId: user.id,
      request: sanitizedRequest,
      imageUrl: imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const bannerId = await databaseService.saveBanner(bannerData);
    
    return {
      id: bannerId,
      ...bannerData
    };
  }

  private sanitizeRequestForDatabase(request: BannerGenerationRequest): any {
    const sanitized: any = {
      size: request.size,
      theme: request.theme,
      useCase: request.useCase,
      customText: request.customText,
    };

    // Only include defined optional fields
    if (request.context) sanitized.context = request.context;
    if (request.backgroundColor) sanitized.backgroundColor = request.backgroundColor;
    if (request.fontColor) sanitized.fontColor = request.fontColor;
    if (request.fontSize) sanitized.fontSize = request.fontSize;
    if (request.logoPosition) sanitized.logoPosition = request.logoPosition;
    if (request.logoUrl) sanitized.logoUrl = request.logoUrl;

    return sanitized;
  }
}

export const secureImageService = new SecureImageService();
