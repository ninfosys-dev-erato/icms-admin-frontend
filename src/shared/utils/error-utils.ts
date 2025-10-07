/**
 * Utility functions for safely handling errors in React components
 */

/**
 * Safely converts any error value to a string for display
 * @param error - The error value (can be Error object, string, or any other type)
 * @returns A safe string representation of the error
 */
export const safeErrorToString = (error: unknown): string => {
  if (error === null || error === undefined) {
    return 'An unknown error occurred';
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message || 'An error occurred';
  }
  
  if (typeof error === 'object') {
    // Handle API error responses
    if ('response' in error && error.response) {
      const response = error.response as any;
      if (response.data?.error?.message) {
        return response.data.error.message;
      }
      if (response.statusText) {
        return response.statusText;
      }
      if (response.status) {
        return `HTTP ${response.status}`;
      }
    }
    
    // Handle objects with message property
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    // Handle objects with error property
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
    
    // Try to stringify the object
    try {
      return JSON.stringify(error);
    } catch {
      return 'An error occurred';
    }
  }
  
  // For any other type, convert to string
  return String(error);
};
