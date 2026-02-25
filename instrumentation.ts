/**
 * Next.js instrumentation hook
 * Runs once when the server starts (both dev and production)
 * Used for server initialization tasks like configuration validation
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import { validateSessionConfig } from '@/lib/session';

/**
 * Register function runs once on server startup
 * Validates session configuration and logs startup information
 */
export async function register() {
  // Only run on server-side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      // Validate session configuration on startup
      // This will throw if SESSION_PASSWORD is invalid
      // and log warnings/info for other configuration values
      validateSessionConfig();
      
      console.info('Session configuration validated successfully');
    } catch (error) {
      // Log error and exit - invalid configuration should prevent server start
      console.error('Failed to validate session configuration:', error);
      throw error;
    }
  }
}
