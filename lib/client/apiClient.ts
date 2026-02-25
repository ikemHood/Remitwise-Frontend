/**
 * API client wrapper with session expiry detection
 * Automatically handles session expiry and redirects users to re-authenticate
 * 
 * @example Basic usage
 * ```typescript
 * import { apiClient } from '@/lib/client/apiClient';
 * 
 * const data = await apiClient.get('/api/protected/resource');
 * ```
 * 
 * @example With request options
 * ```typescript
 * const data = await apiClient.post('/api/protected/action', {
 *   body: JSON.stringify({ key: 'value' }),
 *   headers: { 'Content-Type': 'application/json' }
 * });
 * ```
 */

import { sessionHandler } from './sessionHandler';

export interface ApiClientOptions extends RequestInit {
  // Additional options can be added here
}

/**
 * Make an API request with automatic session expiry handling
 * @param url - The API endpoint URL
 * @param options - Fetch options
 * @returns Response object or null if session expired
 */
async function request(url: string, options?: ApiClientOptions): Promise<Response | null> {
  try {
    const response = await fetch(url, options);
    
    // Check if session expired
    if (await sessionHandler.isSessionExpired(response)) {
      // Get current path for post-auth redirect
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : undefined;
      sessionHandler.handleSessionExpiry(currentPath);
      return null;
    }
    
    return response;
  } catch (error) {
    // Network errors should not clear session state
    throw error;
  }
}

/**
 * Make a GET request
 * @param url - The API endpoint URL
 * @param options - Fetch options
 * @returns Response object or null if session expired
 */
async function get(url: string, options?: Omit<ApiClientOptions, 'method' | 'body'>): Promise<Response | null> {
  return request(url, { ...options, method: 'GET' });
}

/**
 * Make a POST request
 * @param url - The API endpoint URL
 * @param options - Fetch options
 * @returns Response object or null if session expired
 */
async function post(url: string, options?: Omit<ApiClientOptions, 'method'>): Promise<Response | null> {
  return request(url, { ...options, method: 'POST' });
}

/**
 * Make a PUT request
 * @param url - The API endpoint URL
 * @param options - Fetch options
 * @returns Response object or null if session expired
 */
async function put(url: string, options?: Omit<ApiClientOptions, 'method'>): Promise<Response | null> {
  return request(url, { ...options, method: 'PUT' });
}

/**
 * Make a DELETE request
 * @param url - The API endpoint URL
 * @param options - Fetch options
 * @returns Response object or null if session expired
 */
async function del(url: string, options?: Omit<ApiClientOptions, 'method' | 'body'>): Promise<Response | null> {
  return request(url, { ...options, method: 'DELETE' });
}

/**
 * API client with session expiry handling
 * Use this instead of raw fetch for authenticated requests
 */
export const apiClient = {
  request,
  get,
  post,
  put,
  delete: del,
};
