# Configuration Checklist

## ✅ Required Configuration Changes

### 1. Environment Variables
- [ ] **Copy secure environment template**
  ```bash
  cp env.secure.example .env.local
  ```

- [ ] **Update client-side variables** (safe to expose in browser)
  ```env
  NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
  NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```

- [ ] **Add server-side variables** (NEVER expose to browser)
  ```env
  FIREBASE_PROJECT_ID=your_project_id
  FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
  FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
  AI_API_KEY=your_gemini_api_key_here
  AI_BASE_URL=https://generativelanguage.googleapis.com
  ```

### 2. Firebase Admin SDK Setup
- [ ] **Generate service account key**
  1. Go to Firebase Console > Project Settings > Service Accounts
  2. Click "Generate new private key"
  3. Download the JSON file
  4. Extract values for `.env.local`

- [ ] **Update Firebase security rules**
  ```bash
  # Deploy Firestore rules
  firebase deploy --only firestore:rules
  
  # Deploy Storage rules  
  firebase deploy --only storage
  ```

### 3. Dependencies
- [ ] **Install Firebase Admin SDK**
  ```bash
  npm install firebase-admin
  ```
  ✅ Already installed

### 4. Security Configuration
- [ ] **Verify security middleware** (`src/middleware.ts`)
  - Security headers configured
  - CSP rules in place
  - CORS headers for API routes

- [ ] **Test security features**
  - Input validation working
  - Rate limiting active
  - Authentication required for API endpoints

### 5. API Endpoints
- [ ] **Verify secure API routes**
  - `/api/generate-banner` - AI generation
  - `/api/upload-logo` - Logo uploads
  - `/api/upload-image` - Image uploads
  - `/api/proxy-image` - Image proxy

## 🔧 Configuration Steps

### Step 1: Environment Setup
```bash
# 1. Copy secure template
cp env.secure.example .env.local

# 2. Update with your actual values
# 3. Move AI_API_KEY from NEXT_PUBLIC_ to server-side
# 4. Add Firebase Admin SDK credentials
```

### Step 2: Firebase Configuration
```bash
# 1. Generate service account key in Firebase Console
# 2. Add credentials to .env.local
# 3. Deploy security rules
firebase deploy --only firestore:rules,storage
```

### Step 3: Test Configuration
```bash
# 1. Start development server
npm run dev

# 2. Test authentication
# 3. Test banner generation
# 4. Test file uploads
```

## ⚠️ Security Reminders

### DO NOT:
- ❌ Expose API keys with `NEXT_PUBLIC_` prefix
- ❌ Commit `.env.local` to version control
- ❌ Use client-side AI API calls
- ❌ Skip input validation
- ❌ Disable security headers

### DO:
- ✅ Use server-side environment variables for sensitive data
- ✅ Validate all user inputs
- ✅ Use HTTPS in production
- ✅ Keep dependencies updated
- ✅ Monitor for security issues

## 🧪 Testing Checklist

### Security Testing
- [ ] **Input Validation**: Try malicious scripts in text fields
- [ ] **Authentication**: Test API access without tokens
- [ ] **Rate Limiting**: Test request limits
- [ ] **File Upload**: Test malicious file uploads
- [ ] **CSP**: Verify Content Security Policy headers

### Functional Testing
- [ ] **Banner Generation**: Create banners successfully
- [ ] **Logo Upload**: Upload and position logos
- [ ] **Gallery**: View generated banners
- [ ] **Download**: Download generated banners
- [ ] **Authentication**: Login/logout functionality

## 🚀 Production Deployment

### Environment Variables
```bash
# Production environment
NEXT_PUBLIC_APP_URL=https://yourdomain.com
AI_API_KEY=your_production_gemini_key
FIREBASE_PROJECT_ID=your_production_project
# ... other production variables
```

### Security Checklist
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] Monitoring set up
- [ ] Backup procedures in place

## 📞 Support

### If Issues Occur:
1. Check environment variables are correctly set
2. Verify Firebase Admin SDK configuration
3. Test API endpoints individually
4. Check browser console for errors
5. Review server logs for authentication issues

### Resources:
- `SECURITY.md` - Comprehensive security guide
- `SECURITY_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `FIREBASE_SETUP.md` - Firebase configuration guide

---

**Note**: This checklist ensures your AI Banner application is properly configured with all security measures in place. Complete each item before deploying to production.
