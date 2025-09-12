import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { SecurityValidator } from '@/lib/validation';
import { BannerGenerationRequest } from '@/types/banner';

// Initialize Firebase Admin SDK (server-side only)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

interface ServerAIService {
  generateBanner(request: BannerGenerationRequest): Promise<{ success: boolean; imageUrl?: string; error?: string }>;
}

class SecureAIService implements ServerAIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // Use server-side environment variables (not NEXT_PUBLIC_)
    this.apiKey = process.env.AI_API_KEY || '';
    this.baseUrl = process.env.AI_BASE_URL || 'https://generativelanguage.googleapis.com';
    
    if (!this.apiKey) {
      throw new Error('AI API key not configured');
    }
  }

  async generateBanner(request: BannerGenerationRequest): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    try {
      // Create a detailed prompt for Gemini image generation
      const geminiPrompt = this.createGeminiImagePrompt(request);
      console.log('Server-side Gemini image prompt:', geminiPrompt);
      
      // Try different model names in case the preview model isn't available
      const modelNames = [
        'gemini-2.5-flash-image-preview',
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash'
      ];
      
      let lastError = null;
      
      for (const modelName of modelNames) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`;
          console.log(`Trying server-side model: ${modelName}`);
        
          const requestBody = {
            contents: [{
              parts: [
                {
                  text: geminiPrompt
                }
              ]
            }]
          };

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Model ${modelName} failed:`, {
              status: response.status,
              statusText: response.statusText,
              errorBody: errorText
            });
            lastError = new Error(`Model ${modelName} failed: ${response.status} ${response.statusText}`);
            continue;
          }

          const data = await response.json();
          console.log(`Server-side model ${modelName} response received`);
          
          if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            for (const part of data.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                const imageData = part.inlineData.data;
                console.log(`Received image data from ${modelName}, length: ${imageData.length}`);
                console.log(`First 100 chars: ${imageData.substring(0, 100)}...`);
                
                try {
                  const imageBlob = this.base64ToBlob(imageData, 'image/png');
                  const imageUrl = await this.uploadImageToStorage(imageBlob);
                  
                  console.log(`Server-side generated image URL from ${modelName}: ${imageUrl}`);
                  return { success: true, imageUrl };
                } catch (decodeError) {
                  console.error(`Base64 decode error for ${modelName}:`, decodeError);
                  console.log(`Problematic data sample: ${imageData.substring(0, 200)}...`);
                  continue; // Try next model
                }
              }
            }
          }
          
          console.error(`No image data in ${modelName} response`);
          lastError = new Error(`No image data received from ${modelName}`);
          continue;
        } catch (modelError) {
          console.error(`Model ${modelName} error:`, modelError);
          lastError = modelError;
          continue;
        }
      }
      
      throw lastError || new Error('All AI models failed');
    } catch (error) {
      console.error('Server-side AI generation error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  private createGeminiImagePrompt(request: BannerGenerationRequest): string {
    const { size, theme, useCase, customText, context, backgroundColor, fontColor, fontSize, logoPosition } = request;
    
    let prompt = `Create a professional banner image for ${useCase.name}, ${size.width}x${size.height} pixels. `;
    
    if (customText) {
      prompt += `The main text should be: "${customText}". `;
    }
    
    if (context) {
      prompt += `Additional context: ${context}. `;
    }
    
    prompt += `Style: ${theme.style} theme with ${theme.colorPalette.primary} as primary color. `;
    
    if (backgroundColor && backgroundColor !== '') {
      prompt += `Background color: ${backgroundColor}. `;
    }
    
    if (fontColor && fontColor !== '') {
      prompt += `Text color: ${fontColor}. `;
    }
    
    if (fontSize && fontSize !== '') {
      prompt += `Font size should be ${fontSize}px. `;
    }
    
    if (logoPosition && logoPosition !== '') {
      prompt += `Leave space for a logo to be positioned at ${logoPosition}. `;
    }
    
    prompt += `The banner should be professional, high-quality, and suitable for online use. No text overlays on the logo area.`;
    
    return prompt;
  }

  private base64ToBlob(base64Data: string, mimeType: string): Blob {
    // Clean the base64 data - remove any whitespace or newlines
    const cleanBase64 = base64Data.replace(/\s/g, '');
    
    // Validate base64 format
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
      throw new Error('Invalid base64 format');
    }
    
    // Ensure proper padding
    let paddedBase64 = cleanBase64;
    while (paddedBase64.length % 4 !== 0) {
      paddedBase64 += '=';
    }
    
    try {
      const byteCharacters = atob(paddedBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    } catch (error) {
      throw new Error(`Base64 decoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async uploadImageToStorage(imageBlob: Blob): Promise<string> {
    try {
      const { getStorage } = await import('firebase-admin/storage');
      const bucket = getStorage().bucket();
      
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `ai-generated/banner-${timestamp}.png`;
      
      // Convert blob to buffer
      const buffer = Buffer.from(await imageBlob.arrayBuffer());
      
      // Upload to Firebase Storage
      const file = bucket.file(filename);
      await file.save(buffer, {
        metadata: {
          contentType: 'image/png',
          cacheControl: 'public, max-age=31536000', // 1 year cache
        },
      });
      
      // Make file publicly accessible
      await file.makePublic();
      
      // Return public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
      console.log(`Uploaded image to storage: ${publicUrl}`);
      
      return publicUrl;
    } catch (error) {
      console.error('Failed to upload image to storage:', error);
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let user;
    
    try {
      user = await getAuth().verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Rate limiting
    if (!SecurityValidator.checkRateLimit(user.uid, 5, 60000)) { // 5 requests per minute
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Parse and validate request body
    const body = await request.json();
    
    // Validate banner request
    const validatedRequest = SecurityValidator.validateBannerRequest(body as BannerGenerationRequest);
    
    // Generate banner using server-side AI service
    const aiService = new SecureAIService();
    const result = await aiService.generateBanner(validatedRequest);
    
    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Failed to generate banner' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      imageUrl: result.imageUrl 
    });

  } catch (error) {
    console.error('Generate banner API error:', error);
    
    if (error instanceof Error && error.message.includes('Invalid content detected')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
