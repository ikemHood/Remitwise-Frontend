'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface SessionExpiryNotificationProps {
  show: boolean;
  onClose: () => void;
}

/**
 * Session expiry notification component
 * Displays a user-friendly message when session expires
 */
export default function SessionExpiryNotification({ show, onClose }: SessionExpiryNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    }
  }, [show]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-[#1A1A1A] border border-red-500/20 rounded-xl shadow-2xl p-4 max-w-md">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm mb-1">
              Session Expired
            </h3>
            <p className="text-white/70 text-sm">
              Your session has expired. Please reconnect your wallet.
            </p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
            className="flex-shrink-0 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
