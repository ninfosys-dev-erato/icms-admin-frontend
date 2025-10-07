import { httpClient } from '@/lib/api/http-client';
import {
  OfficeDescription,
  CreateOfficeDescriptionRequest,
  UpdateOfficeDescriptionRequest,
  BulkCreateOfficeDescriptionRequest,
  BulkUpdateOfficeDescriptionRequest,
  OfficeDescriptionType,
} from '../types/office-description';

// Normalize API error message which can be string or string[]
const normalizeMessage = (message: string | string[] | undefined, fallback: string): string => {
  if (Array.isArray(message)) {
    return message.join(', ');
  }
  return message ?? fallback;
};

export class OfficeDescriptionService {
  private static readonly BASE_URL = '/office-descriptions';
  private static readonly ADMIN_BASE_URL = '/admin/office-descriptions';

  // Public endpoints
  static async getDescriptions(lang?: string): Promise<OfficeDescription[]> {
    try {
      const url = lang ? `${this.BASE_URL}?lang=${lang}` : this.BASE_URL;
      const response = await httpClient.get<OfficeDescription[]>(url);
      
      if (!response.success || response.error) {
        throw new Error(normalizeMessage(response.error?.message, 'Failed to load descriptions'));
      }
      
      return response.data || [];
    } catch (error) {
      console.error('❌ Office Description: Get descriptions failed:', error);
      throw error;
    }
  }

  static async getDescriptionTypes(): Promise<OfficeDescriptionType[]> {
    try {
      const response = await httpClient.get<OfficeDescriptionType[]>(`${this.BASE_URL}/types`);
      
      if (!response.success || response.error) {
        throw new Error(normalizeMessage(response.error?.message, 'Failed to load description types'));
      }
      
      return response.data || [];
    } catch (error) {
      console.error('❌ Office Description: Get types failed:', error);
      throw error;
    }
  }

  static async getDescriptionByType(type: OfficeDescriptionType, lang?: string): Promise<OfficeDescription | null> {
    try {
      const url = lang ? `${this.BASE_URL}/type/${type}?lang=${lang}` : `${this.BASE_URL}/type/${type}`;
      const response = await httpClient.get<OfficeDescription>(url);
      
      if (!response.success || response.error) {
        if (response.error?.code === 'NOT_FOUND_ERROR') {
          return null; // Description doesn't exist for this type
        }
        throw new Error(normalizeMessage(response.error?.message, 'Failed to load description'));
      }
      
      return response.data || null;
    } catch (error) {
      console.error('❌ Office Description: Get by type failed:', error);
      throw error;
    }
  }

  static async getDescriptionById(id: string, lang?: string): Promise<OfficeDescription | null> {
    try {
      const url = lang ? `${this.BASE_URL}/${id}?lang=${lang}` : `${this.BASE_URL}/${id}`;
      const response = await httpClient.get<OfficeDescription>(url);
      
      if (!response.success || response.error) {
        if (response.error?.code === 'NOT_FOUND_ERROR') {
          return null;
        }
        throw new Error(normalizeMessage(response.error?.message, 'Failed to load description'));
      }
      
      return response.data || null;
    } catch (error) {
      console.error('❌ Office Description: Get by ID failed:', error);
      throw error;
    }
  }

  // Convenience endpoints
  static async getIntroduction(lang?: string): Promise<OfficeDescription | null> {
    return this.getDescriptionByType(OfficeDescriptionType.INTRODUCTION, lang);
  }

  static async getObjective(lang?: string): Promise<OfficeDescription | null> {
    return this.getDescriptionByType(OfficeDescriptionType.OBJECTIVE, lang);
  }

  static async getWorkDetails(lang?: string): Promise<OfficeDescription | null> {
    return this.getDescriptionByType(OfficeDescriptionType.WORK_DETAILS, lang);
  }

  static async getOrganizationalStructure(lang?: string): Promise<OfficeDescription | null> {
    return this.getDescriptionByType(OfficeDescriptionType.ORGANIZATIONAL_STRUCTURE, lang);
  }

  static async getDigitalCharter(lang?: string): Promise<OfficeDescription | null> {
    return this.getDescriptionByType(OfficeDescriptionType.DIGITAL_CHARTER, lang);
  }

  static async getEmployeeSanctions(lang?: string): Promise<OfficeDescription | null> {
    return this.getDescriptionByType(OfficeDescriptionType.EMPLOYEE_SANCTIONS, lang);
  }

  // Admin endpoints
  static async getAdminDescriptions(lang?: string): Promise<OfficeDescription[]> {
    try {
      const url = lang ? `${this.ADMIN_BASE_URL}?lang=${lang}` : this.ADMIN_BASE_URL;
      
      console.log('🔍 Office Description Service: Calling admin endpoint:', url);
      console.log('🔍 Full URL will be:', `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3005/api/v1'}${url}`);
      
      const response = await httpClient.get<OfficeDescription[]>(url);
      
      console.log('🔍 Office Description Service: Response received:', {
        success: response.success,
        hasData: !!response.data,
        dataLength: response.data?.length,
        hasError: !!response.error,
        error: response.error
      });
      
      if (!response.success || response.error) {
        throw new Error(normalizeMessage(response.error?.message, 'Failed to load descriptions'));
      }
      return response.data || [];
    } catch (error) {
      console.error('❌ Office Description: Get admin descriptions failed:', error);
      if (error instanceof Error) {
        console.error('❌ Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      throw error;
    }
  }

  static async getAdminDescriptionById(id: string): Promise<OfficeDescription | null> {
    try {
      const response = await httpClient.get<OfficeDescription>(`${this.ADMIN_BASE_URL}/${id}`);
      
      if (!response.success || response.error) {
        if (response.error?.code === 'NOT_FOUND_ERROR') {
          return null;
        }
        throw new Error(normalizeMessage(response.error?.message, 'Failed to load description'));
      }
      
      return response.data || null;
    } catch (error) {
      console.error('❌ Office Description: Get admin by ID failed:', error);
      throw error;
    }
  }

  static async getStatistics(): Promise<any> {
    try {
      const response = await httpClient.get(`${this.ADMIN_BASE_URL}/statistics`);
      
      if (!response.success || response.error) {
        throw new Error(normalizeMessage(response.error?.message, 'Failed to load statistics'));
      }
      
      return response.data || {};
    } catch (error) {
      console.error('❌ Office Description: Get statistics failed:', error);
      throw error;
    }
  }

  static async createDescription(data: CreateOfficeDescriptionRequest): Promise<OfficeDescription> {
    try {
      const response = await httpClient.post<OfficeDescription>(this.ADMIN_BASE_URL, data);
      
      if (!response.success || response.error) {
        throw new Error(normalizeMessage(response.error?.message, 'Failed to create description'));
      }
      
      return response.data!;
    } catch (error) {
      console.error('❌ Office Description: Create failed:', error);
      throw error;
    }
  }

  static async updateDescription(id: string, data: UpdateOfficeDescriptionRequest): Promise<OfficeDescription> {
    try {
      const response = await httpClient.put<OfficeDescription>(`${this.ADMIN_BASE_URL}/${id}`, data);
      
      if (!response.success || response.error) {
        throw new Error(normalizeMessage(response.error?.message, 'Failed to update description'));
      }
      
      return response.data!;
    } catch (error) {
      console.error('❌ Office Description: Update failed:', error);
      throw error;
    }
  }

  static async upsertDescriptionByType(type: OfficeDescriptionType, data: CreateOfficeDescriptionRequest): Promise<OfficeDescription> {
    try {
      const response = await httpClient.put<OfficeDescription>(`${this.ADMIN_BASE_URL}/type/${type}/upsert`, data);
      
      if (!response.success || response.error) {
        throw new Error(normalizeMessage(response.error?.message, 'Failed to upsert description'));
      }
      
      return response.data!;
    } catch (error) {
      console.error('❌ Office Description: Upsert failed:', error);
      throw error;
    }
  }

  static async deleteDescription(id: string): Promise<void> {
    try {
      const response = await httpClient.delete(`${this.ADMIN_BASE_URL}/${id}`);
      
      if (!response.success || response.error) {
        throw new Error(normalizeMessage(response.error?.message, 'Failed to delete description'));
      }
    } catch (error) {
      console.error('❌ Office Description: Delete failed:', error);
      throw error;
    }
  }

  static async deleteDescriptionByType(type: OfficeDescriptionType): Promise<void> {
    try {
      const response = await httpClient.delete(`${this.ADMIN_BASE_URL}/type/${type}`);
      
      if (!response.success || response.error) {
        throw new Error(normalizeMessage(response.error?.message, 'Failed to delete description by type'));
      }
    } catch (error) {
      console.error('❌ Office Description: Delete by type failed:', error);
      throw error;
    }
  }

  // Bulk operations
  static async bulkCreateDescriptions(data: BulkCreateOfficeDescriptionRequest): Promise<OfficeDescription[]> {
    try {
      const response = await httpClient.post<OfficeDescription[]>(`${this.ADMIN_BASE_URL}/bulk-create`, data);
      
      if (!response.success || response.error) {
        throw new Error(normalizeMessage(response.error?.message, 'Failed to bulk create descriptions'));
      }
      
      return response.data || [];
    } catch (error) {
      console.error('❌ Office Description: Bulk create failed:', error);
      throw error;
    }
  }

  static async bulkUpdateDescriptions(data: BulkUpdateOfficeDescriptionRequest): Promise<OfficeDescription[]> {
    try {
      const response = await httpClient.put<OfficeDescription[]>(`${this.ADMIN_BASE_URL}/bulk-update`, data);
      
      if (!response.success || response.error) {
        throw new Error(normalizeMessage(response.error?.message, 'Failed to bulk update descriptions'));
      }
      
      return response.data || [];
    } catch (error) {
      console.error('❌ Office Description: Bulk update failed:', error);
      throw error;
    }
  }

  static async importDescriptions(data: any): Promise<any> {
    try {
      const response = await httpClient.post(`${this.ADMIN_BASE_URL}/import`, data);
      
      if (!response.success || response.error) {
        throw new Error(normalizeMessage(response.error?.message, 'Failed to import descriptions'));
      }
      
      return response.data || {};
    } catch (error) {
      console.error('❌ Office Description: Import failed:', error);
      throw error;
    }
  }

  static async exportDescriptions(): Promise<any> {
    try {
      const response = await httpClient.get(`${this.ADMIN_BASE_URL}/export`);
      
      if (!response.success || response.error) {
        throw new Error(normalizeMessage(response.error?.message, 'Failed to export descriptions'));
      }
      
      return response.data || {};
    } catch (error) {
      console.error('❌ Office Description: Export failed:', error);
      throw error;
    }
  }
} 