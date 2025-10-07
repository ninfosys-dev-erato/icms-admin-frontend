"use client";

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useContentStore } from '../stores/content-store';

/**
 * Hook to sync content management tab state with URL parameters
 * This provides deep-linkable state and browser history integration
 */
export function useContentNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { selectedTabIndex, setSelectedTabIndex, activeEntity, panelOpen } = useContentStore();
  const isInitializedRef = useRef(false);

  // Initialize tab state from URL on mount
  useEffect(() => {
    if (!isInitializedRef.current) {
      const tab = searchParams.get('tab');
      let tabIndex = 0;
      
      if (tab === 'categories') {
        tabIndex = 1;
      } else {
        // Default to content tab if no URL param or unknown param
        tabIndex = 0;
      }

      setSelectedTabIndex(tabIndex);
      isInitializedRef.current = true;
    }
  }, [setSelectedTabIndex, searchParams]);

  // Helper functions for navigation with URL sync
  const navigateToTab = (tabIndex: number) => {
    setSelectedTabIndex(tabIndex);
    
    // Update URL
    const newParams = new URLSearchParams(searchParams.toString());
    const newTab = tabIndex === 0 ? 'content' : 'categories';
    newParams.set('tab', newTab);
    
    const newUrl = `${pathname}?${newParams.toString()}`;
    router.push(newUrl, { scroll: false });
  };

  const navigateToContent = () => navigateToTab(0);
  const navigateToCategories = () => navigateToTab(1);

  // Get current tab info
  const isContentTab = selectedTabIndex === 0;
  const isCategoriesTab = selectedTabIndex === 1;
  const currentTabName = isContentTab ? 'content' : 'categories';

  return {
    // Navigation methods
    navigateToTab,
    navigateToContent,
    navigateToCategories,
    
    // Current state
    selectedTabIndex,
    currentTabName,
    isContentTab,
    isCategoriesTab,
    activeEntity,
    panelOpen,
  };
}

/**
 * Hook to manage panel state with URL integration
 */
export function useContentPanelNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const store = useContentStore();

  const closePanelAndNavigate = () => {
    store.closePanel();
    
    // Clean up URL parameters
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('panel');
    newParams.delete('entity');
    newParams.delete('mode');
    newParams.delete('id');
    
    const newUrl = `${pathname}?${newParams.toString()}`;
    router.push(newUrl, { scroll: false });
  };

  return {
    closePanelAndNavigate,
  };
}