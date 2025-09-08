# AI Banner - Professional Banner Creation with AI

AI Banner is a Next.js application that allows customers to create professional banners for LinkedIn, social media, and other platforms using AI-powered design tools. The application features pre-configured sizes, themes, color palettes, and use cases, with social authentication and cloud storage.

## Features

### 🎨 AI-Powered Design
- **Google Gemini 2.5 Lite Integration**: Advanced AI image generation with multimodal capabilities
- **Smart Taglines**: AI-generated powerful messages based on context
- **Professional Themes**: Curated design themes for different industries

### 📐 Pre-configured Sizes
- **Social Media**: LinkedIn, Facebook, Twitter, Instagram, YouTube banners
- **Web**: Hero banners, sidebar ads
- **Print**: Business cards, A4 posters
- **Custom Dimensions**: Support for any banner size

### 🎯 Use Cases
- Personal Branding
- Business Promotion
- Event Announcements
- Product Launches
- Educational Content
- Nonprofit Causes

### 🔐 Authentication & Storage
- **Social Login**: Google and Apple authentication via Firebase
- **Cloud Storage**: Firebase Storage for images and user data
- **User Management**: Profile management and banner galleries

### 🛠️ Customization Options
- Custom text input
- Logo upload and integration
- Context description for AI
- Theme and color palette selection
- Background image options

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Authentication**: Firebase Auth (Google, Apple)
- **Database**: Firestore
- **Storage**: Firebase Storage
- **AI Integration**: Google Gemini 2.5 Lite API
- **UI Components**: Radix UI, Lucide React
- **Styling**: Tailwind CSS with custom design system

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-banner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Google Gemini 2.5 Lite Configuration
   NEXT_PUBLIC_AI_API_KEY=your_gemini_api_key_here
   NEXT_PUBLIC_AI_BASE_URL=https://generativelanguage.googleapis.com
   ```

4. **Set up Firebase**
   - Create a new Firebase project
   - Enable Authentication (Google, Apple providers)
   - Enable Firestore Database
   - Enable Firebase Storage
   - Configure security rules

5. **Run the development server**
```bash
npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Firebase Setup

### Authentication
1. Go to Firebase Console > Authentication > Sign-in method
2. Enable Google provider
3. Enable Apple provider (requires Apple Developer account)
4. Configure OAuth consent screen

### Firestore Database
1. Go to Firebase Console > Firestore Database
2. Create database in production mode
3. Set up security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own banners
    match /banners/{bannerId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.isPublic == true);
    }
    
    // Analytics are write-only for authenticated users
    match /analytics/{analyticsId} {
      allow write: if request.auth != null;
    }
  }
}
```

### Firebase Storage
1. Go to Firebase Console > Storage
2. Set up storage bucket
3. Configure security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /banners/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /logos/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Google Gemini Integration

The application is configured to work with Google Gemini 2.5 Lite for image generation. The AI service automatically handles:

- **Multimodal Generation**: Text-to-image generation with detailed prompts
- **Professional Design**: Optimized prompts for business and marketing banners
- **Safety Filters**: Built-in content safety and moderation
- **High Quality**: Advanced AI model for professional results

### Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env.local` file

The service is already configured and ready to use with your API key!

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── gallery/           # Gallery page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── banner/            # Banner creation components
│   ├── gallery/           # Gallery components
│   ├── home/              # Home page components
│   └── layout/            # Layout components
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
├── data/                  # Static data
│   └── bannerConfigs.ts   # Banner configurations
├── lib/                   # Utility libraries
│   ├── aiService.ts       # AI service integration
│   ├── database.ts        # Database operations
│   ├── firebase.ts        # Firebase configuration
│   └── imageService.ts    # Image management
└── types/                 # TypeScript types
    └── banner.ts          # Banner-related types
```

## Key Features Implementation

### Banner Generation Flow
1. User selects size, theme, and use case
2. Optional: Add custom text, context, and logo
3. AI service generates banner based on parameters
4. Image is saved to Firebase Storage
5. Banner metadata is stored in Firestore
6. User can download or save to gallery

### Authentication Flow
1. User clicks sign in
2. Firebase Auth handles OAuth flow
3. User document is created/updated in Firestore
4. User gains access to banner creation and gallery

### Gallery Management
1. Users can view all their generated banners
2. Filter by visibility (public/private)
3. Search by tags, themes, or use cases
4. Download or delete banners
5. Toggle public visibility

## Customization

### Adding New Banner Sizes
Update `src/data/bannerConfigs.ts`:

```typescript
export const BANNER_SIZES: BannerSize[] = [
  // ... existing sizes
  {
    id: 'custom-size',
    name: 'Custom Size',
    width: 1920,
    height: 1080,
    category: 'web',
    description: 'Custom banner size'
  }
];
```

### Adding New Themes
Update the `THEMES` array in `bannerConfigs.ts`:

```typescript
export const THEMES: Theme[] = [
  // ... existing themes
  {
    id: 'new-theme',
    name: 'New Theme',
    description: 'Description of the new theme',
    colorPalette: newColorPalette,
    fontFamily: 'Font Name',
    style: 'modern'
  }
];
```

### Adding New Use Cases
Update the `USE_CASES` array in `bannerConfigs.ts`:

```typescript
export const USE_CASES: UseCase[] = [
  // ... existing use cases
  {
    id: 'new-use-case',
    name: 'New Use Case',
    description: 'Description of the use case',
    category: 'Category',
    suggestedText: ['Suggested text 1', 'Suggested text 2'],
    suggestedThemes: ['theme1', 'theme2']
  }
];
```

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@aibanner.com or create an issue in the repository.

---

Built with ❤️ using Next.js, Firebase, and AI technology.