export interface BannerSize {
  id: string;
  name: string;
  width: number;
  height: number;
  category: 'social' | 'web' | 'print' | 'presentation';
  description: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colorPalette: ColorPalette;
  fontFamily: string;
  style: 'modern' | 'classic' | 'minimalist' | 'bold' | 'elegant';
}

export interface UseCase {
  id: string;
  name: string;
  description: string;
  category: string;
  suggestedText: string[];
  suggestedThemes: string[];
}

export interface BannerTemplate {
  id: string;
  name: string;
  size: BannerSize;
  theme: Theme;
  useCase: UseCase;
  backgroundImage?: string;
  text: string;
  logo?: string;
}

export interface BannerGenerationRequest {
  size: BannerSize;
  theme: Theme;
  useCase: UseCase;
  customText?: string;
  logo?: File;
  context?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  fontColor?: string;
  fontSize?: string;
}

export interface GeneratedBanner {
  id: string;
  userId: string;
  request: BannerGenerationRequest;
  imageUrl: string;
  createdAt: Date;
  tags: string[];
  isPublic: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  subscription?: 'free' | 'premium';
}
