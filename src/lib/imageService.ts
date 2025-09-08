import { databaseService } from './database';
import { aiService } from './aiService';
import { GeneratedBanner, BannerGenerationRequest, User } from '@/types/banner';

export class ImageService {
  async generateAndSaveBanner(
    request: BannerGenerationRequest,
    user: User
  ): Promise<{ banner: GeneratedBanner; imageUrl: string }> {
    try {
      // Handle logo upload first if present
      let logoUrl: string | undefined;
      if (request.logo) {
        try {
          logoUrl = await databaseService.uploadLogo(request.logo, user.id);
          console.log('Logo uploaded successfully:', logoUrl);
        } catch (logoError) {
          console.warn('Failed to upload logo:', logoError);
          // Continue without logo if upload fails
        }
      }

      // Generate the banner using AI service
      const aiResult = await aiService.generateBanner(request);
      
      if (!aiResult.success || !aiResult.imageUrl) {
        throw new Error(aiResult.error || 'Failed to generate banner');
      }

      // Create composite image with logo if available
      let finalImageBlob: Blob;
      if (logoUrl) {
        console.log('Creating composite image with logo...');
        finalImageBlob = await this.createCompositeImage(aiResult.imageUrl, logoUrl, request);
      } else {
        // Convert image URL to blob for storage
        finalImageBlob = await this.urlToBlob(aiResult.imageUrl);
      }
      
      // Sanitize request object for Firestore (remove undefined values and File objects)
      const sanitizedRequest = this.sanitizeRequestForFirestore(request);
      
      // Add logo URL to sanitized request if available
      if (logoUrl) {
        sanitizedRequest.logoUrl = logoUrl;
      }
      
      // Create banner document
      const bannerData: Omit<GeneratedBanner, 'id'> = {
        userId: user.id,
        request: sanitizedRequest,
        imageUrl: '', // Will be updated after upload
        createdAt: new Date(),
        tags: this.generateTags(request),
        isPublic: false
      };

      // Save banner to database first
      const bannerId = await databaseService.saveBanner(bannerData);
      
      let storageImageUrl: string;
      
      try {
        // Try to upload image to Firebase Storage
        storageImageUrl = await databaseService.uploadBannerImage(
          finalImageBlob,
          user.id,
          bannerId
        );
      } catch (storageError) {
        console.warn('Firebase Storage not available, using placeholder URL:', storageError);
        // Fallback: use the original AI-generated image URL
        storageImageUrl = aiResult.imageUrl;
      }

      // Update banner with storage URL
      console.log('Updating banner with image URL:', storageImageUrl);
      await databaseService.updateBanner(bannerId, {
        imageUrl: storageImageUrl
      });

      // Track analytics
      await databaseService.trackBannerGeneration(user.id, request);

      const banner: GeneratedBanner = {
        id: bannerId,
        ...bannerData,
        imageUrl: storageImageUrl
      };

      return { banner, imageUrl: storageImageUrl };
    } catch (error) {
      console.error('Error generating and saving banner:', error);
      
      // Provide more specific error messages for common Firebase issues
      if (error instanceof Error) {
        if (error.message.includes('Missing or insufficient permissions')) {
          throw new Error('Authentication required. Please sign in to generate banners.');
        } else if (error.message.includes('auth/invalid-api-key')) {
          throw new Error('Firebase configuration error. Please check your environment variables.');
        } else if (error.message.includes('Failed to fetch')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        }
      }
      
      throw error;
    }
  }

  async downloadBanner(banner: GeneratedBanner, user: User): Promise<void> {
    try {
      // Track download analytics
      await databaseService.trackBannerDownload(banner.id, user.id);

      // Create download link
      const link = document.createElement('a');
      link.href = banner.imageUrl;
      link.download = this.generateFileName(banner);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading banner:', error);
      throw error;
    }
  }

  async deleteBanner(banner: GeneratedBanner): Promise<void> {
    try {
      // Delete from database
      await databaseService.deleteBanner(banner.id);
      
      // Delete from storage (if it's a Firebase Storage URL)
      if (banner.imageUrl.includes('firebasestorage.googleapis.com')) {
        await databaseService.deleteFile(banner.imageUrl);
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  }

  async toggleBannerVisibility(banner: GeneratedBanner): Promise<void> {
    try {
      await databaseService.updateBanner(banner.id, {
        isPublic: !banner.isPublic
      });
    } catch (error) {
      console.error('Error toggling banner visibility:', error);
      throw error;
    }
  }

  private async urlToBlob(url: string): Promise<Blob> {
    try {
      console.log('Fetching image from URL:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      return await response.blob();
    } catch (error) {
      console.error('Error in urlToBlob:', error);
      console.error('URL that failed:', url);
      
      // Fallback: create a simple colored canvas as blob
      console.log('Creating fallback image...');
      return this.createFallbackImage();
    }
  }

  private async createCompositeImage(bannerImageUrl: string, logoUrl: string, request: BannerGenerationRequest): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Set canvas dimensions to match the banner size
        canvas.width = request.size.width;
        canvas.height = request.size.height;

        // Load and draw the banner image
        const bannerImage = new Image();
        bannerImage.crossOrigin = 'anonymous';
        
        bannerImage.onload = async () => {
          try {
            // Draw the banner image
            ctx.drawImage(bannerImage, 0, 0, canvas.width, canvas.height);
            
            // Try to load logo as data URL to avoid CORS issues
            try {
              const logoDataUrl = await this.convertImageToDataUrl(logoUrl);
              const logoImage = new Image();
              
              logoImage.onload = () => {
                try {
                  // Calculate logo size and position
                  const logoSize = Math.min(canvas.width * 0.15, canvas.height * 0.3);
                  const logoX = canvas.width - logoSize - 20;
                  const logoY = 20;
                  
                  // Draw logo with white background circle for better visibility
                  const logoCenterX = logoX + logoSize / 2;
                  const logoCenterY = logoY + logoSize / 2;
                  const logoRadius = logoSize / 2 + 10;
                  
                  // Draw white background circle
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                  ctx.beginPath();
                  ctx.arc(logoCenterX, logoCenterY, logoRadius, 0, 2 * Math.PI);
                  ctx.fill();
                  
                  // Draw logo
                  ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
                  
                  // Convert to blob
                  canvas.toBlob((blob) => {
                    if (blob) {
                      resolve(blob);
                    } else {
                      reject(new Error('Failed to create composite image blob'));
                    }
                  }, 'image/png');
                } catch (error) {
                  reject(error);
                }
              };
              
              logoImage.onerror = () => {
                console.warn('Failed to load logo from data URL, using banner without logo');
                // If logo fails to load, just use the banner image
                canvas.toBlob((blob) => {
                  if (blob) {
                    resolve(blob);
                  } else {
                    reject(new Error('Failed to create banner image blob'));
                  }
                }, 'image/png');
              };
              
              logoImage.src = logoDataUrl;
            } catch (logoError) {
              console.warn('Failed to convert logo to data URL, using banner without logo:', logoError);
              // If logo conversion fails, just use the banner image
              canvas.toBlob((blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error('Failed to create banner image blob'));
                }
              }, 'image/png');
            }
          } catch (error) {
            reject(error);
          }
        };
        
        bannerImage.onerror = () => {
          console.warn('Failed to load banner image, trying without CORS...');
          // Try without CORS as fallback
          const fallbackImage = new Image();
          fallbackImage.onload = () => {
            try {
              ctx.drawImage(fallbackImage, 0, 0, canvas.width, canvas.height);
              canvas.toBlob((blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error('Failed to create fallback banner image blob'));
                }
              }, 'image/png');
            } catch (error) {
              reject(error);
            }
          };
          fallbackImage.onerror = () => {
            reject(new Error('Failed to load banner image with and without CORS'));
          };
          fallbackImage.src = bannerImageUrl;
        };
        
        bannerImage.src = bannerImageUrl;
      } catch (error) {
        reject(error);
      }
    });
  }

  private async convertImageToDataUrl(imageUrl: string): Promise<string> {
    try {
      // Use our Next.js API route to proxy the image
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image via proxy: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Convert blob to data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert image to data URL'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read image blob'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Proxy fetch failed, trying direct approach:', error);
      
      // Fallback: try direct fetch (might work for some images)
      try {
        const response = await fetch(imageUrl, {
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              reject(new Error('Failed to convert image to data URL'));
            }
          };
          reader.onerror = () => reject(new Error('Failed to read image blob'));
          reader.readAsDataURL(blob);
        });
      } catch (directError) {
        console.warn('Direct fetch also failed:', directError);
        throw new Error('All methods to load image failed');
      }
    }
  }

  private createFallbackImage(): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Create a gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#2563eb');
        gradient.addColorStop(1, '#1e40af');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('AI Banner Generated', canvas.width / 2, canvas.height / 2);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          resolve(blob || new Blob());
        }, 'image/png');
      } else {
        // If canvas is not available, create a minimal blob
        resolve(new Blob(['fallback'], { type: 'text/plain' }));
      }
    });
  }

  private sanitizeRequestForFirestore(request: BannerGenerationRequest): any {
    // Create a deep copy of the request object and remove undefined values
    const sanitized = { ...request };
    
    // Remove undefined optional fields
    if (sanitized.customText === undefined) {
      delete sanitized.customText;
    }
    
    // Handle File objects - convert to metadata that can be stored in Firestore
    if (sanitized.logo !== undefined) {
      if (sanitized.logo instanceof File) {
        // Convert File object to metadata
        sanitized.logo = {
          name: sanitized.logo.name,
          size: sanitized.logo.size,
          type: sanitized.logo.type,
          lastModified: sanitized.logo.lastModified
        };
      }
    } else {
      delete sanitized.logo;
    }
    
    if (sanitized.context === undefined) {
      delete sanitized.context;
    }
    
    if (sanitized.backgroundImage === undefined) {
      delete sanitized.backgroundImage;
    }
    
    return sanitized;
  }

  private generateTags(request: BannerGenerationRequest): string[] {
    const tags: string[] = [];
    
    // Add size category
    tags.push(request.size.category);
    
    // Add theme style
    tags.push(request.theme.style);
    
    // Add use case category
    tags.push(request.useCase.category.toLowerCase());
    
    // Add specific size
    tags.push(`${request.size.width}x${request.size.height}`);
    
    // Add theme name
    tags.push(request.theme.name.toLowerCase().replace(/\s+/g, '-'));
    
    return tags;
  }

  private generateFileName(banner: GeneratedBanner): string {
    const size = banner.request.size;
    const theme = banner.request.theme;
    const timestamp = new Date(banner.createdAt).toISOString().split('T')[0];
    
    return `banner-${size.name.toLowerCase().replace(/\s+/g, '-')}-${theme.name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.png`;
  }

  async getBannerThumbnail(imageUrl: string, maxWidth: number = 300): Promise<string> {
    // For now, return the original URL
    // In a production app, you might want to use a service like Cloudinary
    // or create thumbnails server-side
    return imageUrl;
  }

  async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const imageService = new ImageService();
