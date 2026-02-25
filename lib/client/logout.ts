/**
 * Logout helper for frontend
 * Handles logout API call, state clearing, and redirect
 * 
 * @example Usage in a component
 * ```typescript
 * import { logout } from '@/lib/client/logout';
 * 
 * function LogoutButton() {
 *   const handleLogout = async () => {
 *     await logout();
 *   };
 *   
 *   return <button onClick={handleLogout}>Logout</button>;
 * }
 * ```
 */

import { sessionHandler } from './sessionHandler';

export interface LogoutOptions {
  /**
   * Redirect path after logout
   * Defaults to '/' (home page)
   */
  redirectTo?: string;
}

/**
 * Perform logout
 * Calls logout API, clears local auth state, and redirects to home/login page
 * @param options - Logout options including redirect path
 * @returns Promise that resolves when logout is complete
 */
export async function logout(options: LogoutOptions = {}): Promise<void> {
  const { redirectTo = '/' } = options;
  
  try {
    // Call logout API endpoint
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Clear local authentication state regardless of API response
    // This ensures the user is logged out even if the API call fails
    sessionHandler.clearAuthState();
    
    // Check if logout was successful
    if (response.ok) {
      const data = await response.json();
      console.info('Logout successful:', data.message);
    } else {
      console.warn('Logout API returned non-OK status:', response.status);
    }
  } catch (error) {
    // Network error or other issue
    // Still clear local state to ensure user is logged out
    console.error('Logout error:', error);
    sessionHandler.clearAuthState();
  } finally {
    // Always redirect after logout attempt
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
  }
}

/**
 * Check if user should be redirected after authentication
 * Returns the stored redirect path if available
 * @returns Redirect path or null
 */
export function getPostAuthRedirect(): string | null {
  if (typeof window === 'undefined') return null;
  
  const redirectPath = localStorage.getItem('redirect_after_auth');
  if (redirectPath) {
    // Clear the stored redirect path
    localStorage.removeItem('redirect_after_auth');
    return redirectPath;
  }
  
  return null;
}
