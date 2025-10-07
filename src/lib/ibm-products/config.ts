// Ensure PAL (IBM Products) canary components are enabled before first use
// This module should be imported anywhere you plan to use @carbon/ibm-products components
// Do NOT import globally; keep imports scoped to pages/domains that need PAL

import { pkg } from "@carbon/ibm-products/es/settings";

// Guard to avoid reapplying during hot reloads
const globalObj: any = typeof globalThis !== "undefined" ? globalThis : {};
if (!globalObj.__ibm_products_flags_applied__) {
  // Enable specific components we use
  // SidePanel is stable, ActionBar is canary in some releases
  (pkg as any).component = (pkg as any).component || {};
  (pkg as any).component.SidePanel = true;
  (pkg as any).component.ActionBar = true;

  // Optionally enable all to avoid missing flags during development
  (pkg as any).setAllComponents?.(true);

  // You can enable features individually, e.g.:
  (pkg as any).feature = (pkg as any).feature || {};
  // Some builds reference these feature flags internally
  (pkg as any).feature.enableSidepanelResizer = true;
  (pkg as any).feature.enableSidePanelResizer = true;
  (pkg as any).feature.enableSidePanel = true;
  (pkg as any).feature['SidePanel.enableSidepanelResizer'] = true;
  (pkg as any).feature['SidePanel.enableSidePanelResizer'] = true;
  (pkg as any).feature['SidePanel.enableSidePanel'] = true;
  
  // Try to enable all features to avoid missing flags
  if ((pkg as any).setAllFeatures) {
    (pkg as any).setAllFeatures(true);
  } else {
    // Fallback: manually set common feature flags
    const commonFlags = [
      'enableSidepanelResizer',
      'enableSidePanelResizer', 
      'enableSidePanel',
      'SidePanel.enableSidepanelResizer',
      'SidePanel.enableSidePanelResizer',
      'SidePanel.enableSidePanel'
    ];
    
    commonFlags.forEach(flag => {
      (pkg as any).feature[flag] = true;
    });
  }

  globalObj.__ibm_products_flags_applied__ = true;
}

export {}; 


