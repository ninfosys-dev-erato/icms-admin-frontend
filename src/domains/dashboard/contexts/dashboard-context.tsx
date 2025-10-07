'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useLanguageFont } from '@/shared/hooks/use-language-font';
import { DashboardState, DashboardFilters, DashboardConfig } from '@/types/dashboard';

// ========================================
// DASHBOARD CONTEXT TYPES
// ========================================

interface DashboardContextType {
  state: DashboardState;
  filters: DashboardFilters;
  dispatch: React.Dispatch<DashboardAction>;
  updateFilters: (filters: Partial<DashboardFilters>) => void;
  toggleAutoRefresh: () => void;
  updateRefreshInterval: (interval: number) => void;
  resetFilters: () => void;
}

type DashboardAction =
  | { type: 'SET_OVERVIEW'; payload: any }
  | { type: 'SET_CONFIG'; payload: DashboardConfig }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LAST_UPDATED'; payload: Date }
  | { type: 'TOGGLE_AUTO_REFRESH' }
  | { type: 'SET_REFRESH_INTERVAL'; payload: number }
  | { type: 'UPDATE_FILTERS'; payload: Partial<DashboardFilters> }
  | { type: 'RESET_FILTERS' }
  | { type: 'RESET_STATE' };

// ========================================
// INITIAL STATE
// ========================================

const initialState: DashboardState = {
  overview: null,
  config: null,
  loading: false,
  error: null,
  lastUpdated: null,
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
};

const initialFilters: DashboardFilters = {
  dateRange: {
    from: null,
    to: null,
  },
  category: 'all',
  granularity: 'daily',
  includeTrends: true,
};

// ========================================
// REDUCER FUNCTION
// ========================================

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_OVERVIEW':
      return {
        ...state,
        overview: action.payload,
        lastUpdated: new Date(),
        error: null,
      };
    
    case 'SET_CONFIG':
      return {
        ...state,
        config: action.payload,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    
    case 'SET_LAST_UPDATED':
      return {
        ...state,
        lastUpdated: action.payload,
      };
    
    case 'TOGGLE_AUTO_REFRESH':
      return {
        ...state,
        autoRefresh: !state.autoRefresh,
      };
    
    case 'SET_REFRESH_INTERVAL':
      return {
        ...state,
        refreshInterval: action.payload,
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// ========================================
// CONTEXT CREATION
// ========================================

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// ========================================
// PROVIDER COMPONENT
// ========================================

interface DashboardProviderProps {
  children: ReactNode;
  initialConfig?: Partial<DashboardConfig>;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ 
  children, 
  initialConfig 
}) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const [filters, setFilters] = React.useState<DashboardFilters>(initialFilters);
  const t = useTranslations();
  const { isNepali } = useLanguageFont();

  // Load saved preferences from localStorage
  useEffect(() => {
    try {
      const savedAutoRefresh = localStorage.getItem('dashboard-auto-refresh');
      const savedRefreshInterval = localStorage.getItem('dashboard-refresh-interval');
      const savedFilters = localStorage.getItem('dashboard-filters');

      if (savedAutoRefresh !== null) {
        dispatch({ type: 'SET_LOADING', payload: JSON.parse(savedAutoRefresh) });
      }

      if (savedRefreshInterval !== null) {
        dispatch({ type: 'SET_REFRESH_INTERVAL', payload: JSON.parse(savedRefreshInterval) });
      }

      if (savedFilters !== null) {
        setFilters(JSON.parse(savedFilters));
      }
    } catch (error) {
      console.warn('Failed to load dashboard preferences:', error);
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('dashboard-auto-refresh', JSON.stringify(state.autoRefresh));
      localStorage.setItem('dashboard-refresh-interval', JSON.stringify(state.refreshInterval));
    } catch (error) {
      console.warn('Failed to save dashboard preferences:', error);
    }
  }, [state.autoRefresh, state.refreshInterval]);

  // Save filters to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('dashboard-filters', JSON.stringify(filters));
    } catch (error) {
      console.warn('Failed to save dashboard filters:', error);
    }
  }, [filters]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!state.autoRefresh || !state.refreshInterval) return;

    const interval = setInterval(() => {
      // Trigger a refresh by dispatching an action
      dispatch({ type: 'SET_LAST_UPDATED', payload: new Date() });
    }, state.refreshInterval);

    return () => clearInterval(interval);
  }, [state.autoRefresh, state.refreshInterval]);

  // Update filters function
  const updateFilters = (newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Toggle auto-refresh function
  const toggleAutoRefresh = () => {
    dispatch({ type: 'TOGGLE_AUTO_REFRESH' });
  };

  // Update refresh interval function
  const updateRefreshInterval = (interval: number) => {
    dispatch({ type: 'SET_REFRESH_INTERVAL', payload: interval });
  };

  // Reset filters function
  const resetFilters = () => {
    setFilters(initialFilters);
  };

  // Context value
  const contextValue: DashboardContextType = {
    state,
    filters,
    dispatch,
    updateFilters,
    toggleAutoRefresh,
    updateRefreshInterval,
    resetFilters,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

// ========================================
// CUSTOM HOOK
// ========================================

export const useDashboardContext = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  
  return context;
};

// ========================================
// UTILITY HOOKS
// ========================================

export const useDashboardState = () => {
  const { state } = useDashboardContext();
  return state;
};

export const useDashboardFilters = () => {
  const { filters, updateFilters, resetFilters } = useDashboardContext();
  return { filters, updateFilters, resetFilters };
};

export const useDashboardActions = () => {
  const { dispatch, toggleAutoRefresh, updateRefreshInterval } = useDashboardContext();
  return { dispatch, toggleAutoRefresh, updateRefreshInterval };
};

export const useDashboardRefresh = () => {
  const { state, toggleAutoRefresh, updateRefreshInterval } = useDashboardContext();
  return {
    autoRefresh: state.autoRefresh,
    refreshInterval: state.refreshInterval,
    toggleAutoRefresh,
    updateRefreshInterval,
  };
};
