import { BannerGenerationRequest } from '@/types/banner';

interface AIGenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  prompt?: string;
}

interface AIPromptRequest {
  useCase: string;
  customText?: string;
  context?: string;
  theme: string;
  size: string;
}

export class AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_AI_API_KEY || '';
    this.baseUrl = process.env.NEXT_PUBLIC_AI_BASE_URL || 'https://api.example.com';
  }

  async generatePrompt(request: AIPromptRequest): Promise<string> {
    const { useCase, customText, context, theme, size } = request;
    
    let prompt = `Create a professional banner design for ${useCase}. `;
    
    if (customText) {
      prompt += `Include the text: "${customText}". `;
    }
    
    if (context) {
      prompt += `Context: ${context}. `;
    }
    
    prompt += `Style: ${theme}. `;
    prompt += `Size: ${size}. `;
    
    // Add style-specific instructions
    switch (theme.toLowerCase()) {
      case 'modern-tech':
        prompt += 'Use clean lines, modern typography, and a tech-focused aesthetic. ';
        break;
      case 'creative-agency':
        prompt += 'Use bold colors, creative layouts, and artistic elements. ';
        break;
      case 'luxury-brand':
        prompt += 'Use elegant typography, premium colors, and sophisticated design elements. ';
        break;
      case 'eco-friendly':
        prompt += 'Use natural colors, organic shapes, and sustainable design elements. ';
        break;
      case 'corporate':
        prompt += 'Use professional typography, clean layout, and trustworthy design elements. ';
        break;
      case 'startup-energy':
        prompt += 'Use dynamic colors, energetic layouts, and innovative design elements. ';
        break;
    }
    
    prompt += 'Ensure the design is high-quality, professional, and suitable for the specified use case.';
    
    return prompt;
  }

  async generateBanner(request: BannerGenerationRequest): Promise<AIGenerationResponse> {
    try {
      // Generate the prompt
      const prompt = await this.generatePrompt({
        useCase: request.useCase.name,
        customText: request.customText,
        context: request.context,
        theme: request.theme.name,
        size: `${request.size.width}x${request.size.height}`
      });

      // Call the AI service
      const response = await this.callAIService(prompt, request);

      return {
        success: true,
        imageUrl: response.imageUrl,
        prompt: prompt
      };
    } catch (error) {
      console.error('AI generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async callAIService(prompt: string, request: BannerGenerationRequest): Promise<{ imageUrl: string }> {
    // Google Gemini Native Image Generation Integration
    if (this.apiKey && this.baseUrl.includes('generativelanguage.googleapis.com')) {
      try {
        // Create a detailed prompt for Gemini image generation
        const geminiPrompt = this.createGeminiImagePrompt(request);
        console.log('Gemini image prompt:', geminiPrompt);
        
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
            console.log(`Trying model: ${modelName}`);
            console.log('Gemini Image API URL:', url);
        
            const requestBody = {
              contents: [{
                parts: [
                  {
                    text: geminiPrompt
                  }
                ]
              }]
            };

            console.log('Request body:', JSON.stringify(requestBody, null, 2));

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
                url: url,
                errorBody: errorText
              });
              lastError = new Error(`Model ${modelName} failed: ${response.status} ${response.statusText} - ${errorText}`);
              continue; // Try next model
            }

            const data = await response.json();
            console.log(`Model ${modelName} response:`, data);
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
              // Look for image data in the response parts
              for (const part of data.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                  // Convert base64 to blob URL
                  const imageData = part.inlineData.data;
                  const imageBlob = this.base64ToBlob(imageData, 'image/png');
                  const imageUrl = URL.createObjectURL(imageBlob);
                  
                  console.log(`Generated image URL from ${modelName}:`, imageUrl);
                  return { imageUrl };
                }
              }
            }
            
            console.error(`No image data in ${modelName} response:`, data);
            lastError = new Error(`No image data received from ${modelName}`);
            continue; // Try next model
          } catch (modelError) {
            console.error(`Model ${modelName} error:`, modelError);
            lastError = modelError;
            continue; // Try next model
          }
        }
        
        // If we get here, all models failed
        throw lastError || new Error('All Gemini models failed');
      } catch (error) {
        console.error('Gemini Image API error:', error);
        
        // Try with a simpler prompt as fallback
        try {
          console.log('Attempting fallback with simpler prompt...');
          const simplePrompt = `Create a professional banner with "${request.customText}" text on a ${request.backgroundColor} background, ${request.size.width}x${request.size.height} pixels, ${request.useCase.name} style.`;
          
          // Use the first model for fallback
          const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${this.apiKey}`;
          const fallbackResponse = await fetch(fallbackUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: simplePrompt }]
              }]
            })
          });

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            console.log('Fallback response successful:', fallbackData);
            
            if (fallbackData.candidates && fallbackData.candidates[0] && fallbackData.candidates[0].content && fallbackData.candidates[0].content.parts) {
              for (const part of fallbackData.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                  const imageData = part.inlineData.data;
                  const imageBlob = this.base64ToBlob(imageData, 'image/png');
                  const imageUrl = URL.createObjectURL(imageBlob);
                  
                  console.log('Generated image URL from fallback:', imageUrl);
                  return { imageUrl };
                }
              }
            }
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
        
        return this.getPlaceholderImage(request);
      }
    }

    // Fallback to placeholder if no API key or unsupported service
    return this.getPlaceholderImage(request);
  }

  private createGeminiImagePrompt(request: BannerGenerationRequest): string {
    const { size, theme, useCase, customText, context, backgroundColor, fontColor, fontSize, logoPosition, logo } = request;
    
    // Create a hyper-specific prompt following Gemini's best practices
    let prompt = `Create a professional ${useCase.name.toLowerCase()} banner design with these exact specifications:

BANNER SPECIFICATIONS:
- Dimensions: ${size.width}x${size.height} pixels (${this.getAspectRatio(size)} aspect ratio)
- Typography: ${theme.fontFamily} font family`;

    // Add font size only if specified
    if (fontSize) {
      prompt += `, ${fontSize}px size`;
    } else {
      prompt += `, choose appropriate font size for readability`;
    }

    prompt += `
- Style: ${theme.style} aesthetic`;

    // Add color specifications only if provided
    if (backgroundColor) {
      prompt += `\n- Background: Solid ${backgroundColor} color`;
    } else {
      prompt += `\n- Background: Choose an appropriate background color that complements the ${theme.style} style`;
    }

    if (fontColor) {
      prompt += `\n- Text Color: ${fontColor}`;
    } else {
      prompt += `\n- Text Color: Choose a color that provides excellent contrast and readability`;
    }

    prompt += `\n\nMAIN TEXT: "${customText}"`;

    if (context) {
      prompt += `\nCONTEXT: ${context}`;
    }

    // Add logo positioning instructions if logo is provided
    if (logo) {
      if (logoPosition) {
        const logoPositionInstructions = this.getLogoPositionInstructions(logoPosition, size);
        prompt += `\n\nLOGO REQUIREMENTS:
- A logo will be overlaid on this banner at the ${logoPosition} position
- ${logoPositionInstructions}
- Ensure the main text and other elements do NOT overlap with the logo area
- Leave adequate space around the logo position for clean integration
- The logo area should be clearly defined and unobstructed`;
      } else {
        prompt += `\n\nLOGO REQUIREMENTS:
- A logo will be overlaid on this banner (position to be determined by AI)
- Choose the optimal logo position that works best with the overall design
- Ensure the main text and other elements do NOT overlap with the logo area
- Leave adequate space around the logo for clean integration
- The logo area should be clearly defined and unobstructed`;
      }
    }

    prompt += `\n\nDESIGN REQUIREMENTS:
1. Create a clean, modern banner design`;

    // Add background requirement only if specified
    if (backgroundColor) {
      prompt += ` with ${backgroundColor} background`;
    } else {
      prompt += ` with an appropriate background color`;
    }

    prompt += `
2. Display the text "${customText}" prominently`;

    // Add font color requirement only if specified
    if (fontColor) {
      prompt += ` in ${fontColor} color`;
    } else {
      prompt += ` in a color that ensures excellent readability`;
    }

    prompt += ` using ${theme.fontFamily} typography`;

    // Add font size requirement only if specified
    if (fontSize) {
      prompt += ` at ${fontSize}px size`;
    } else {
      prompt += ` with appropriate font size for optimal readability`;
    }

    prompt += `
3. Ensure excellent readability and professional appearance
4. Use ${theme.colorPalette.primary} as primary accent color
5. Incorporate ${theme.colorPalette.secondary} as secondary elements
6. Add ${theme.colorPalette.accent} as accent highlights
7. Design should be suitable for ${useCase.name} purposes
8. Maintain proper contrast between background and text
9. Create a ${theme.style} visual style
10. Position elements to work well at ${size.width}x${size.height} resolution`;

    if (logo) {
      if (logoPosition) {
        prompt += `
11. IMPORTANT: Design the layout to accommodate a logo at the ${logoPosition} position
12. Ensure NO text or design elements overlap with the logo placement area
13. Create visual balance between the main content and the reserved logo space`;
      } else {
        prompt += `
11. IMPORTANT: Design the layout to accommodate a logo (AI will choose optimal position)
12. Ensure NO text or design elements overlap with the logo placement area
13. Create visual balance between the main content and the logo space
14. Choose the best logo position that enhances the overall design`;
      }
    }

    // Add color guidance when colors are not specified
    if (!backgroundColor || !fontColor) {
      prompt += `
14. IMPORTANT: Choose colors that work harmoniously together and maintain professional appearance
15. Ensure sufficient contrast between text and background for readability
16. Consider the ${theme.style} aesthetic when selecting colors`;
    }

    prompt += `

The banner should be visually striking, professional, and immediately communicate the ${useCase.name} purpose. Focus on clean typography, proper spacing, and a cohesive color scheme.`;

    return prompt;
  }

  private getLogoPositionInstructions(logoPosition: string, size: { width: number; height: number }): string {
    const instructions = {
      'top-left': `Reserve the top-left corner area (approximately 15% of width and 20% of height from the top-left corner)`,
      'top-center': `Reserve the top-center area (approximately 20% of width centered horizontally and 20% of height from the top)`,
      'top-right': `Reserve the top-right corner area (approximately 15% of width and 20% of height from the top-right corner)`,
      'center-left': `Reserve the left-center area (approximately 15% of width from the left edge and 20% of height centered vertically)`,
      'center': `Reserve the center area (approximately 20% of width and 20% of height in the center of the banner)`,
      'center-right': `Reserve the right-center area (approximately 15% of width from the right edge and 20% of height centered vertically)`,
      'bottom-left': `Reserve the bottom-left corner area (approximately 15% of width and 20% of height from the bottom-left corner)`,
      'bottom-center': `Reserve the bottom-center area (approximately 20% of width centered horizontally and 20% of height from the bottom)`,
      'bottom-right': `Reserve the bottom-right corner area (approximately 15% of width and 20% of height from the bottom-right corner)`
    };

    return instructions[logoPosition as keyof typeof instructions] || `Reserve space at the ${logoPosition} position`;
  }

  private getAspectRatio(size: { width: number; height: number }): string {
    const ratio = size.width / size.height;
    
    if (Math.abs(ratio - 16/9) < 0.1) return '16:9';
    if (Math.abs(ratio - 4/3) < 0.1) return '4:3';
    if (Math.abs(ratio - 3/2) < 0.1) return '3:2';
    if (Math.abs(ratio - 1/1) < 0.1) return '1:1';
    if (Math.abs(ratio - 2/1) < 0.1) return '2:1';
    if (Math.abs(ratio - 3/1) < 0.1) return '3:1';
    
    // Default to 16:9 for most banner sizes
    return '16:9';
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  private getPlaceholderImage(request: BannerGenerationRequest, enhancedPrompt?: string): { imageUrl: string } {
    console.log('getPlaceholderImage called with:', {
      customText: request.customText,
      context: request.context,
      enhancedPrompt: enhancedPrompt,
      useCase: request.useCase.name
    });

    // Prioritize custom text, then context, then enhanced prompt, then use case name
    let displayText = request.customText;
    console.log('Initial displayText (customText):', displayText);
    
    // If no custom text but we have context, use a relevant phrase from context
    if (!displayText && request.context) {
      // Extract key words from context, limit to reasonable length
      const contextWords = request.context.split(' ')
        .filter(word => word.length > 2)
        .slice(0, 4); // Take first 4 words
      displayText = contextWords.join(' ');
      console.log('Using context words as displayText:', displayText);
    }
    
    if (!displayText && enhancedPrompt) {
      // Extract meaningful text from the enhanced prompt
      // Look for quoted text first, then extract key phrases
      const quotedMatch = enhancedPrompt.match(/"([^"]+)"/);
      if (quotedMatch) {
        displayText = quotedMatch[1];
        console.log('Using quoted text from enhanced prompt:', displayText);
      } else {
        // Extract key descriptive words, skipping common words
        const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];
        const words = enhancedPrompt.split(' ')
          .filter(word => word.length > 3 && !commonWords.includes(word.toLowerCase()))
          .slice(0, 3); // Take first 3 meaningful words
        displayText = words.join(' ');
        console.log('Using extracted words from enhanced prompt:', displayText);
      }
    }
    
    if (!displayText) {
      displayText = request.useCase.suggestedText[0] || request.useCase.name;
      console.log('Using fallback displayText:', displayText);
    }
    
    // Truncate if too long to avoid URL issues
    const shortText = displayText.length > 30 ? displayText.substring(0, 27) + '...' : displayText;
    console.log('Final displayText (after truncation):', shortText);
    
    // Use a more reliable placeholder service with simpler URL
    const bgColor = request.theme.colorPalette.primary.replace('#', '');
    const textColor = request.theme.colorPalette.text.replace('#', '');
    
    const imageUrl = `https://dummyimage.com/${request.size.width}x${request.size.height}/${bgColor}/${textColor}?text=${encodeURIComponent(shortText)}`;
    console.log('Generated dummyimage.com URL:', imageUrl);
    
    return {
      imageUrl: imageUrl
    };
  }

  async generateTaglines(context: string, useCase: string): Promise<string[]> {
    try {
      // This would call an AI service to generate taglines
      // For now, we'll return some example taglines based on the use case
      const taglineMap: Record<string, string[]> = {
        'personal-branding': [
          'Building the Future, One Innovation at a Time',
          'Passionate Professional | Creative Problem Solver',
          'Transforming Ideas into Reality',
          'Your Success is My Mission'
        ],
        'business-promotion': [
          'Excellence in Every Detail',
          'Innovative Solutions for Modern Challenges',
          'Quality Service, Exceptional Results',
          'Your Trusted Business Partner'
        ],
        'event-announcement': [
          'Don\'t Miss This Exclusive Event',
          'Join Us for an Unforgettable Experience',
          'Limited Seats Available - Register Now',
          'Save the Date for Something Amazing'
        ],
        'product-launch': [
          'Introducing the Future of Innovation',
          'Revolutionary Technology Now Available',
          'Experience the Next Generation',
          'Game-Changing Solution for You'
        ],
        'educational-content': [
          'Knowledge is Power - Share It',
          'Empowering Minds, Changing Lives',
          'Learn, Grow, Succeed Together',
          'Education for a Better Tomorrow'
        ],
        'nonprofit-cause': [
          'Making a Difference Together',
          'Support Our Mission for Change',
          'Join the Movement for Good',
          'Together We Can Make an Impact'
        ]
      };

      return taglineMap[useCase] || [
        'Professional Excellence',
        'Innovation in Action',
        'Quality and Trust',
        'Your Success Partner'
      ];
    } catch (error) {
      console.error('Tagline generation error:', error);
      return ['Professional Excellence', 'Innovation in Action'];
    }
  }
}

export const aiService = new AIService();
