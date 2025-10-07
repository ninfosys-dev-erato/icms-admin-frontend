import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HeaderConfig, HeaderFormData } from '../types/header';
import { HeaderAlignment } from '../types/header';

export interface HeaderUIStore {
  // UI state
  panelOpen: boolean;
  panelMode: 'create' | 'edit';
  panelHeader: HeaderConfig | null;
  isSubmitting: boolean;
  activeTab: number;

  // Form state
  formData: HeaderFormData;
  validationErrors: Record<string, string>;

  // Logo upload state
  leftLogoFile: File | null;
  rightLogoFile: File | null;

  // Actions
  openCreatePanel: () => void;
  openEditPanel: (header: HeaderConfig) => void;
  closePanel: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setActiveTab: (tab: number) => void;
  updateFormField: (field: keyof HeaderFormData, value: unknown) => void;
  setLogoFile: (type: 'left' | 'right', file: File | null) => void;
  resetForm: () => void;
  validateForm: () => boolean;
  setValidationErrors: (errors: Record<string, string>) => void;
}

export const useHeaderStore = create<HeaderUIStore>()(
  persist(
    (set, get) => ({
      // Initial UI state
      panelOpen: false,
      panelMode: 'create',
      panelHeader: null,
      isSubmitting: false,
      activeTab: 0,

      // Form state
      formData: {
        name: { en: '', ne: '' },
        order: 1,
        isActive: true,
        isPublished: false,
        typography: {
          fontFamily: 'Arial, sans-serif',
          fontSize: 16,
          fontWeight: 'normal',
          color: '#333333',
          lineHeight: 1.5,
          letterSpacing: 0.5
        },
        alignment: HeaderAlignment.LEFT,
        logo: {
          leftLogo: undefined,
          rightLogo: undefined,
          logoAlignment: 'left',
          logoSpacing: 20
        },
        layout: {
          headerHeight: 80,
          backgroundColor: '#ffffff',
          borderColor: '#e0e0e0',
          borderWidth: 1,
          padding: { top: 10, right: 20, bottom: 10, left: 20 },
          margin: { top: 0, right: 0, bottom: 0, left: 0 }
        }
      },
      validationErrors: {},

      // Logo upload state
      leftLogoFile: null,
      rightLogoFile: null,

      // UI Actions
      openCreatePanel: () => {
        set({
          panelOpen: true,
          panelMode: 'create',
          panelHeader: null,
          isSubmitting: false,
          activeTab: 0,
          validationErrors: {},
          leftLogoFile: null,
          rightLogoFile: null,
          formData: {
            name: { en: '', ne: '' },
            order: 1,
            isActive: true,
            isPublished: false,
            typography: {
              fontFamily: 'Arial, sans-serif',
              fontSize: 16,
              fontWeight: 'normal',
              color: '#333333',
              lineHeight: 1.5,
              letterSpacing: 0.5
            },
            alignment: HeaderAlignment.LEFT,
            logo: {
              leftLogo: undefined,
              rightLogo: undefined,
              logoAlignment: 'left',
              logoSpacing: 20
            },
            layout: {
              headerHeight: 80,
              backgroundColor: '#ffffff',
              borderColor: '#e0e0e0',
              borderWidth: 1,
              padding: { top: 10, right: 20, bottom: 10, left: 20 },
              margin: { top: 0, right: 0, bottom: 0, left: 0 }
            }
          }
        });
      },

      openEditPanel: (header: HeaderConfig) => {
        set({
          panelOpen: true,
          panelMode: 'edit',
          panelHeader: header,
          isSubmitting: false,
          activeTab: 0,
          validationErrors: {},
          leftLogoFile: null,
          rightLogoFile: null
        });
        
        // Initialize form data from header
        set({
          formData: {
            name: header.name || { en: '', ne: '' },
            order: header.order || 1,
            isActive: header.isActive ?? true,
            isPublished: header.isPublished ?? false,
            typography: header.typography || {
              fontFamily: 'Arial, sans-serif',
              fontSize: 16,
              fontWeight: 'normal',
              color: '#333333',
              lineHeight: 1.5,
              letterSpacing: 0.5
            },
            alignment: header.alignment || HeaderAlignment.LEFT,
            logo: {
              leftLogo: header.logo?.leftLogo ? {
                mediaId: header.logo.leftLogo.mediaId,
                altText: header.logo.leftLogo.altText || { en: '', ne: '' },
                width: header.logo.leftLogo.width || 150,
                height: header.logo.leftLogo.height || 50,
              } : undefined,
              rightLogo: header.logo?.rightLogo ? {
                mediaId: header.logo.rightLogo.mediaId,
                altText: header.logo.rightLogo.altText || { en: '', ne: '' },
                width: header.logo.rightLogo.width || 150,
                height: header.logo.rightLogo.height || 50,
              } : undefined,
              logoAlignment: header.logo?.logoAlignment || 'left',
              logoSpacing: header.logo?.logoSpacing || 20
            },
            layout: header.layout || {
              headerHeight: 80,
              backgroundColor: '#ffffff',
              borderColor: '#e0e0e0',
              borderWidth: 1,
              padding: { top: 10, right: 20, bottom: 10, left: 20 },
              margin: { top: 0, right: 0, bottom: 0, left: 0 }
            }
          }
        });
      },

      closePanel: () => {
        set({ 
          panelOpen: false, 
          isSubmitting: false,
          validationErrors: {},
          leftLogoFile: null,
          rightLogoFile: null
        });
      },

      setSubmitting: (isSubmitting: boolean) => {
        set({ isSubmitting });
      },

      setActiveTab: (activeTab: number) => {
        set({ activeTab });
      },

      // Form Actions
      updateFormField: (field: keyof HeaderFormData, value: unknown) => {
        set((state) => ({
          formData: { ...state.formData, [field]: value },
          validationErrors: { ...state.validationErrors, [field]: '' }
        }));
      },

      setLogoFile: (type: 'left' | 'right', file: File | null) => {
        if (type === 'left') {
          set({ leftLogoFile: file });
        } else {
          set({ rightLogoFile: file });
        }
      },

      resetForm: () => {
        set({
          formData: {
            name: { en: '', ne: '' },
            order: 1,
            isActive: true,
            isPublished: false,
            typography: {
              fontFamily: 'Arial, sans-serif',
              fontSize: 16,
              fontWeight: 'normal',
              color: '#333333',
              lineHeight: 1.5,
              letterSpacing: 0.5
            },
            alignment: HeaderAlignment.LEFT,
            logo: {
              leftLogo: undefined,
              rightLogo: undefined,
              logoAlignment: 'left',
              logoSpacing: 20
            },
            layout: {
              headerHeight: 80,
              backgroundColor: '#ffffff',
              borderColor: '#e0e0e0',
              borderWidth: 1,
              padding: { top: 10, right: 20, bottom: 10, left: 20 },
              margin: { top: 0, right: 0, bottom: 0, left: 0 }
            }
          },
          validationErrors: {},
          leftLogoFile: null,
          rightLogoFile: null
        });
      },

      validateForm: () => {
        const { formData } = get();
        const errors: Record<string, string> = {};

        // Validate name
        if (!formData.name.en.trim() && !formData.name.ne.trim()) {
          errors.name = 'Name in English or Nepali is required';
        }

        // Validate order
        if (!formData.order || formData.order < 1) {
          errors.order = 'Order must be at least 1';
        }

        // Validate typography
        if (!formData.typography.fontFamily.trim()) {
          errors.typography = 'Font family is required';
        }
        if (formData.typography.fontSize < 8 || formData.typography.fontSize > 72) {
          errors.typography = 'Font size must be between 8 and 72';
        }
        if (!formData.typography.color.trim()) {
          errors.typography = 'Color is required';
        }

        // Validate layout
        if (formData.layout.headerHeight < 40 || formData.layout.headerHeight > 200) {
          errors.layout = 'Header height must be between 40 and 200';
        }
        if (!formData.layout.backgroundColor.trim()) {
          errors.layout = 'Background color is required';
        }

        // Logo validation - only validate if logos are configured
        if (formData.logo.leftLogo) {
          if (!formData.logo.leftLogo.altText?.en?.trim() && !formData.logo.leftLogo.altText?.ne?.trim()) {
            errors.logo = 'Left logo alt text is required in at least one language';
          }
          if (!formData.logo.leftLogo.width || formData.logo.leftLogo.width < 10) {
            errors.logo = 'Left logo width must be at least 10px';
          }
          if (!formData.logo.leftLogo.height || formData.logo.leftLogo.height < 10) {
            errors.logo = 'Left logo height must be at least 10px';
          }
        }

        if (formData.logo.rightLogo) {
          if (!formData.logo.rightLogo.altText?.en?.trim() && !formData.logo.rightLogo.altText?.ne?.trim()) {
            errors.logo = errors.logo ? errors.logo + '; Right logo alt text is required in at least one language' : 'Right logo alt text is required in at least one language';
          }
          if (!formData.logo.rightLogo.width || formData.logo.rightLogo.width < 10) {
            errors.logo = errors.logo ? errors.logo + '; Right logo width must be at least 10px' : 'Right logo width must be at least 10px';
          }
          if (!formData.logo.rightLogo.height || formData.logo.rightLogo.height < 10) {
            errors.logo = errors.logo ? errors.logo + '; Right logo height must be at least 10px' : 'Right logo height must be at least 10px';
          }
        }

        set({ validationErrors: errors });
        return Object.keys(errors).length === 0;
      },

      setValidationErrors: (errors: Record<string, string>) => {
        set({ validationErrors: errors });
      }
    }),
    {
      name: 'header-ui-store',
      partialize: (state) => ({
        panelMode: state.panelMode,
        activeTab: state.activeTab,
      }),
    }
  )
);
