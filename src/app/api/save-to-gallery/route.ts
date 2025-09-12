import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { SecurityValidator } from '@/lib/validation';

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

    // Parse request body
    const body = await request.json();
    const { localImageUrl, bannerData } = body;
    
    if (!localImageUrl || !bannerData) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    // Validate banner data
    const validatedData = SecurityValidator.validateBannerRequest(bannerData);
    
    try {
      // For now, just save the banner metadata to Firestore with the local image URL
      // TODO: Upload to Firebase Storage when decoder issues are resolved
      
      console.log('Saving banner metadata to Firestore...');
      
      // Save banner metadata to Firestore
      const db = getFirestore();
      const bannerDoc = {
        userId: user.uid,
        imageUrl: localImageUrl, // Use local URL for now
        createdAt: new Date(),
        ...validatedData,
      };
      
      const docRef = await db.collection('banners').add(bannerDoc);
      console.log(`Saved banner to Firestore with ID: ${docRef.id}`);
      
      return NextResponse.json({
        success: true,
        bannerId: docRef.id,
        imageUrl: localImageUrl,
        message: 'Banner saved to gallery successfully (local storage)'
      });
      
    } catch (saveError) {
      console.error('Failed to save banner to gallery:', saveError);
      return NextResponse.json({ 
        error: 'Failed to save banner to gallery' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Save to gallery API error:', error);
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
