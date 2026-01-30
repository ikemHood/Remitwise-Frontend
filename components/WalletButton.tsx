'use client';

import { useState } from 'react';
import { Wallet, ChevronDown, LogOut, User, Settings } from 'lucide-react';

const WalletButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const address = "GDEMOX....XXXX";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gradient-to-r from-brand-red to-[#B01C1C] rounded-full hover:opacity-90 transition-all shadow-[0_0_20px_rgba(215,35,35,0.4)] active:scale-95 border border-white/10 shrink-0"
      >
        <Wallet className="w-3 h-3 sm:w-4 sm:h-4 text-white shrink-0" />
        <span className="text-white text-[10px] sm:text-sm font-medium whitespace-nowrap">{address}</span>
        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-white transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden backdrop-blur-xl">
            <div className="p-2 space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all text-sm">
                <User className="w-4 h-4" />
                Profile
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all text-sm">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <div className="h-px bg-white/10 my-1" />
              <button className="w-full flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all text-sm font-medium">
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WalletButton;
