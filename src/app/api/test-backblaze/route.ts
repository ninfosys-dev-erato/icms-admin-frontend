import { NextRequest, NextResponse } from 'next/server';
import { getBackblazeConfig, isBackblazeConfigured } from '@/lib/env';

export async function GET(request: NextRequest) {
  try {
    const config = getBackblazeConfig();
    const configured = isBackblazeConfigured();

    // Basic configuration test
    const testResult = {
      configured,
      hasRequiredVars: {
        applicationKeyId: !!config.applicationKeyId,
        applicationKey: !!config.applicationKey,
        bucketName: !!config.bucketName,
        bucketId: !!config.bucketId,
        endpoint: !!config.endpoint,
        region: !!config.region,
      },
      config: {
        bucketName: config.bucketName,
        endpoint: config.endpoint,
        region: config.region,
        urlExpiration: config.urlExpiration,
        // Don't expose sensitive data
        hasApplicationKey: !!config.applicationKey,
        hasApplicationKeyId: !!config.applicationKeyId,
        hasBucketId: !!config.bucketId,
      },
      timestamp: new Date().toISOString(),
    };

    if (!configured) {
      return NextResponse.json({
        success: false,
        message: 'Backblaze B2 is not properly configured',
        data: testResult,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Backblaze B2 configuration is valid',
      data: testResult,
    });

  } catch (error) {
    console.error('Backblaze test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to test Backblaze configuration',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 