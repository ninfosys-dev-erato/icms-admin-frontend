import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DepartmentResponseDto } from '../types/department';
import type { EmployeeResponseDto } from '../types/employee';

type PanelMode = 'create' | 'edit';
type ActiveEntity = 'department' | 'employee' | null;

interface Translatable {
  en: string;
  ne: string;
}

interface DepartmentFormState {
  departmentName: Translatable;
  parentId?: string;
  departmentHeadId?: string;
  order: number;
  isActive: boolean;
}

interface EmployeeFormState {
  name: Translatable;
  departmentId: string;
  position: Translatable;
  order: number;
  mobileNumber: string;
  telephone: string;
  email: string;
  roomNumber: string;
  isActive: boolean;
  photoMediaId?: string;
  showUpInHomepage: boolean;
  showDownInHomepage: boolean;
}

export interface HRUIStore {
  uploadPhotoMutation: any;
  // Panel State
  panelOpen: boolean;
  panelMode: PanelMode;
  activeEntity: ActiveEntity;
  panelDepartment: DepartmentResponseDto | null;
  panelEmployee: EmployeeResponseDto | null;
  isSubmitting: boolean;
  // Persisted UI state for better UX
  selectedTabIndex: number; // 0: employees, 1: departments
  activeFormId: string | 'create' | null;

  // Form State (persisted)
  departmentFormById: Record<string, DepartmentFormState>;
  employeeFormById: Record<string, EmployeeFormState>;
  createDepartmentForm: DepartmentFormState;
  createEmployeeForm: EmployeeFormState;

  // Non-persisted selected files (similar to slider store)
  selectedFileById: Record<string, File | null>;
  createSelectedFile: File | null;

  // Actions
  openCreateDepartment: () => void;
  openEditDepartment: (dept: DepartmentResponseDto) => void;
  openCreateEmployee: (defaultDeptId?: string) => void;
  openEditEmployee: (emp: EmployeeResponseDto) => void;
  closePanel: () => void;
  setSubmitting: (val: boolean) => void;
  setSelectedTabIndex: (index: number) => void;

  updateDepartmentFormField: (id: string | 'create', field: keyof DepartmentFormState, value: unknown) => void;
  updateEmployeeFormField: (id: string | 'create', field: keyof EmployeeFormState, value: unknown) => void;
  resetDepartmentForm: (id: string | 'create') => void;
  resetEmployeeForm: (id: string | 'create') => void;
  
  // Photo file actions
  setSelectedFile: (id: string | 'create', file: File | null) => void;
  resetFormState: (id: string | 'create') => void;
}

const defaultDepartmentForm: DepartmentFormState = {
  departmentName: { en: '', ne: '' },
  parentId: '',
  departmentHeadId: '',
  order: 1,
  isActive: true,
};

const defaultEmployeeForm: EmployeeFormState = {
  name: { en: '', ne: '' },
  departmentId: '',
  position: { en: '', ne: '' },
  order: 1,
  mobileNumber: '',
  telephone: '',
  email: '',
  roomNumber: '',
  isActive: true,
  photoMediaId: '',
  showUpInHomepage: false,
  showDownInHomepage: false,
};

export const useHRUIStore = create<HRUIStore>()(
  persist(
    (set, get) => ({
      panelOpen: false,
      panelMode: 'create',
      activeEntity: null,
      panelDepartment: null,
      panelEmployee: null,
      isSubmitting: false,
      selectedTabIndex: 0,
      activeFormId: null,

      departmentFormById: {},
      employeeFormById: {},
      createDepartmentForm: defaultDepartmentForm,
      createEmployeeForm: defaultEmployeeForm,

      // Non-persisted selected files
      selectedFileById: {},
      createSelectedFile: null,

      openCreateDepartment: () => set((state) => ({
        panelOpen: true,
        panelMode: 'create',
        activeEntity: 'department',
        panelDepartment: null,
        isSubmitting: false,
        // Preserve create form state for UX continuity
        createDepartmentForm: state.createDepartmentForm,
        activeFormId: 'create',
      })),

      openEditDepartment: (dept) => set((state) => ({
        panelOpen: true,
        panelMode: 'edit',
        activeEntity: 'department',
        panelDepartment: dept,
        isSubmitting: false,
        activeFormId: dept.id,
        departmentFormById: {
          ...state.departmentFormById,
          [dept.id]: {
            departmentName: dept.departmentName,
            parentId: dept.parentId || '',
            departmentHeadId: dept.departmentHeadId || '',
            order: dept.order,
            isActive: dept.isActive,
          },
        },
      })),

      openCreateEmployee: (defaultDeptId) => set((state) => ({
        panelOpen: true,
        panelMode: 'create',
        activeEntity: 'employee',
        panelEmployee: null,
        isSubmitting: false,
        // Preserve create form state; only apply defaultDeptId if empty
        createEmployeeForm: {
          ...state.createEmployeeForm,
          departmentId: state.createEmployeeForm.departmentId || defaultDeptId || '',
        },
        activeFormId: 'create',
      })),

      openEditEmployee: (emp) => set((state) => ({
        panelOpen: true,
        panelMode: 'edit',
        activeEntity: 'employee',
        panelEmployee: emp,
        isSubmitting: false,
        activeFormId: emp.id,
        employeeFormById: {
          ...state.employeeFormById,
          [emp.id]: {
            name: emp.name,
            departmentId: emp.departmentId,
            position: emp.position,
            order: emp.order,
            mobileNumber: emp.mobileNumber || '',
            telephone: emp.telephone || '',
            email: emp.email || '',
            roomNumber: emp.roomNumber || '',
            isActive: emp.isActive,
            photoMediaId: emp.photoMediaId || '',
            showUpInHomepage: emp.showUpInHomepage ?? false,
            showDownInHomepage: emp.showDownInHomepage ?? false,
          },
        },
      })),

      closePanel: () => set({ panelOpen: false, isSubmitting: false, activeFormId: null }),
      setSubmitting: (val) => set({ isSubmitting: val }),
      setSelectedTabIndex: (index) => set({ selectedTabIndex: index }),

      updateDepartmentFormField: (id, field, value) => {
        if (id === 'create') {
          set((state) => ({ createDepartmentForm: { ...state.createDepartmentForm, [field]: value as any } }));
        } else {
          set((state) => ({
            departmentFormById: {
              ...state.departmentFormById,
              [id]: {
                ...(state.departmentFormById[id] ?? defaultDepartmentForm),
                [field]: value as any,
              },
            },
          }));
        }
      },

      updateEmployeeFormField: (id, field, value) => {
        if (id === 'create') {
          set((state) => ({ createEmployeeForm: { ...state.createEmployeeForm, [field]: value as any } }));
        } else {
          set((state) => ({
            employeeFormById: {
              ...state.employeeFormById,
              [id]: {
                ...(state.employeeFormById[id] ?? defaultEmployeeForm),
                [field]: value as any,
              },
            },
          }));
        }
      },

      resetDepartmentForm: (id) => {
        if (id === 'create') {
          set({ createDepartmentForm: defaultDepartmentForm });
        } else {
          const dept = get().panelDepartment;
          const base = dept && dept.id === id ? {
            departmentName: dept.departmentName,
            parentId: dept.parentId || '',
            departmentHeadId: dept.departmentHeadId || '',
            order: dept.order,
            isActive: dept.isActive,
          } : defaultDepartmentForm;
          set((state) => ({ departmentFormById: { ...state.departmentFormById, [id]: base } }));
        }
      },

      resetEmployeeForm: (id) => {
        if (id === 'create') {
          set({ createEmployeeForm: defaultEmployeeForm });
        } else {
          const emp = get().panelEmployee;
          const base = emp && emp.id === id ? {
            name: emp.name,
            departmentId: emp.departmentId,
            position: emp.position,
            order: emp.order,
            mobileNumber: emp.mobileNumber || '',
            telephone: emp.telephone || '',
            email: emp.email || '',
            roomNumber: emp.roomNumber || '',
            isActive: emp.isActive,
            photoMediaId: emp.photoMediaId || '',
            showUpInHomepage: emp.showUpInHomepage ?? false,
            showDownInHomepage: emp.showDownInHomepage ?? false,
          } : defaultEmployeeForm;
          set((state) => ({ employeeFormById: { ...state.employeeFormById, [id]: base } }));
        }
      },

      // Photo file actions
      setSelectedFile: (id, file) => {
        if (id === 'create') {
          set({ createSelectedFile: file });
        } else {
          set((state) => ({
            selectedFileById: {
              ...state.selectedFileById,
              [id]: file,
            },
          }));
        }
      },

      resetFormState: (id) => {
        if (id === 'create') {
          set({ createSelectedFile: null });
        } else {
          set((state) => ({
            selectedFileById: {
              ...state.selectedFileById,
              [id]: null,
            },
          }));
        }
      },
    }),
    {
      name: 'hr-ui-store',
      partialize: (state) => ({
        panelMode: state.panelMode,
        activeEntity: state.activeEntity,
        panelOpen: state.panelOpen,
        selectedTabIndex: state.selectedTabIndex,
        activeFormId: state.activeFormId,
        createDepartmentForm: state.createDepartmentForm,
        createEmployeeForm: state.createEmployeeForm,
        departmentFormById: state.departmentFormById,
        employeeFormById: state.employeeFormById,
      }),
    }
  )
);


