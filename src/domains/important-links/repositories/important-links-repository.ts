import { httpClient } from '@/lib/api/http-client';
import {
  ImportantLink,
  ImportantLinkListResponse,
  ImportantLinkQuery,
  ImportantLinkStatistics,
  CreateImportantLinkRequest,
  UpdateImportantLinkRequest,
  BulkCreateImportantLinksRequest,
  BulkUpdateImportantLinksRequest,
  ReorderImportantLinksRequest,
  BulkOperationResult,
  FooterLinks,
} from '../types/important-links';

/**
 * Repository responsible for direct API interactions for Important Links.
 * This layer should be the ONLY place that talks to the HTTP client.
 * Services and stores must depend on this repository rather than httpClient directly.
 */
export interface ImportantLinksRepository {
  // Public endpoints
  getPublicLinks(params?: Partial<ImportantLinkQuery>): Promise<ImportantLinkListResponse>;
  getPublicLinksWithPagination(params?: Partial<ImportantLinkQuery>): Promise<ImportantLinkListResponse>;
  getFooterLinks(lang?: string): Promise<FooterLinks>;
  getActiveLinks(lang?: string): Promise<ImportantLink[]>;
  getPublicLinkById(id: string, lang?: string): Promise<ImportantLink>;

  // Admin endpoints
  getAdminLinks(params?: Partial<ImportantLinkQuery>): Promise<ImportantLinkListResponse>;
  getAdminLinksWithPagination(params?: Partial<ImportantLinkQuery>): Promise<ImportantLinkListResponse>;
  searchAdminLinks(params: Partial<ImportantLinkQuery> & { q: string }): Promise<ImportantLinkListResponse>;
  getAdminLinkById(id: string): Promise<ImportantLink>;
  createLink(data: CreateImportantLinkRequest): Promise<ImportantLink>;
  updateLink(id: string, data: UpdateImportantLinkRequest): Promise<ImportantLink>;
  deleteLink(id: string): Promise<void>;

  // Bulk operations
  bulkCreateLinks(data: BulkCreateImportantLinksRequest): Promise<ImportantLink[]>;
  bulkUpdateLinks(data: BulkUpdateImportantLinksRequest): Promise<ImportantLink[]>;
  reorderLinks(data: ReorderImportantLinksRequest): Promise<void>;

  // Statistics and export
  getStatistics(): Promise<ImportantLinkStatistics>;
  exportLinks(): Promise<ImportantLink[]>;
  importLinks(data: BulkCreateImportantLinksRequest): Promise<ImportantLink[]>;
}

class ImportantLinksRepositoryImpl implements ImportantLinksRepository {
  private readonly BASE_URL = '/important-links';
  private readonly ADMIN_URL = '/admin/important-links';

  // Public endpoints
  async getPublicLinks(params: Partial<ImportantLinkQuery> = {}): Promise<ImportantLinkListResponse> {
    return httpClient.get<ImportantLinkListResponse>(`${this.BASE_URL}`, { params });
  }

  async getPublicLinksWithPagination(params: Partial<ImportantLinkQuery> = {}): Promise<ImportantLinkListResponse> {
    return httpClient.get<ImportantLinkListResponse>(`${this.BASE_URL}/pagination`, { params });
  }

  async getFooterLinks(lang?: string): Promise<FooterLinks> {
    const params = lang ? { lang } : {};
    return httpClient.get<FooterLinks>(`${this.BASE_URL}/footer`, { params });
  }

  async getActiveLinks(lang?: string): Promise<ImportantLink[]> {
    const params = lang ? { lang, isActive: true } : { isActive: true };
    return httpClient.get<ImportantLink[]>(`${this.BASE_URL}/active`, { params });
  }

  async getPublicLinkById(id: string, lang?: string): Promise<ImportantLink> {
    const params = lang ? { lang } : {};
    return httpClient.get<ImportantLink>(`${this.BASE_URL}/${id}`, { params });
  }

  // Admin endpoints
  async getAdminLinks(params: Partial<ImportantLinkQuery> = {}): Promise<ImportantLinkListResponse> {
    return httpClient.get<ImportantLinkListResponse>(`${this.ADMIN_URL}`, { params });
  }

  async getAdminLinksWithPagination(params: Partial<ImportantLinkQuery> = {}): Promise<ImportantLinkListResponse> {
    return httpClient.get<ImportantLinkListResponse>(`${this.ADMIN_URL}/pagination`, { params });
  }

  async searchAdminLinks(params: Partial<ImportantLinkQuery> & { q: string }): Promise<ImportantLinkListResponse> {
    return httpClient.get<ImportantLinkListResponse>(`${this.ADMIN_URL}/search`, { params });
  }

  async getAdminLinkById(id: string): Promise<ImportantLink> {
    return httpClient.get<ImportantLink>(`${this.ADMIN_URL}/${id}`);
  }

  async createLink(data: CreateImportantLinkRequest): Promise<ImportantLink> {
    return httpClient.post<ImportantLink>(`${this.ADMIN_URL}`, data);
  }

  async updateLink(id: string, data: UpdateImportantLinkRequest): Promise<ImportantLink> {
    return httpClient.put<ImportantLink>(`${this.ADMIN_URL}/${id}`, data);
  }

  async deleteLink(id: string): Promise<void> {
    return httpClient.delete<void>(`${this.ADMIN_URL}/${id}`);
  }

  // Bulk operations
  async bulkCreateLinks(data: BulkCreateImportantLinksRequest): Promise<ImportantLink[]> {
    return httpClient.post<ImportantLink[]>(`${this.ADMIN_URL}/bulk-create`, data);
  }

  async bulkUpdateLinks(data: BulkUpdateImportantLinksRequest): Promise<ImportantLink[]> {
    return httpClient.put<ImportantLink[]>(`${this.ADMIN_URL}/bulk-update`, data);
  }

  async reorderLinks(data: ReorderImportantLinksRequest): Promise<void> {
    return httpClient.post<void>(`${this.ADMIN_URL}/reorder`, data);
  }

  // Statistics and export
  async getStatistics(): Promise<ImportantLinkStatistics> {
    return httpClient.get<ImportantLinkStatistics>(`${this.ADMIN_URL}/statistics`);
  }

  async exportLinks(): Promise<ImportantLink[]> {
    return httpClient.get<ImportantLink[]>(`${this.ADMIN_URL}/export`);
  }

  async importLinks(data: BulkCreateImportantLinksRequest): Promise<ImportantLink[]> {
    return httpClient.post<ImportantLink[]>(`${this.ADMIN_URL}/import`, data);
  }
}

export const importantLinksRepository: ImportantLinksRepository = new ImportantLinksRepositoryImpl();
