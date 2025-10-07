import { OfficeSettingsService } from '@/domains/office-settings/services/office-settings-service';
import { httpClient } from '@/lib/api/http-client';

// Mock the HTTP client
jest.mock('@/lib/api/http-client');

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;

describe('OfficeSettingsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSettings = {
    id: 'test-id',
    directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
    officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
    officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
    email: 'test@example.gov.np',
    phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
    website: 'https://test.gov.np',
    xLink: 'https://x.com/test',
    youtube: 'https://youtube.com/test',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockApiResponse = {
    success: true,
    data: mockSettings,
    error: null,
    meta: {
      timestamp: '2024-01-01T00:00:00.000Z',
      version: '1.0.0',
    },
  };

  describe('getSettings', () => {
    it('should fetch settings successfully', async () => {
      mockHttpClient.get.mockResolvedValue(mockApiResponse);

      const result = await OfficeSettingsService.getSettings();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/office-settings');
      expect(result).toEqual(mockSettings);
    });

    it('should fetch settings with language filter', async () => {
      mockHttpClient.get.mockResolvedValue(mockApiResponse);

      const result = await OfficeSettingsService.getSettings('en');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/office-settings?lang=en');
      expect(result).toEqual(mockSettings);
    });

    it('should handle API error response', async () => {
      const errorResponse = {
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Office settings not found' },
        meta: { timestamp: '2024-01-01T00:00:00.000Z', version: '1.0.0' },
      };

      mockHttpClient.get.mockResolvedValue(errorResponse);

      await expect(OfficeSettingsService.getSettings()).rejects.toThrow('The requested information was not found');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockHttpClient.get.mockRejectedValue(networkError);

      await expect(OfficeSettingsService.getSettings()).rejects.toThrow('Please check your internet connection and try again');
    });
  });

  describe('getSettingsById', () => {
    it('should fetch settings by ID successfully', async () => {
      mockHttpClient.get.mockResolvedValue(mockApiResponse);

      const result = await OfficeSettingsService.getSettingsById('test-id');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/office-settings/test-id');
      expect(result).toEqual(mockSettings);
    });

    it('should handle not found error', async () => {
      const errorResponse = {
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Office settings not found' },
        meta: { timestamp: '2024-01-01T00:00:00.000Z', version: '1.0.0' },
      };

      mockHttpClient.get.mockResolvedValue(errorResponse);

      await expect(OfficeSettingsService.getSettingsById('non-existent')).rejects.toThrow('The requested information was not found');
    });
  });

  describe('getSettingsSeo', () => {
    it('should fetch SEO settings successfully', async () => {
      const seoResponse = {
        success: true,
        data: {
          name: 'Test Office',
          description: 'Official website of Test Office',
          address: 'Test Address',
          phone: '+977-123456789',
          email: 'test@example.gov.np',
          website: 'https://test.gov.np',
        },
        error: null,
        meta: { timestamp: '2024-01-01T00:00:00.000Z', version: '1.0.0' },
      };

      mockHttpClient.get.mockResolvedValue(seoResponse);

      const result = await OfficeSettingsService.getSettingsSeo();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/office-settings/seo');
      expect(result).toEqual(seoResponse.data);
    });
  });

  describe('createSettings', () => {
    const createData = {
      directorate: { en: 'New Directorate', ne: 'नयाँ निर्देशनालय' },
      officeName: { en: 'New Office', ne: 'नयाँ कार्यालय' },
      officeAddress: { en: 'New Address', ne: 'नयाँ ठेगाना' },
      email: 'new@example.gov.np',
      phoneNumber: { en: '+977-987654321', ne: '+९७७-९८७६५४३२१' },
    };

    it('should create settings successfully', async () => {
      mockHttpClient.post.mockResolvedValue(mockApiResponse);

      const result = await OfficeSettingsService.createSettings(createData);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/v1/office-settings', createData);
      expect(result).toEqual(mockSettings);
    });

    it('should handle validation errors', async () => {
      const errorResponse = {
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed' },
        meta: { timestamp: '2024-01-01T00:00:00.000Z', version: '1.0.0' },
      };

      mockHttpClient.post.mockResolvedValue(errorResponse);

      await expect(OfficeSettingsService.createSettings(createData)).rejects.toThrow('Please check your input and try again');
    });
  });

  describe('updateSettings', () => {
    const updateData = {
      email: 'updated@example.gov.np',
      website: 'https://updated.gov.np',
    };

    it('should update settings successfully', async () => {
      mockHttpClient.put.mockResolvedValue(mockApiResponse);

      const result = await OfficeSettingsService.updateSettings('test-id', updateData);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/api/v1/office-settings/test-id', updateData);
      expect(result).toEqual(mockSettings);
    });

    it('should handle unauthorized error', async () => {
      const errorResponse = {
        success: false,
        data: null,
        error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
        meta: { timestamp: '2024-01-01T00:00:00.000Z', version: '1.0.0' },
      };

      mockHttpClient.put.mockResolvedValue(errorResponse);

      await expect(OfficeSettingsService.updateSettings('test-id', updateData)).rejects.toThrow('You need to log in to perform this action');
    });
  });

  describe('upsertSettings', () => {
    const upsertData = {
      directorate: { en: 'Upsert Directorate', ne: 'अपसर्ट निर्देशनालय' },
      officeName: { en: 'Upsert Office', ne: 'अपसर्ट कार्यालय' },
      officeAddress: { en: 'Upsert Address', ne: 'अपसर्ट ठेगाना' },
      email: 'upsert@example.gov.np',
      phoneNumber: { en: '+977-111111111', ne: '+९७७-१११११११११' },
    };

    it('should upsert settings successfully', async () => {
      mockHttpClient.put.mockResolvedValue(mockApiResponse);

      const result = await OfficeSettingsService.upsertSettings(upsertData);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/api/v1/office-settings/upsert', upsertData);
      expect(result).toEqual(mockSettings);
    });
  });

  describe('deleteSettings', () => {
    it('should delete settings successfully', async () => {
      const deleteResponse = {
        success: true,
        data: { message: 'Office settings deleted successfully' },
        error: null,
        meta: { timestamp: '2024-01-01T00:00:00.000Z', version: '1.0.0' },
      };

      mockHttpClient.delete.mockResolvedValue(deleteResponse);

      await OfficeSettingsService.deleteSettings('test-id');

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/api/v1/office-settings/test-id');
    });

    it('should handle forbidden error', async () => {
      const errorResponse = {
        success: false,
        data: null,
        error: { code: 'FORBIDDEN', message: 'Forbidden' },
        meta: { timestamp: '2024-01-01T00:00:00.000Z', version: '1.0.0' },
      };

      mockHttpClient.delete.mockResolvedValue(errorResponse);

      await expect(OfficeSettingsService.deleteSettings('test-id')).rejects.toThrow('You do not have permission to perform this action');
    });
  });

  describe('uploadBackgroundPhoto', () => {
    it('should handle file upload placeholder', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockHttpClient.get.mockResolvedValue(mockApiResponse);

      const result = await OfficeSettingsService.uploadBackgroundPhoto('test-id', file);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/office-settings/test-id');
      expect(result.backgroundPhoto).toContain('placeholder.com/background-photos');
    });
  });

  describe('removeBackgroundPhoto', () => {
    it('should handle file removal placeholder', async () => {
      const updateResponse = {
        success: true,
        data: { ...mockSettings, backgroundPhoto: null },
        error: null,
        meta: { timestamp: '2024-01-01T00:00:00.000Z', version: '1.0.0' },
      };

      mockHttpClient.put.mockResolvedValue(updateResponse);

      const result = await OfficeSettingsService.removeBackgroundPhoto('test-id');

      expect(mockHttpClient.put).toHaveBeenCalledWith('/api/v1/office-settings/test-id', {
        backgroundPhoto: null,
      });
      expect(result.backgroundPhoto).toBeNull();
    });
  });

  describe('Error Message Formatting', () => {
    it('should format validation errors', async () => {
      const errorResponse = {
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed' },
        meta: { timestamp: '2024-01-01T00:00:00.000Z', version: '1.0.0' },
      };

      mockHttpClient.get.mockResolvedValue(errorResponse);

      await expect(OfficeSettingsService.getSettings()).rejects.toThrow('Please check your input and try again');
    });

    it('should format network errors', async () => {
      const networkError = new Error('Network Error');
      mockHttpClient.get.mockRejectedValue(networkError);

      await expect(OfficeSettingsService.getSettings()).rejects.toThrow('Please check your internet connection and try again');
    });

    it('should format timeout errors', async () => {
      const timeoutError = new Error('timeout of 10000ms exceeded');
      mockHttpClient.get.mockRejectedValue(timeoutError);

      await expect(OfficeSettingsService.getSettings()).rejects.toThrow('Request timed out. Please try again');
    });

    it('should format server errors', async () => {
      const serverError = new Error('Request failed with status code 500');
      serverError.response = { status: 500 };
      mockHttpClient.get.mockRejectedValue(serverError);

      await expect(OfficeSettingsService.getSettings()).rejects.toThrow('Server error. Please try again later');
    });

    it('should format generic errors', async () => {
      const genericError = new Error('Some unknown error');
      mockHttpClient.get.mockRejectedValue(genericError);

      await expect(OfficeSettingsService.getSettings()).rejects.toThrow('Something went wrong. Please try again.');
    });
  });
}); 