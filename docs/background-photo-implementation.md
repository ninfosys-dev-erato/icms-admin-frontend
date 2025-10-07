# Background Photo Preview Implementation

This document summarizes the implementation of the background photo preview feature for the office settings module.

## Overview

The background photo preview feature allows users to upload, view, and manage background photos for office settings. The implementation includes:

- **Secure file storage** using Backblaze B2 cloud storage
- **Presigned URL generation** for secure file access
- **Fallback mechanisms** for robust error handling
- **Responsive UI components** with proper loading and error states
- **Multi-language support** for user interface

## Architecture

### Frontend Components

1. **BackgroundPhotoUpload** (`src/domains/office-settings/components/background-photo-upload.tsx`)
   - Handles file upload with drag-and-drop support
   - Validates file types and sizes
   - Shows upload progress and status

2. **BackgroundPhotoPreview** (`src/domains/office-settings/components/background-photo-preview.tsx`)
   - Displays uploaded images with error handling
   - Supports both media ID and direct URL inputs
   - Includes loading states and retry functionality

3. **OfficeSettingsForm** (`src/domains/office-settings/components/office-settings-form.tsx`)
   - Integrates photo upload and preview functionality
   - Manages form state and validation

### Services

1. **OfficeSettingsService** (`src/domains/office-settings/services/office-settings-service.ts`)
   - Handles CRUD operations for office settings
   - Manages background photo upload and removal
   - Enhances settings with media URLs

2. **MediaService** (`src/services/media-service.ts`)
   - Handles media file uploads
   - Provides media metadata and URL access
   - Includes file validation

3. **BackblazeService** (`src/services/backblaze-service.ts`)
   - Manages presigned URL generation
   - Handles direct file uploads to Backblaze B2
   - Provides fallback mechanisms

### State Management

- **OfficeSettingsStore** (`src/domains/office-settings/stores/office-settings-store.ts`)
  - Manages office settings state
  - Handles loading, error, and editing states
  - Coordinates photo upload operations

## Key Features

### 1. Secure File Storage

- Files are stored in Backblaze B2 cloud storage
- Presigned URLs provide secure, time-limited access
- Application keys have limited permissions

### 2. Presigned URL Generation

```typescript
// Get presigned URL for media access
const presignedUrl = await BackblazeService.getPresignedUrl(mediaId, 3600);

// Get presigned URL for file upload
const uploadUrl = await BackblazeService.getUploadUrl(fileName, contentType);
```

### 3. Fallback Mechanisms

The system includes multiple fallback options:

1. **Primary**: Presigned URL from Backblaze B2
2. **Fallback**: Direct URL from media service
3. **Error Handling**: Graceful degradation with user feedback

### 4. Error Handling

- Network errors are handled gracefully
- Invalid files show appropriate error messages
- Loading states provide user feedback
- Retry mechanisms for failed operations

### 5. File Validation

```typescript
// Supported file types
const allowedTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

// File size limits
const maxSize = 5 * 1024 * 1024; // 5MB
```

## Configuration

### Environment Variables

Required Backblaze B2 configuration:

```bash
BACKBLAZE_APPLICATION_KEY_ID=your_application_key_id
BACKBLAZE_APPLICATION_KEY=your_application_key
BACKBLAZE_BUCKET_NAME=your_bucket_name
BACKBLAZE_BUCKET_ID=your_bucket_id
BACKBLAZE_ENDPOINT=https://s3.us-west-002.backblazeb2.com
BACKBLAZE_REGION=us-west-002
BACKBLAZE_URL_EXPIRATION=3600
```

### Backend Requirements

The backend must implement these endpoints:

1. **Media Upload**: `POST /media/upload`
2. **Presigned URL**: `GET /media/{id}/presigned-url`
3. **Media Info**: `GET /media/{id}`
4. **Media Delete**: `DELETE /media/{id}`

## Usage Examples

### Basic Photo Upload

```typescript
import { useOfficeSettingsStore } from "@/domains/office-settings";

const { uploadBackgroundPhoto } = useOfficeSettingsStore();

const handleUpload = async (file: File) => {
  try {
    await uploadBackgroundPhoto(settingsId, file);
    console.log("Photo uploaded successfully");
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
```

### Photo Preview

```typescript
import { BackgroundPhotoPreview } from '@/domains/office-settings';

<BackgroundPhotoPreview
  mediaId={settings.backgroundPhotoId}
  directUrl={settings.backgroundPhoto}
  alt="Office background photo"
  onError={(error) => console.error('Preview error:', error)}
  onLoad={() => console.log('Image loaded')}
/>
```

### Service Integration

```typescript
import { OfficeSettingsService } from "@/domains/office-settings";

// Get settings with enhanced media URLs
const settings = await OfficeSettingsService.getSettings();

// Upload background photo
const updatedSettings = await OfficeSettingsService.uploadBackgroundPhoto(
  settingsId,
  file
);

// Remove background photo
const cleanedSettings =
  await OfficeSettingsService.removeBackgroundPhoto(settingsId);
```

## Testing

### Test Page

A test page is available at `/dashboard/office-settings/preview-test` to:

- Test photo preview with different inputs
- Verify error handling
- Check loading states
- Validate responsive design

### Manual Testing

1. **Upload Test**:
   - Navigate to Office Settings
   - Upload a background photo
   - Verify preview appears
   - Check file is accessible

2. **Error Test**:
   - Try uploading invalid files
   - Test with broken URLs
   - Verify error messages

3. **Fallback Test**:
   - Disconnect from internet
   - Try loading existing photos
   - Check fallback behavior

## Security Considerations

### Access Control

- Application keys have limited permissions
- Presigned URLs expire after configurable time
- Files are stored in public buckets for accessibility

### File Validation

- File type validation on frontend and backend
- File size limits enforced
- Malicious file detection

### URL Security

- Presigned URLs provide time-limited access
- URLs are generated on-demand
- No permanent public URLs for sensitive files

## Performance Optimizations

### Image Optimization

- Images are served with appropriate content types
- File size limits prevent large uploads
- Lazy loading for better performance

### Caching

- Presigned URLs can be cached for short periods
- Media metadata is cached in the application
- CDN integration possible for public files

## Troubleshooting

### Common Issues

1. **"Invalid Access Key" Error**
   - Check Backblaze credentials
   - Verify application key permissions

2. **"Upload Failed" Error**
   - Check file size and type
   - Verify network connectivity
   - Check backend logs

3. **"Preview Not Loading" Error**
   - Check media ID validity
   - Verify presigned URL generation
   - Check browser console for errors

### Debug Mode

Enable debug logging:

```bash
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

This provides detailed logs for troubleshooting.

## Future Enhancements

### Planned Features

1. **Image Processing**:
   - Automatic image resizing
   - Thumbnail generation
   - Format conversion

2. **Advanced Upload**:
   - Drag-and-drop from external sources
   - Bulk upload support
   - Progress indicators

3. **Enhanced Preview**:
   - Image zoom and pan
   - Multiple image formats
   - Gallery view

### Integration Opportunities

1. **CDN Integration**:
   - CloudFlare integration
   - Edge caching
   - Global distribution

2. **Analytics**:
   - Upload statistics
   - Usage tracking
   - Performance metrics

## Conclusion

The background photo preview feature provides a robust, secure, and user-friendly solution for managing office background photos. The implementation includes comprehensive error handling, fallback mechanisms, and follows security best practices.

For setup instructions, see the [Backblaze Setup Guide](./backblaze-setup.md).
