# Firebase Setup Guide

This guide will help you configure Firebase for the AI Banner application to resolve the "Missing or insufficient permissions" error.

## 1. Firebase Console Setup

### Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `ai-banner` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication
1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" provider:
   - Click on Google
   - Toggle "Enable"
   - Add your project's support email
   - Click "Save"
5. Enable "Apple" provider (optional):
   - Click on Apple
   - Toggle "Enable"
   - Configure Apple Sign-In settings
   - Click "Save"

### Step 3: Create Firestore Database
1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (we'll update rules later)
4. Select a location for your database
5. Click "Done"

### Step 4: Create Storage Bucket
1. Go to "Storage" in the left sidebar
2. Click "Get started"
3. Choose "Start in test mode" (we'll update rules later)
4. Select a location for your storage
5. Click "Done"

## 2. Configure Security Rules

### Deploy Firestore Rules
1. Install Firebase CLI if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   - Select "Firestore" and "Storage"
   - Use existing project
   - Use default file names

4. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```

### Alternative: Manual Rule Setup
If you prefer to set up rules manually in the Firebase Console:

#### Firestore Rules
1. Go to "Firestore Database" → "Rules"
2. Replace the default rules with the content from `firestore.rules`
3. Click "Publish"

#### Storage Rules
1. Go to "Storage" → "Rules"
2. Replace the default rules with the content from `storage.rules`
3. Click "Publish"

## 3. Get Firebase Configuration

### Step 1: Get Web App Configuration
1. In Firebase Console, click the gear icon → "Project settings"
2. Scroll down to "Your apps" section
3. Click "Add app" → Web app (</>) icon
4. Register your app with a nickname
5. Copy the configuration object

### Step 2: Update Environment Variables
1. Copy the configuration values to your `.env.local` file:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

## 4. Test the Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Try to generate a banner - the permission errors should be resolved

## 5. Troubleshooting

### Common Issues:

1. **"Missing or insufficient permissions"**
   - Ensure security rules are deployed correctly
   - Check that the user is authenticated
   - Verify the rules match your data structure

2. **"Firebase: Error (auth/invalid-api-key)"**
   - Check that your API key is correct in `.env.local`
   - Ensure the API key is from the correct Firebase project

3. **"Failed to fetch" errors**
   - Check your internet connection
   - Verify Firebase project is active
   - Check browser console for CORS errors

### Debug Mode:
To enable debug logging, add this to your `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_DEBUG=true
```

## 6. Production Considerations

- Update security rules for production use
- Set up proper authentication flows
- Configure CORS settings if needed
- Set up monitoring and alerts
- Consider implementing rate limiting

## 7. Security Best Practices

- Never expose sensitive API keys in client-side code
- Use environment variables for all configuration
- Regularly review and update security rules
- Monitor authentication and database usage
- Implement proper error handling

For more information, visit the [Firebase Documentation](https://firebase.google.com/docs).
