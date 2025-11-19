import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { SecurityValidator } from '@/lib/validation';

// Lazy initialization of Firebase Admin SDK
function initializeFirebase() {
  if (!getApps().length) {
    try {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      // Only initialize if all required env vars are present
      if (projectId && clientEmail && privateKey) {
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
      }
    } catch (error) {
      // Silently fail during build - will be initialized at runtime
      console.warn('Firebase initialization skipped:', error);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Firebase (lazy initialization)
    initializeFirebase();
    
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
    if (!SecurityValidator.checkRateLimit(user.uid, 10, 60000)) { // 10 uploads per minute
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    SecurityValidator.validateFile(file);

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'png';
    const fileName = `banners/${user.uid}/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Firebase Storage
    const bucket = getStorage().bucket();
    const fileRef = bucket.file(fileName);
    
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          uploadedBy: user.uid,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    // Make file publicly readable
    await fileRef.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      imageUrl: publicUrl,
      fileName: fileName 
    });

  } catch (error) {
    console.error('Upload image API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('File size too large')) {
        return NextResponse.json({ error: error.message }, { status: 413 });
      }
      if (error.message.includes('Invalid file type')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Handle preflight requests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
