'use client';

import { useResponsive } from './use-responsive';

export const useSidebar = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Carbon UI Shell handles sidebar state automatically
  // This hook provides responsive information for components that need it
  return {
    isMobile,
    isTablet,
    isDesktop,
    isCollapsibleMode: isMobile || isTablet,
  };
};
