import { NextRequest, NextResponse } from 'next/server';
import { BackblazeService } from '@/services/backblaze-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const { mediaId } = await params;
    const { searchParams } = new URL(request.url);
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600', 10);

    if (!mediaId) {
      return NextResponse.json(
        { success: false, message: 'Media ID is required' },
        { status: 400 }
      );
    }

    const presignedUrl = await BackblazeService.getPresignedUrl(mediaId, expiresIn);
    
    return NextResponse.json({
      success: true,
      presignedUrl: presignedUrl.presignedUrl,
      expiresIn: presignedUrl.expiresIn,
      operation: presignedUrl.operation,
      mediaId: presignedUrl.mediaId,
      fileName: presignedUrl.fileName,
      contentType: presignedUrl.contentType,
    });
  } catch (error) {
    console.error('Failed to get presigned URL:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to get presigned URL' 
      },
      { status: 500 }
    );
  }
} 