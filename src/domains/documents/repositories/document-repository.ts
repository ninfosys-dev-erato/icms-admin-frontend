import { httpClient } from '@/lib/api/http-client';
import {
  Document,
  DocumentAnalytics,
  DocumentListResponse,
  DocumentQuery,
  DocumentStatistics,
  BulkOperationResult,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  CreateDocumentVersionDto,
  BulkUpdateRequestDto,
} from '../types/document';

/**
 * Utility function to format dates for API submission
 * Ensures dates are in ISO-8601 format as expected by the backend
 */
function formatDateForAPI(date: Date | string | null | undefined): string | null {
  console.log('🔍 formatDateForAPI called with:', { 
    date, 
    type: typeof date, 
    isDate: date instanceof Date,
    isNull: date === null,
    isUndefined: date === undefined 
  });
  
  if (!date || date === null || date === undefined) {
    console.log('🔍 formatDateForAPI returning null (empty input)');
    return null;
  }
  
  try {
    // If it's already a Date object
    if (date instanceof Date) {
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('🚫 Invalid Date object provided:', date);
        return null;
      }
      const isoString = date.toISOString();
      console.log('✅ formatDateForAPI Date object converted to:', isoString);
      return isoString;
    }
    
    // If it's a string, parse and convert
    if (typeof date === 'string') {
      // Handle empty strings
      if (date.trim() === '') {
        console.log('🔍 formatDateForAPI returning null (empty string)');
        return null;
      }
      
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        const isoString = parsedDate.toISOString();
        console.log('✅ formatDateForAPI string converted to:', isoString);
        return isoString;
      } else {
        console.warn('🚫 Invalid date string provided:', date);
        return null;
      }
    }
    
    // If it's any other type, try to convert it
    const convertedDate = new Date(date as any);
    if (!isNaN(convertedDate.getTime())) {
      const isoString = convertedDate.toISOString();
      console.log('✅ formatDateForAPI other type converted to:', isoString);
      return isoString;
    }
    
    console.warn('🚫 Unable to convert value to valid date:', date);
    return null;
  } catch (error) {
    console.error('🚫 Error formatting date for API:', error, 'Date value:', date);
    return null;
  }
}

/**
 * Repository responsible for direct API interactions for Documents.
 * This layer should be the ONLY place that talks to the HTTP client.
 * Services and stores must depend on this repository rather than httpClient directly.
 */
export interface DocumentRepository {
  // List & Search
  getPublicDocuments(params?: Partial<DocumentQuery>): Promise<any>;
  getAdminDocuments(params?: Partial<DocumentQuery>): Promise<any>;
  searchAdminDocuments(params: Partial<DocumentQuery> & { search: string }): Promise<any>;
  getDocumentsByType(type: string, params?: Partial<DocumentQuery>): Promise<any>;
  getDocumentsByCategory(category: string, params?: Partial<DocumentQuery>): Promise<any>;

  // CRUD
  getById(id: string): Promise<any>;
  create(data: CreateDocumentRequest): Promise<any>;
  update(id: string, data: UpdateDocumentRequest): Promise<any>;
  delete(id: string): Promise<any>;

  // File operations
  uploadDocument(file: File, metadata?: any): Promise<any>;
  createDocumentVersion(documentId: string, file: File, version: string, changeLog?: any): Promise<any>;
  getDocumentVersions(documentId: string): Promise<any>;

  // Bulk operations
  bulkUpdate(data: BulkUpdateRequestDto): Promise<any>;
  bulkDelete(ids: string[]): Promise<any>;

  // Statistics & Analytics
  getStatistics(): Promise<any>;
  getDocumentAnalytics(id: string): Promise<any>;

  // Export/Import
  exportDocuments(query: DocumentQuery, format: string): Promise<any>;
  importDocuments(file: File): Promise<any>;
}

class DocumentRepositoryImpl implements DocumentRepository {
  private readonly BASE_URL = '/documents';
  private readonly ADMIN_URL = '/admin/documents';

  // List & Search
  async getPublicDocuments(params: Partial<DocumentQuery> = {}): Promise<any> {
    return httpClient.get<any>(`${this.BASE_URL}`, { params });
  }

  async getAdminDocuments(params: Partial<DocumentQuery> = {}): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_URL}`, { params });
  }

  async searchAdminDocuments(params: Partial<DocumentQuery> & { search: string }): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_URL}/search`, { params });
  }

  async getDocumentsByType(type: string, params: Partial<DocumentQuery> = {}): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_URL}/type/${type}`, { params });
  }

  async getDocumentsByCategory(category: string, params: Partial<DocumentQuery> = {}): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_URL}/category/${category}`, { params });
  }

  // CRUD
  async getById(id: string): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_URL}/${id}`);
  }

  async create(data: CreateDocumentRequest): Promise<any> {
    // Format dates for API submission
    const formattedData = {
      ...data,
      publishDate: formatDateForAPI(data.publishDate),
      expiryDate: formatDateForAPI(data.expiryDate),
    };
    
    return httpClient.post<any>(`${this.ADMIN_URL}`, formattedData);
  }

  async update(id: string, data: UpdateDocumentRequest): Promise<any> {
    console.log('🔄 DocumentRepository.update called with data:', data);
    
    // Format dates for API submission
    const publishDate = formatDateForAPI(data.publishDate);
    const expiryDate = formatDateForAPI(data.expiryDate);
    
    console.log('🔄 DocumentRepository.update formatting dates:', {
      originalPublishDate: data.publishDate,
      formattedPublishDate: publishDate,
      originalExpiryDate: data.expiryDate,
      formattedExpiryDate: expiryDate
    });

    // Create the request data, excluding original date fields first
    const { publishDate: _, expiryDate: __, ...cleanData } = data;
    
    const formattedData = {
      ...cleanData,
    };
    
    // Only add date fields if they have valid values
    if (publishDate !== null && publishDate !== undefined) {
      formattedData.publishDate = publishDate;
      console.log('✅ Including publishDate in request:', publishDate);
    } else {
      console.log('🚫 Excluding publishDate from request (null/invalid)');
    }
    
    if (expiryDate !== null && expiryDate !== undefined) {
      formattedData.expiryDate = expiryDate;
      console.log('✅ Including expiryDate in request:', expiryDate);
    } else {
      console.log('🚫 Excluding expiryDate from request (null/invalid)');
    }
    
    console.log('🔄 DocumentRepository.update final data to be sent:', formattedData);
    
    return httpClient.put<any>(`${this.ADMIN_URL}/${id}`, formattedData);
  }

  async delete(id: string): Promise<any> {
    return httpClient.delete<any>(`${this.ADMIN_URL}/${id}`);
  }

  // File operations
  async uploadDocument(file: File, metadata?: any): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Debug logging for the entire metadata object
    console.log('📤 Document upload metadata:', metadata);
    
    if (metadata) {
      // Handle translatable fields
      if (metadata.title) {
        formData.append('title[en]', metadata.title.en);
        formData.append('title[ne]', metadata.title.ne);
      }
      if (metadata.description) {
        formData.append('description[en]', metadata.description.en);
        formData.append('description[ne]', metadata.description.ne);
      }
      
      // Handle other fields with proper date formatting
      Object.keys(metadata).forEach(key => {
        if (key !== 'title' && key !== 'description') {
          const value = metadata[key];
          
          // Special handling for date fields
          if (key === 'publishDate' || key === 'expiryDate') {
            const formattedDate = formatDateForAPI(value);
            if (formattedDate) {
              console.log(`📅 Formatting ${key}:`, { original: value, formatted: formattedDate });
              formData.append(key, formattedDate);
            } else {
              console.warn(`⚠️ Could not format ${key}:`, value);
            }
          } else if (key === 'tags' && Array.isArray(value)) {
            // Special handling for tags - try multiple formats for backend compatibility
            console.log(`🏷️ Handling tags:`, value);
            
            // Validate tags array
            if (value.length === 0) {
              console.log('🏷️ No tags to send');
              return; // Skip empty tags
            }
            
            // Ensure all tags are strings
            const validTags = value.filter(tag => typeof tag === 'string' && tag.trim().length > 0);
            if (validTags.length === 0) {
              console.warn('⚠️ No valid tags found in array:', value);
              return;
            }
            
            // Format 1: Individual array elements (tags[0], tags[1], etc.)
            validTags.forEach((tag, index) => {
              formData.append(`tags[${index}]`, tag.trim());
            });
            
            // Format 2: JSON string as fallback (some backends expect this)
            formData.append('tags_json', JSON.stringify(validTags));
            
            // Format 3: Comma-separated string as another fallback
            formData.append('tags_csv', validTags.join(','));
            
            // Format 4: Single tags field with JSON string (most common backend expectation)
            formData.append('tags', JSON.stringify(validTags));
            
            console.log(`🏷️ Tags sent in multiple formats:`, {
              array: validTags,
              json: JSON.stringify(validTags),
              csv: validTags.join(','),
              singleField: JSON.stringify(validTags)
            });
          } else if (key === 'tags') {
            // Handle case where tags is not an array
            console.warn('⚠️ Tags field is not an array:', { value, type: typeof value, isArray: Array.isArray(value) });
            
            // Try to convert to array if possible
            if (typeof value === 'string') {
              const tagsArray = value.split(',').map(tag => tag.trim()).filter(Boolean);
              if (tagsArray.length > 0) {
                console.log('🔄 Converting string tags to array:', tagsArray);
                tagsArray.forEach((tag, index) => {
                  formData.append(`tags[${index}]`, tag);
                });
                formData.append('tags_json', JSON.stringify(tagsArray));
              }
            }
          } else {
            // Handle other fields normally
            console.log(`📝 Appending field ${key}:`, { value, type: typeof value, isArray: Array.isArray(value) });
            formData.append(key, value);
          }
        }
      });
    }

    // Debug logging for the final FormData
    console.log('📋 Final FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    // Final validation - ensure tags are properly formatted
    const tagsEntries = Array.from(formData.entries()).filter(([key]) => key.startsWith('tags['));
    if (tagsEntries.length > 0) {
      console.log('✅ Tags properly formatted in FormData:', tagsEntries);
    } else {
      console.warn('⚠️ No tags found in FormData - checking for alternative formats');
      const tagsJson = formData.get('tags_json');
      const tagsCsv = formData.get('tags_csv');
      if (tagsJson) {
        console.log('📝 Found tags_json:', tagsJson);
      }
      if (tagsCsv) {
        console.log('📝 Found tags_csv:', tagsCsv);
      }
    }

    return httpClient.post<any>(`${this.ADMIN_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async createDocumentVersion(documentId: string, file: File, version: string, changeLog?: any): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('version', version);
    if (changeLog) {
      formData.append('changeLog', JSON.stringify(changeLog));
    }

    return httpClient.post<any>(`${this.ADMIN_URL}/${documentId}/versions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async getDocumentVersions(documentId: string): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_URL}/${documentId}/versions`);
  }

  // Bulk operations
  async bulkUpdate(data: BulkUpdateRequestDto): Promise<any> {
    // Format dates for API submission if they exist in updates
    const formattedUpdates = {
      ...data.updates,
      publishDate: formatDateForAPI(data.updates.publishDate),
      expiryDate: formatDateForAPI(data.updates.expiryDate),
    };
    
    const formattedData = {
      ...data,
      updates: formattedUpdates,
    };
    
    return httpClient.put<any>(`${this.ADMIN_URL}/bulk-update`, formattedData);
  }

  async bulkDelete(ids: string[]): Promise<any> {
    return httpClient.post<any>(`${this.ADMIN_URL}/bulk-delete`, { ids });
  }

  // Statistics & Analytics
  async getStatistics(): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_URL}/statistics`);
  }

  async getDocumentAnalytics(id: string): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_URL}/${id}/analytics`);
  }

  // Presigned URL methods
  async getAdminDownloadUrl(id: string, expires?: number): Promise<any> {
    console.log('🔗 Getting admin download URL for document:', id, expires ? `(expires: ${expires}s)` : '');
    const params = expires ? { expires } : {};
    return httpClient.get<any>(`${this.ADMIN_URL}/${id}/download-url`, { params });
  }

  async getPublicDownloadUrl(id: string, expires?: number): Promise<any> {
    console.log('🔗 Getting public download URL for document:', id, expires ? `(expires: ${expires}s)` : '');
    const params = expires ? { expires } : {};
    return httpClient.get<any>(`${this.BASE_URL}/${id}/download-url`, { params });
  }

  async getAdminPreviewUrl(id: string, expires?: number): Promise<any> {
    console.log('🔗 Getting admin preview URL for document:', id, expires ? `(expires: ${expires}s)` : '');
    const params = expires ? { expires } : {};
    return httpClient.get<any>(`${this.ADMIN_URL}/${id}/preview-url`, { params });
  }

  async getPublicPreviewUrl(id: string, expires?: number): Promise<any> {
    console.log('🔗 Getting public preview URL for document:', id, expires ? `(expires: ${expires}s)` : '');
    const params = expires ? { expires } : {};
    return httpClient.get<any>(`${this.BASE_URL}/${id}/preview-url`, { params });
  }

  // Export/Import
  async exportDocuments(query: DocumentQuery, format: string): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_URL}/export`, { 
      params: { ...query, format },
      responseType: 'blob'
    });
  }

  async importDocuments(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    return httpClient.post<any>(`${this.ADMIN_URL}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
}

// Export an instance of DocumentRepositoryImpl
export const documentRepository: DocumentRepository = new DocumentRepositoryImpl();