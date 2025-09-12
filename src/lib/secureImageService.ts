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

  async generateBanner(request: BannerGenerationRequest, user: User): Promise<{ imageUrl: string; bannerData: BannerGenerationRequest }> {
    try {
      // Validate request on client side as well
      const validatedRequest = SecurityValidator.validateBannerRequest(request);

      // Get Firebase ID token for authentication
      const token = await this.getFirebaseIdToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Generate banner using server-side API (saves locally)
      const aiResult = await this.generateBannerFromAPI(validatedRequest, token);
      
      if (!aiResult.success || !aiResult.imageUrl) {
        throw new Error(aiResult.error || 'Failed to generate banner');
      }

      return {
        imageUrl: aiResult.imageUrl,
        bannerData: validatedRequest
      };

    } catch (error) {
      console.error('Secure image service error:', error);
      throw error;
    }
  }

  async saveToGallery(localImageUrl: string, bannerData: BannerGenerationRequest, user: User): Promise<{ bannerId: string; imageUrl: string }> {
    try {
      // Get Firebase ID token for authentication
      const token = await this.getFirebaseIdToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Save to gallery (uploads to Firebase Storage and saves to Firestore)
      const response = await fetch(`${this.baseUrl}/api/save-to-gallery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          localImageUrl,
          bannerData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save to gallery');
      }

      const result = await response.json();
      return {
        bannerId: result.bannerId,
        imageUrl: result.imageUrl
      };

    } catch (error) {
      console.error('Failed to save to gallery:', error);
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

  private async generateBannerFromAPI(request: BannerGenerationRequest, token: string): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
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

}

export const secureImageService = new SecureImageService();
