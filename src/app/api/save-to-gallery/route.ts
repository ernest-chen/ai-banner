import { NextRequest, NextResponse } from 'next/server';
import { SecurityValidator } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { localImageUrl, bannerData } = body;
    
    if (!localImageUrl || !bannerData) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    // Validate banner data
    const validatedData = SecurityValidator.validateBannerRequest(bannerData);
    
    // Return success with instructions for client-side upload
    return NextResponse.json({
      success: true,
      message: 'Use client-side Firebase SDK to upload image and save to Firestore',
      validatedData,
      localImageUrl
    });

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
