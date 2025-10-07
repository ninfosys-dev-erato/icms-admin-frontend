# Backblaze B2 Setup Guide

This guide will help you set up Backblaze B2 cloud storage for the office settings background photo feature.

## Prerequisites

1. A Backblaze B2 account
2. Access to your project's environment configuration

## Step 1: Create a Backblaze B2 Account

1. Go to [Backblaze B2](https://www.backblaze.com/b2/cloud-storage.html)
2. Sign up for a free account (10GB free storage)
3. Verify your email address

## Step 2: Create a Bucket

1. Log in to your Backblaze B2 account
2. Click "Create Bucket"
3. Choose a unique bucket name (e.g., `your-project-media`)
4. Set the bucket to **Public** (for public file access)
5. Choose your preferred region
6. Click "Create Bucket"

## Step 3: Create Application Keys

1. In your Backblaze B2 account, go to "App Keys" in the left sidebar
2. Click "Add a New Application Key"
3. Give it a name (e.g., `your-project-media-key`)
4. Select your bucket from the dropdown
5. Set permissions to "Read and Write"
6. Click "Create New Key"
7. **Important**: Copy and save both the `keyID` and `applicationKey` - you won't be able to see the application key again!

## Step 4: Get Bucket Information

1. Go to your bucket in the Backblaze B2 console
2. Note down the following information:
   - **Bucket Name**: The name you chose (e.g., `your-project-media`)
   - **Bucket ID**: Found in the bucket details
   - **Endpoint**: Usually `https://s3.us-west-002.backblazeb2.com` (check your region)

## Step 5: Configure Environment Variables

Add the following variables to your `.env.local` file:

```bash
# Backblaze B2 Configuration
BACKBLAZE_APPLICATION_KEY_ID=your_application_key_id_here
BACKBLAZE_APPLICATION_KEY=your_application_key_here
BACKBLAZE_BUCKET_NAME=your_bucket_name_here
BACKBLAZE_BUCKET_ID=your_bucket_id_here
BACKBLAZE_ENDPOINT=https://s3.us-west-002.backblazeb2.com
BACKBLAZE_REGION=us-west-002

# Optional: Custom domain for media URLs (if you have a custom domain)
BACKBLAZE_CUSTOM_DOMAIN=

# Optional: URL expiration time in seconds (default: 1 hour)
BACKBLAZE_URL_EXPIRATION=3600
```

### Example Configuration

```bash
# Backblaze B2 Configuration
BACKBLAZE_APPLICATION_KEY_ID=001234567890abcdef1234567890
BACKBLAZE_APPLICATION_KEY=K001234567890abcdef1234567890abcdef1234567890
BACKBLAZE_BUCKET_NAME=my-project-media
BACKBLAZE_BUCKET_ID=4a48fe2012345678901234
BACKBLAZE_ENDPOINT=https://s3.us-west-002.backblazeb2.com
BACKBLAZE_REGION=us-west-002
BACKBLAZE_URL_EXPIRATION=3600
```

## Step 6: Backend Configuration

Make sure your backend is configured to use these environment variables. The backend should:

1. Use the AWS SDK for JavaScript v3 with Backblaze B2 configuration
2. Generate presigned URLs for secure file access
3. Handle file uploads to the B2 bucket

### Backend Environment Variables

Your backend should also have access to the same Backblaze configuration:

```bash
# Backblaze B2 Configuration (Backend)
BACKBLAZE_APPLICATION_KEY_ID=your_application_key_id_here
BACKBLAZE_APPLICATION_KEY=your_application_key_here
BACKBLAZE_BUCKET_NAME=your_bucket_name_here
BACKBLAZE_BUCKET_ID=your_bucket_id_here
BACKBLAZE_ENDPOINT=https://s3.us-west-002.backblazeb2.com
BACKBLAZE_REGION=us-west-002
BACKBLAZE_URL_EXPIRATION=3600
```

## Step 7: Test the Configuration

1. Restart your development server
2. Go to the Office Settings page
3. Try uploading a background photo
4. Verify that the image appears in the preview
5. Check that the image is accessible via the generated URL

## Security Considerations

### Public vs Private Buckets

- **Public Buckets**: Files are accessible via direct URLs (good for public media)
- **Private Buckets**: Files require presigned URLs for access (more secure)

For the office settings background photo feature, we recommend using **public buckets** since the background photos are meant to be publicly accessible.

### Presigned URLs

The system uses presigned URLs for enhanced security:

- URLs expire after a configurable time (default: 1 hour)
- Access is controlled through the application
- URLs are generated on-demand

### Access Control

- Application keys have limited permissions (read/write to specific bucket)
- Keys can be revoked and regenerated if compromised
- Monitor usage through Backblaze B2 console

## Troubleshooting

### Common Issues

1. **"Invalid Access Key" Error**
   - Check that `BACKBLAZE_APPLICATION_KEY_ID` and `BACKBLAZE_APPLICATION_KEY` are correct
   - Ensure the application key has the correct permissions

2. **"Bucket Not Found" Error**
   - Verify `BACKBLAZE_BUCKET_NAME` and `BACKBLAZE_BUCKET_ID` are correct
   - Check that the bucket exists and is accessible

3. **"Endpoint Error"**
   - Verify `BACKBLAZE_ENDPOINT` matches your bucket's region
   - Check that the endpoint URL is correct

4. **"Upload Failed" Error**
   - Check file size limits (Backblaze B2 has a 5TB per file limit)
   - Verify file type is supported
   - Check network connectivity

### Debug Mode

Enable debug logging by setting:

```bash
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

This will show detailed logs about Backblaze operations in the browser console.

## Cost Considerations

### Backblaze B2 Pricing (as of 2024)

- **Storage**: $0.005/GB/month
- **Downloads**: $0.01/GB
- **Uploads**: Free
- **API Calls**: Free for first 2,500/day, then $0.004/10,000

### Free Tier

- 10GB free storage
- 1GB free downloads per day
- Unlimited uploads

For most small to medium projects, the free tier should be sufficient.

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Test with a simple file upload
4. Check Backblaze B2 console for any errors
5. Review the backend logs for detailed error information

## Additional Resources

- [Backblaze B2 API Documentation](https://www.backblaze.com/b2/docs/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/)
- [Backblaze B2 S3 Compatible API](https://www.backblaze.com/b2/docs/s3_compatible_api.html)
