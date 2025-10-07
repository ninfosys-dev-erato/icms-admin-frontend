import { NextRequest, NextResponse } from 'next/server';
import { BackblazeService } from '@/services/backblaze-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const { mediaId } = await params;

    if (!mediaId) {
      return NextResponse.json(
        { success: false, message: 'Media ID is required' },
        { status: 400 }
      );
    }

    // Try to get the media URL with fallback options
    const mediaUrl = await BackblazeService.getMediaUrlWithFallback(mediaId, {
      preferPresigned: false, // For direct access, prefer direct URL
      fallbackToDirect: true,
    });
    
    return NextResponse.json({
      success: true,
      url: mediaUrl,
    });
  } catch (error) {
    console.error('Failed to get media URL:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to get media URL' 
      },
      { status: 500 }
    );
  }
} 