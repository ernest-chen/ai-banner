import { BannerGenerationRequest } from '@/types/banner';

// Security validation utilities
export class SecurityValidator {
  private static readonly MAX_TEXT_LENGTH = 500;
  private static readonly MAX_CONTEXT_LENGTH = 1000;
  private static readonly ALLOWED_FONT_SIZES = ['12', '14', '16', '18', '20', '24', '28', '32', '36', '48'];
  private static readonly ALLOWED_BACKGROUND_COLORS = [
    '', // Empty string for 'Auto' option
    '#ffffff', '#f3f4f6', '#6b7280', '#374151', '#000000', // White, Light Gray, Gray, Dark Gray, Black
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', // Blue, Indigo, Purple, Pink
    '#ef4444', '#f97316', '#eab308', // Red, Orange, Yellow
    '#22c55e', '#14b8a6', '#06b6d4' // Green, Teal, Cyan
  ];
  private static readonly ALLOWED_FONT_COLORS = [
    '', // Empty string for 'Auto' option
    '#000000', '#ffffff', '#374151', '#6b7280', '#9ca3af', // Black, White, Dark Gray, Gray, Light Gray
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', // Blue, Indigo, Purple, Pink
    '#ef4444', '#f97316', '#eab308', // Red, Orange, Yellow
    '#22c55e', '#14b8a6', '#06b6d4' // Green, Teal, Cyan
  ];
  private static readonly ALLOWED_LOGO_POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'];

  // Dangerous patterns to block
  private static readonly DANGEROUS_PATTERNS = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi,
    /<link[^>]*>.*?<\/link>/gi,
    /<meta[^>]*>.*?<\/meta>/gi,
    /eval\s*\(/gi,
    /function\s*\(/gi,
    /setTimeout\s*\(/gi,
    /setInterval\s*\(/gi,
    /document\./gi,
    /window\./gi,
    /location\./gi,
    /history\./gi,
    /navigator\./gi,
    /alert\s*\(/gi,
    /confirm\s*\(/gi,
    /prompt\s*\(/gi,
    /XMLHttpRequest/gi,
    /fetch\s*\(/gi,
    /import\s*\(/gi,
    /require\s*\(/gi,
    /process\.env/gi,
    /\.env/gi,
    /localStorage/gi,
    /sessionStorage/gi,
    /cookie/gi,
    /\.innerHTML/gi,
    /\.outerHTML/gi,
    /\.insertAdjacentHTML/gi,
    /\.write\(/gi,
    /\.writeln\(/gi
  ];

  /**
   * Sanitize text input by removing dangerous patterns and limiting length
   */
  static sanitizeText(text: string, maxLength: number = this.MAX_TEXT_LENGTH): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    // Trim whitespace
    let sanitized = text.trim();

    // Check for dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(sanitized)) {
        throw new Error('Invalid content detected. Please remove any scripts or special characters.');
      }
    }

    // Remove HTML tags (basic protection)
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Limit length
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  }

  /**
   * Validate and sanitize banner generation request
   */
  static validateBannerRequest(request: BannerGenerationRequest): BannerGenerationRequest {
    // Validate required fields
    if (!request.size || !request.theme || !request.useCase) {
      throw new Error('Missing required fields: size, theme, or useCase');
    }

    // Sanitize custom text
    if (request.customText) {
      request.customText = this.sanitizeText(request.customText, this.MAX_TEXT_LENGTH);
    }

    // Sanitize context
    if (request.context) {
      request.context = this.sanitizeText(request.context, this.MAX_CONTEXT_LENGTH);
    }

    // Validate background color (allow empty string for 'Auto')
    if (request.backgroundColor !== undefined && request.backgroundColor !== null) {
      if (request.backgroundColor !== '' && !this.ALLOWED_BACKGROUND_COLORS.includes(request.backgroundColor)) {
        throw new Error('Invalid background color selected');
      }
    }

    // Validate font color (allow empty string for 'Auto')
    if (request.fontColor !== undefined && request.fontColor !== null) {
      if (request.fontColor !== '' && !this.ALLOWED_FONT_COLORS.includes(request.fontColor)) {
        throw new Error('Invalid font color selected');
      }
    }

    // Validate font size
    if (request.fontSize && request.fontSize !== '') {
      if (!this.ALLOWED_FONT_SIZES.includes(request.fontSize)) {
        throw new Error('Invalid font size selected');
      }
    }

    // Validate logo position
    if (request.logoPosition) {
      if (!this.ALLOWED_LOGO_POSITIONS.includes(request.logoPosition)) {
        throw new Error('Invalid logo position selected');
      }
    }

    // Validate size dimensions
    if (request.size.width <= 0 || request.size.height <= 0) {
      throw new Error('Invalid banner dimensions');
    }

    if (request.size.width > 4000 || request.size.height > 4000) {
      throw new Error('Banner dimensions too large');
    }

    return request;
  }

  /**
   * Validate file upload
   */
  static validateFile(file: File): void {
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.');
    }

    // Check file name for suspicious patterns
    const suspiciousPatterns = [
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.scr$/i,
      /\.pif$/i,
      /\.com$/i,
      /\.js$/i,
      /\.html$/i,
      /\.htm$/i,
      /\.php$/i,
      /\.asp$/i,
      /\.jsp$/i,
      /\.py$/i,
      /\.sh$/i,
      /\.ps1$/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(file.name)) {
        throw new Error('Invalid file type detected.');
      }
    }
  }

  /**
   * Validate API key format
   */
  static validateApiKey(apiKey: string): boolean {
    if (!apiKey || typeof apiKey !== 'string') {
      return false;
    }

    // Basic format validation for Gemini API key
    const geminiKeyPattern = /^AIza[0-9A-Za-z-_]{35}$/;
    return geminiKeyPattern.test(apiKey);
  }

  /**
   * Rate limiting check (basic implementation)
   */
  private static rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  static checkRateLimit(userId: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userLimit = this.rateLimitMap.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      // Reset or create new limit
      this.rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (userLimit.count >= maxRequests) {
      return false;
    }

    userLimit.count++;
    return true;
  }

  /**
   * Clean up rate limit data
   */
  static cleanupRateLimits(): void {
    const now = Date.now();
    for (const [userId, limit] of this.rateLimitMap.entries()) {
      if (now > limit.resetTime) {
        this.rateLimitMap.delete(userId);
      }
    }
  }
}

// Clean up rate limits every 5 minutes
setInterval(() => {
  SecurityValidator.cleanupRateLimits();
}, 5 * 60 * 1000);
