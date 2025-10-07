'use client';

import { useState, useEffect } from 'react';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
}

// Carbon Design System Breakpoints
const BREAKPOINTS = {
  MOBILE: 768,      // < 768px
  TABLET: 1024,     // 768px - 1023px
  DESKTOP: 1024,    // >= 1024px
  LARGE_DESKTOP: 1320, // >= 1320px
} as const;

export const useResponsive = (): ResponsiveState => {
  const [screenWidth, setScreenWidth] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
    };

    // Set initial dimensions
    updateDimensions();

    // Add event listener with debouncing for better performance
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimensions, 100);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Carbon Design System responsive breakpoints
  const isMobile = screenWidth < BREAKPOINTS.MOBILE;
  const isTablet = screenWidth >= BREAKPOINTS.MOBILE && screenWidth < BREAKPOINTS.TABLET;
  const isDesktop = screenWidth >= BREAKPOINTS.DESKTOP;
  const isLargeDesktop = screenWidth >= BREAKPOINTS.LARGE_DESKTOP;

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    screenWidth,
    screenHeight,
  };
};
