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

      // Validate banner data on server side
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
        throw new Error(errorData.error || 'Failed to validate banner data');
      }

      const validationResult = await response.json();
      
      // Debug user object
      console.log('User object in saveToGallery:', user);
      console.log('User ID:', user?.id);
      
      if (!user?.id) {
        throw new Error('User ID is required for saving to gallery');
      }
      
      // Now upload image to Firebase Storage using client SDK
      const firebaseStorageUrl = await this.uploadImageToFirebaseStorage(localImageUrl, user.id);
      
      // Save metadata to Firestore using client SDK
      const bannerId = await this.saveBannerToFirestore(validationResult.validatedData, firebaseStorageUrl, user.id);
      
      return {
        bannerId,
        imageUrl: firebaseStorageUrl
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

  private async uploadImageToFirebaseStorage(localImageUrl: string, userId: string): Promise<string> {
    try {
      // Import Firebase Storage and Auth
      const { getStorage, ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
      const { auth } = await import('./firebase');
      
      // Check if user is authenticated
      if (!auth.currentUser) {
        throw new Error('User must be authenticated to upload images');
      }
      
      console.log('Current Firebase user:', auth.currentUser?.uid);
      console.log('Expected userId:', userId);
      
      // Ensure the current user matches the expected userId
      if (auth.currentUser?.uid !== userId) {
        throw new Error(`User ID mismatch: current user ${auth.currentUser?.uid} does not match expected ${userId}`);
      }
      
      // Convert local image URL to blob
      const response = await fetch(localImageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch local image');
      }
      
      const blob = await response.blob();
      
      // Create storage reference
      const storage = getStorage();
      const fileName = `banners/${userId}/banner-${Date.now()}.png`;
      const storageRef = ref(storage, fileName);
      
      console.log('Uploading to path:', fileName);
      
      // Upload file with metadata
      const metadata = {
        contentType: 'image/png',
      };
      
      const uploadTask = uploadBytesResumable(storageRef, blob, metadata);
      
      // Wait for upload to complete
      const snapshot = await new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            // Progress monitoring (optional)
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
          },
          (error) => {
            console.error('Upload error:', error);
            reject(error);
          },
          () => {
            resolve(uploadTask.snapshot);
          }
        );
      });
      
      // Get download URL
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      console.log('File available at', downloadURL);
      
      return downloadURL;
      
    } catch (error) {
      console.error('Failed to upload image to Firebase Storage:', error);
      throw error;
    }
  }

  private async saveBannerToFirestore(validatedData: BannerGenerationRequest, imageUrl: string, userId: string): Promise<string> {
    try {
      // Import Firestore
      const { getFirestore, collection, addDoc } = await import('firebase/firestore');
      
      // Create banner document matching GeneratedBanner interface
      const bannerDoc = {
        userId,
        imageUrl,
        createdAt: new Date(),
        request: validatedData, // Nest the banner data under 'request' property
        tags: [], // Default empty tags
        isPublic: false, // Default to private
      };
      
      // Save to Firestore
      const db = getFirestore();
      const docRef = await addDoc(collection(db, 'banners'), bannerDoc);
      
      console.log(`Saved banner to Firestore with ID: ${docRef.id}`);
      return docRef.id;
      
    } catch (error) {
      console.error('Failed to save banner to Firestore:', error);
      throw error;
    }
  }

}

export const secureImageService = new SecureImageService();
