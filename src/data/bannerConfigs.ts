import { BannerSize, ColorPalette, Theme, UseCase } from '@/types/banner';

export const BANNER_SIZES: BannerSize[] = [
  // Social Media
  {
    id: 'linkedin-banner',
    name: 'LinkedIn Banner',
    width: 1584,
    height: 396,
    category: 'social',
    description: 'Perfect for LinkedIn profile headers'
  },
  {
    id: 'facebook-cover',
    name: 'Facebook Cover',
    width: 1200,
    height: 630,
    category: 'social',
    description: 'Facebook page cover photo'
  },
  {
    id: 'twitter-header',
    name: 'Twitter Header',
    width: 1500,
    height: 500,
    category: 'social',
    description: 'Twitter profile header image'
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    width: 1080,
    height: 1920,
    category: 'social',
    description: 'Instagram story format'
  },
  {
    id: 'youtube-banner',
    name: 'YouTube Banner',
    width: 2560,
    height: 1440,
    category: 'social',
    description: 'YouTube channel banner'
  },
  // Web
  {
    id: 'web-hero',
    name: 'Web Hero Banner',
    width: 1920,
    height: 1080,
    category: 'web',
    description: 'Website hero section banner'
  },
  {
    id: 'web-sidebar',
    name: 'Web Sidebar',
    width: 300,
    height: 250,
    category: 'web',
    description: 'Website sidebar advertisement'
  },
  // Print
  {
    id: 'business-card',
    name: 'Business Card',
    width: 1050,
    height: 600,
    category: 'print',
    description: 'Business card design'
  },
  {
    id: 'poster-a4',
    name: 'A4 Poster',
    width: 2480,
    height: 3508,
    category: 'print',
    description: 'A4 size poster for printing'
  }
];

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'professional-blue',
    name: 'Professional Blue',
    primary: '#2563eb',
    secondary: '#1e40af',
    accent: '#3b82f6',
    background: '#f8fafc',
    text: '#1e293b'
  },
  {
    id: 'warm-orange',
    name: 'Warm Orange',
    primary: '#ea580c',
    secondary: '#c2410c',
    accent: '#fb923c',
    background: '#fff7ed',
    text: '#431407'
  },
  {
    id: 'elegant-purple',
    name: 'Elegant Purple',
    primary: '#7c3aed',
    secondary: '#6d28d9',
    accent: '#a78bfa',
    background: '#faf5ff',
    text: '#581c87'
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    primary: '#059669',
    secondary: '#047857',
    accent: '#10b981',
    background: '#ecfdf5',
    text: '#064e3b'
  },
  {
    id: 'minimalist-gray',
    name: 'Minimalist Gray',
    primary: '#6b7280',
    secondary: '#4b5563',
    accent: '#9ca3af',
    background: '#f9fafb',
    text: '#111827'
  },
  {
    id: 'bold-red',
    name: 'Bold Red',
    primary: '#dc2626',
    secondary: '#b91c1c',
    accent: '#ef4444',
    background: '#fef2f2',
    text: '#7f1d1d'
  }
];

export const THEMES: Theme[] = [
  {
    id: 'modern-tech',
    name: 'Modern Tech',
    description: 'Clean, contemporary design perfect for technology companies',
    colorPalette: COLOR_PALETTES[0], // Professional Blue
    fontFamily: 'Inter',
    style: 'modern'
  },
  {
    id: 'creative-agency',
    name: 'Creative Agency',
    description: 'Bold and vibrant design for creative professionals',
    colorPalette: COLOR_PALETTES[1], // Warm Orange
    fontFamily: 'Poppins',
    style: 'bold'
  },
  {
    id: 'luxury-brand',
    name: 'Luxury Brand',
    description: 'Elegant and sophisticated design for premium brands',
    colorPalette: COLOR_PALETTES[2], // Elegant Purple
    fontFamily: 'Playfair Display',
    style: 'elegant'
  },
  {
    id: 'eco-friendly',
    name: 'Eco-Friendly',
    description: 'Natural and sustainable design for green businesses',
    colorPalette: COLOR_PALETTES[3], // Nature Green
    fontFamily: 'Open Sans',
    style: 'minimalist'
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professional and trustworthy design for corporate use',
    colorPalette: COLOR_PALETTES[4], // Minimalist Gray
    fontFamily: 'Roboto',
    style: 'classic'
  },
  {
    id: 'startup-energy',
    name: 'Startup Energy',
    description: 'Dynamic and energetic design for startups',
    colorPalette: COLOR_PALETTES[5], // Bold Red
    fontFamily: 'Montserrat',
    style: 'bold'
  }
];

export const USE_CASES: UseCase[] = [
  {
    id: 'personal-branding',
    name: 'Personal Branding',
    description: 'Build your professional online presence',
    category: 'Professional',
    suggestedText: [
      'Your Name | Professional Title',
      'Passionate about [Your Field]',
      'Let\'s connect and collaborate',
      'Building the future of [Industry]'
    ],
    suggestedThemes: ['modern-tech', 'corporate', 'luxury-brand']
  },
  {
    id: 'business-promotion',
    name: 'Business Promotion',
    description: 'Promote your business or services',
    category: 'Business',
    suggestedText: [
      'Transform Your Business Today',
      'Innovative Solutions for Modern Problems',
      'Quality Service, Exceptional Results',
      'Your Success is Our Mission'
    ],
    suggestedThemes: ['modern-tech', 'creative-agency', 'corporate']
  },
  {
    id: 'event-announcement',
    name: 'Event Announcement',
    description: 'Announce upcoming events or webinars',
    category: 'Events',
    suggestedText: [
      'Join Us for an Amazing Event',
      'Don\'t Miss Out - Register Now',
      'Exclusive Event - Limited Seats',
      'Save the Date: [Event Name]'
    ],
    suggestedThemes: ['creative-agency', 'startup-energy', 'bold-red']
  },
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Launch your new product or service',
    category: 'Marketing',
    suggestedText: [
      'Introducing Our Latest Innovation',
      'Revolutionary Product Now Available',
      'The Future is Here - Try It Now',
      'Game-Changing Solution for You'
    ],
    suggestedThemes: ['modern-tech', 'startup-energy', 'creative-agency']
  },
  {
    id: 'educational-content',
    name: 'Educational Content',
    description: 'Share knowledge and educational content',
    category: 'Education',
    suggestedText: [
      'Learn Something New Today',
      'Knowledge is Power - Share It',
      'Empowering Minds, Changing Lives',
      'Education for a Better Tomorrow'
    ],
    suggestedThemes: ['eco-friendly', 'corporate', 'luxury-brand']
  },
  {
    id: 'nonprofit-cause',
    name: 'Nonprofit Cause',
    description: 'Support a cause or nonprofit organization',
    category: 'Nonprofit',
    suggestedText: [
      'Making a Difference Together',
      'Support Our Mission',
      'Join the Movement for Change',
      'Together We Can Make a Impact'
    ],
    suggestedThemes: ['eco-friendly', 'luxury-brand', 'corporate']
  }
];
