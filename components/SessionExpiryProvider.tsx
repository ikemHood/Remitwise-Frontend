'use client';

import { useSessionExpiry } from '@/lib/client/useSessionExpiry';
import SessionExpiryNotification from './SessionExpiryNotification';

/**
 * Session expiry provider component
 * Wraps the application to provide global session expiry notifications
 * 
 * @example Usage in layout
 * ```typescript
 * import SessionExpiryProvider from '@/components/SessionExpiryProvider';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <SessionExpiryProvider>
 *           {children}
 *         </SessionExpiryProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export default function SessionExpiryProvider({ children }: { children: React.ReactNode }) {
  const { isExpired, clearExpiry } = useSessionExpiry();

  return (
    <>
      <SessionExpiryNotification show={isExpired} onClose={clearExpiry} />
      {children}
    </>
  );
}
