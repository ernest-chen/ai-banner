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
    // Google Gemini Integration for enhanced prompts
    if (this.apiKey && this.baseUrl.includes('generativelanguage.googleapis.com')) {
      try {
        // Use Gemini to enhance the prompt for better image generation
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
        console.log('Gemini API URL:', url);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a professional graphic designer. Create a detailed, specific prompt for an AI image generator to create a professional banner with these specifications:

                Original Request: ${prompt}
                
                Banner Specifications:
                - Dimensions: ${request.size.width}x${request.size.height} pixels
                - Style: ${request.theme.style}
                - Primary Color: ${request.theme.colorPalette.primary}
                - Secondary Color: ${request.theme.colorPalette.secondary}
                - Accent Color: ${request.theme.colorPalette.accent}
                - Typography Style: ${request.theme.fontFamily}
                - Use Case: ${request.useCase.name}
                
                Create a detailed, specific prompt that an AI image generator can use to create a professional, high-quality banner. Focus on:
                1. Visual style and composition
                2. Color scheme and contrast
                3. Typography and text placement
                4. Professional appearance
                5. Brand-appropriate design
                
                Return only the enhanced prompt, nothing else.`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1000,
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Extract enhanced prompt from Gemini response
        let enhancedPrompt = prompt;
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
          const textPart = data.candidates[0].content.parts.find((part: any) => part.text);
          if (textPart && textPart.text) {
            enhancedPrompt = textPart.text;
            console.log('Enhanced prompt from Gemini:', enhancedPrompt);
          }
        }
        
        // For now, return a placeholder with the enhanced prompt
        // In a real implementation, you would use this enhanced prompt with an actual image generation service
        console.log('Enhanced prompt generated successfully');
        return this.getPlaceholderImage(request, enhancedPrompt);
      } catch (error) {
        console.error('Gemini API error:', error);
        return this.getPlaceholderImage(request);
      }
    }

    // Fallback to placeholder if no API key or unsupported service
    return this.getPlaceholderImage(request);
  }

  private getPlaceholderImage(request: BannerGenerationRequest, enhancedPrompt?: string): { imageUrl: string } {
    // Prioritize custom text, then enhanced prompt, then use case name
    let displayText = request.customText;
    
    if (!displayText && enhancedPrompt) {
      // Extract meaningful text from the enhanced prompt
      // Look for quoted text first, then extract key phrases
      const quotedMatch = enhancedPrompt.match(/"([^"]+)"/);
      if (quotedMatch) {
        displayText = quotedMatch[1];
      } else {
        // Extract key descriptive words, skipping common words
        const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];
        const words = enhancedPrompt.split(' ')
          .filter(word => word.length > 3 && !commonWords.includes(word.toLowerCase()))
          .slice(0, 3); // Take first 3 meaningful words
        displayText = words.join(' ');
      }
    }
    
    if (!displayText) {
      displayText = request.useCase.name;
    }
    
    // Truncate if too long to avoid URL issues
    const shortText = displayText.length > 30 ? displayText.substring(0, 27) + '...' : displayText;
    
    // Use a more reliable placeholder service with simpler URL
    const bgColor = request.theme.colorPalette.primary.replace('#', '');
    const textColor = request.theme.colorPalette.text.replace('#', '');
    
    return {
      imageUrl: `https://dummyimage.com/${request.size.width}x${request.size.height}/${bgColor}/${textColor}?text=${encodeURIComponent(shortText)}`
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
