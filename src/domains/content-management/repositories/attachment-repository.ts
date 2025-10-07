import { httpClient } from '@/lib/api/http-client';
import {
  ContentAttachment,
  CreateAttachmentDto,
  UpdateAttachmentDto,
  ReorderItemDto,
  AttachmentStatistics,
  AttachmentQuery,
  AttachmentListResponse,
  PresignedUrlResponse,
  AttachmentsWithPresignedUrlsResponse,
  AttachmentWithPresignedUrl,
} from '../types/attachment';

/**
 * Repository responsible for direct API interactions for Content Attachments.
 * This layer should be the ONLY place that talks to the HTTP client.
 * Services and stores must depend on this repository rather than httpClient directly.
 */
export interface AttachmentRepository {
  // List & Search
  getAttachmentsByContent(contentId: string): Promise<ContentAttachment[]>;
  getAttachments(query: AttachmentQuery): Promise<AttachmentListResponse>;
  getAttachmentById(id: string): Promise<ContentAttachment>;

  // CRUD
  createAttachment(data: CreateAttachmentDto, file: File): Promise<ContentAttachment>;
  updateAttachment(id: string, data: UpdateAttachmentDto): Promise<ContentAttachment>;
  deleteAttachment(id: string): Promise<void>;

  // Bulk operations
  reorderAttachments(contentId: string, orders: ReorderItemDto[]): Promise<void>;
  bulkDeleteAttachments(ids: string[]): Promise<void>;

  // Statistics
  getAttachmentStatistics(): Promise<AttachmentStatistics>;

  // Download
  downloadAttachment(id: string): Promise<Blob>;

  // Presigned URLs
  getPresignedUrl(id: string, expiresIn?: number, operation?: 'get' | 'put'): Promise<PresignedUrlResponse>;
  getAttachmentsWithPresignedUrls(contentId: string, expiresIn?: number): Promise<AttachmentsWithPresignedUrlsResponse>;
}

class AttachmentRepositoryImpl implements AttachmentRepository {
  private readonly BASE_URL = '/attachments';

  // List & Search
  async getAttachmentsByContent(contentId: string): Promise<ContentAttachment[]> {
    const response = await httpClient.get<any>(`/admin/contents/${contentId}/attachments`);
    return this.transformAttachmentsResponse(response);
  }

  async getAttachments(query: AttachmentQuery): Promise<AttachmentListResponse> {
    const response = await httpClient.get<any>(`${this.BASE_URL}`, { params: query });
    return this.transformListResponse(response);
  }

  async getAttachmentById(id: string): Promise<ContentAttachment> {
    const response = await httpClient.get<any>(`${this.BASE_URL}/${id}`);
    return this.transformAttachmentResponse(response);
  }

  // CRUD
  async createAttachment(data: CreateAttachmentDto, file: File): Promise<ContentAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    const response = await httpClient.post<any>(`${this.BASE_URL}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return this.transformAttachmentResponse(response);
  }

  async updateAttachment(id: string, data: UpdateAttachmentDto): Promise<ContentAttachment> {
    const response = await httpClient.put<any>(`${this.BASE_URL}/${id}`, data);
    return this.transformAttachmentResponse(response);
  }

  async deleteAttachment(id: string): Promise<void> {
    await httpClient.delete(`${this.BASE_URL}/${id}`);
  }

  // Bulk operations
  async reorderAttachments(contentId: string, orders: ReorderItemDto[]): Promise<void> {
    await httpClient.put(`${this.BASE_URL}/reorder`, { orders });
  }

  async bulkDeleteAttachments(ids: string[]): Promise<void> {
    await httpClient.post(`${this.BASE_URL}/bulk-delete`, { ids });
  }

  // Statistics
  async getAttachmentStatistics(): Promise<AttachmentStatistics> {
    const response = await httpClient.get<any>(`${this.BASE_URL}/statistics`);
    return response.data;
  }

  // Download
  async downloadAttachment(id: string): Promise<Blob> {
    const response = await httpClient.get<Blob>(`${this.BASE_URL}/${id}/download`, {
      responseType: 'blob',
    });
    if (!response.data) {
      throw new Error('No blob data received from download');
    }
    return response.data;
  }

  // Presigned URLs
  async getPresignedUrl(id: string, expiresIn?: number, operation?: 'get' | 'put'): Promise<PresignedUrlResponse> {
    const params: any = {};
    if (expiresIn) params.expiresIn = expiresIn;
    if (operation) params.operation = operation;
    
    const response = await httpClient.get<PresignedUrlResponse>(`${this.BASE_URL}/${id}/presigned-url`, { params });
    
    if (!response.data) {
      throw new Error('No presigned URL data received');
    }
    return response.data;
  }

  async getAttachmentsWithPresignedUrls(contentId: string, expiresIn?: number): Promise<AttachmentsWithPresignedUrlsResponse> {
    const params: any = {};
    if (expiresIn) params.expiresIn = expiresIn;
    
    const response = await httpClient.get<any>(
      `/admin/contents/${contentId}/attachments/with-presigned-urls`, 
      { params }
    );
    
    console.log('getAttachmentsWithPresignedUrls - Raw response:', response);
    
    if (!response) {
      throw new Error('No response received from attachments with presigned URLs endpoint');
    }
    
    // Transform the response to include presigned URLs
    const transformedData = this.transformAttachmentsResponse(response);
    
    // Ensure all attachments have presigned URLs and log any missing ones
    const attachmentsWithPresignedUrls = transformedData.map(attachment => {
      if (!attachment.presignedUrl) {
        console.warn(`Attachment ${attachment.id} missing presigned URL`);
        // If missing presigned URL, use download URL as fallback
        console.log(`Using download URL as fallback for ${attachment.id}:`, attachment.downloadUrl);
        return {
          ...attachment,
          presignedUrl: attachment.downloadUrl || `/api/attachments/${attachment.id}/download`
        };
      }
      return {
        ...attachment,
        presignedUrl: attachment.presignedUrl
      };
    }) as AttachmentWithPresignedUrl[];

    console.log('getAttachmentsWithPresignedUrls - Final transformed data:', attachmentsWithPresignedUrls);
    
    return {
      success: true,
      data: attachmentsWithPresignedUrls,
    };
  }

  // Private helper methods for response transformation
  private transformAttachmentResponse(response: any): ContentAttachment {
    // Handle different response structures
    let attachment: any;
    
    if (response && response.data) {
      // Response wrapped in data property
      attachment = response.data;
      console.log('Using response.data for attachment');
    } else if (response && typeof response === 'object' && !Array.isArray(response)) {
      // Response is the attachment object directly
      attachment = response;
      console.log('Using response directly for attachment');
    } else {
      console.error('Invalid response structure:', response);
      throw new Error('Invalid attachment response received from backend');
    }

    console.log('Processing attachment:', attachment);

    // Validate required fields
    if (!attachment.id && !attachment._id) {
      console.error('Attachment missing ID:', attachment);
      throw new Error('Attachment ID is missing from response');
    }

    const attachmentId = attachment.id || attachment._id || '';
    const result = {
      id: attachmentId,
      contentId: attachment.contentId,
      fileName: attachment.fileName,
      filePath: attachment.filePath,
      fileSize: attachment.fileSize,
      mimeType: attachment.mimeType,
      order: attachment.order || 0,
      originalName: attachment.originalName,
      altText: attachment.altText,
      description: attachment.description,
      createdAt: attachment.createdAt,
      updatedAt: attachment.updatedAt,
      downloadUrl: attachment.downloadUrl || `/api/attachments/${attachmentId}/download`,
      presignedUrl: attachment.presignedUrl || attachment.url || undefined, // Check for both presignedUrl and url fields
    };

    console.log('Transformed attachment:', result);
    console.log('Original presignedUrl field:', attachment.presignedUrl);
    console.log('Original url field:', attachment.url);
    
    return result;
  }

  private transformAttachmentsResponse(response: any): ContentAttachment[] {
    if (!response) {
      return [];
    }

    // Debug logging to understand response structure
    console.log('TransformAttachmentsResponse - Raw response:', response);
    console.log('Response type:', typeof response);
    console.log('Response keys:', Object.keys(response || {}));
    console.log('Response.data type:', typeof response?.data);
    console.log('Response.data is array:', Array.isArray(response?.data));

    let attachments: any[];
    
    if (response.data && Array.isArray(response.data)) {
      // Response wrapped in data property with array
      attachments = response.data;
      console.log('Using response.data array, length:', attachments.length);
    } else if (Array.isArray(response)) {
      // Response is array directly
      attachments = response;
      console.log('Using response as array directly, length:', attachments.length);
    } else if (response.data && !Array.isArray(response.data)) {
      // Response wrapped in data property with single item
      attachments = [response.data];
      console.log('Using response.data as single item');
    } else {
      // Single item response
      attachments = [response];
      console.log('Using response as single item');
    }

    return attachments.map((attachment) => this.transformAttachmentResponse({ data: attachment }));
  }

  private transformListResponse(response: any): AttachmentListResponse {
    if (!response) {
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    if (response.data && response.pagination) {
      return {
        data: Array.isArray(response.data) ? response.data.map(this.transformAttachmentResponse) : [],
        pagination: response.pagination,
      };
    }

    if (Array.isArray(response)) {
      return {
        data: response.map(this.transformAttachmentResponse),
        pagination: {
          page: 1,
          limit: response.length,
          total: response.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    return {
      data: [this.transformAttachmentResponse(response)],
      pagination: {
        page: 1,
        limit: 1,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
}

export const attachmentRepository: AttachmentRepository = new AttachmentRepositoryImpl();
