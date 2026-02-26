'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to listen for session expiry events
 * Returns state indicating if session has expired
 * 
 * Usage example:
 * const { isExpired, message, clearExpiry } = useSessionExpiry();
 */
export function useSessionExpiry() {
  const [isExpired, setIsExpired] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleSessionExpired = (event: Event) => {
      const customEvent = event as CustomEvent;
      setIsExpired(true);
      setMessage(customEvent.detail?.message || 'Your session has expired. Please reconnect your wallet.');
    };

    window.addEventListener('session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, []);

  const clearExpiry = () => {
    setIsExpired(false);
    setMessage('');
  };

  return { isExpired, message, clearExpiry };
}
