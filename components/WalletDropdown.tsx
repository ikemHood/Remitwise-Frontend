"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Wallet,
  Copy,
  ExternalLink,
  LogOut,
  Star,
  DollarSign,
  TrendingUp,
  ChevronRight,
  Check,
} from "lucide-react";

interface WalletDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement>;
  walletAddress?: string;
  xlmBalance?: string;
  usdcBalance?: string;
  xlmValueUsd?: string;
  usdcChange?: string;
  totalChange?: string;
}

export default function WalletDropdown({
  isOpen,
  onClose,
  buttonRef,
  walletAddress = "GDEMOXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  xlmBalance = "1,234.56",
  usdcBalance = "5,000.00",
  xlmValueUsd = "300.45",
  usdcChange = "2.5",
  totalChange = "8.3",
}: WalletDropdownProps) {
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate total portfolio value
  const totalValue = (
    parseFloat(xlmValueUsd.replace(/,/g, "")) +
    parseFloat(usdcBalance.replace(/,/g, ""))
  ).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Don't close if clicking the button that toggles the dropdown
      if (buttonRef?.current && buttonRef.current.contains(target)) {
        return;
      }
      // Close if clicking outside the dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const focusableElements = dropdownRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      const handleTab = (event: KeyboardEvent) => {
        if (event.key === "Tab") {
          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      document.addEventListener("keydown", handleTab);
      firstElement?.focus();

      return () => {
        document.removeEventListener("keydown", handleTab);
      };
    }
  }, [isOpen]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewExplorer = () => {
    window.open(
      `https://stellar.expert/explorer/public/account/${walletAddress}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleDisconnect = () => {
    console.log("Disconnecting wallet...");
    onClose();
    // Future: Clear wallet session/state
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-[24rem] md:w-[28rem] bg-[#1a1a1a] rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Wallet connection details"
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative w-12 h-12 bg-[#DC2626] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-600/50">
            <div className="bg-[#DC2626] rounded-full border-[3px] border-[#0f0f0f] w-4 h-4 absolute -top-1 -right-1"></div>
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-bold text-sm">Connected</span>

              <span className="px-3 py-[0.15rem] bg-[#DC2626]/20 border border-[#DC2626] text-[#DC2626] text-[10px] font-bold rounded-lg uppercase tracking-wider">
                Verified
              </span>
            </div>
            <p className="text-gray-500 text-xs">Freighter Wallet</p>
          </div>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="p-4 border-b border-white/5">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
          <label className="text-gray-500 text-[11px] font-medium mb-1.5 block">
            Wallet Address
          </label>
          <div className="flex items-center justify-between gap-3">
            <code className="text-gray-200 text-sm font-medium flex-1 truncate tracking-tight">
              {walletAddress}
            </code>
            <button
              onClick={copyToClipboard}
              className="bg-white/[0.05] border border-white/10 p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all flex-shrink-0"
              aria-label="Copy wallet address"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2 px-1">
          <DollarSign className="w-5 h-5 text-[#DC2626]" />
          <h3 className="font-bold text-base text-white">Balances</h3>
        </div>

        <div className="space-y-3">
          {/* XLM Balance Item */}
          <div className="flex items-center gap-4 p-5 bg-white/[0.03] border border-white/[0.08] rounded-[20px]">
            <div className="w-12 h-12 bg-[#DC2626]/10 border border-[#DC2626]/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Star className="w-6 h-6 text-[#DC2626]" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-lg leading-tight">XLM</p>
              <p className="text-gray-500 text-sm">Stellar Lumens</p>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-lg leading-tight">
                {xlmBalance}
              </p>
              <p className="text-gray-500 text-sm  font-light">
                ≈ ${xlmValueUsd}
              </p>
            </div>
          </div>

          {/* USDC Balance Item */}
          <div className="flex items-center gap-4 p-5 bg-white/[0.03] border border-white/[0.08] rounded-[20px]">
            <div className="w-12 h-12 bg-[#DC2626]/10 border border-[#DC2626]/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-[#DC2626]" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-lg leading-tight">USDC</p>
              <p className="text-gray-500 text-sm">USD Coin</p>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-lg leading-tight">
                {usdcBalance}
              </p>
              <p className="text-[#DC2626] text-sm font-light">
                +{usdcChange}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Total Portfolio Value Card */}
      <div className="p-4 border-b  border-white/5">
        <div className="p-6 bg-[#DC2626]/[0.03] border border-[#DC2626]/20 rounded-[20px] flex items-center justify-between">
          <p className="text-gray-400 text-base font-medium ">
            Total Portfolio Value
          </p>
          <div className="text-right">
            <p className="text-[#DC2626] text-2xl font-black tracking-tight">
              ${totalValue}
            </p>
            <div className="flex items-center justify-start gap-1 text-[#DC2626] opacity-80 text-sm font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>+{totalChange}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-3">
        {/* View on Explorer Button */}
        <button
          onClick={handleViewExplorer}
          className="w-full flex items-center justify-between px-5 py-4 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] text-white rounded-[15px] transition-all group"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-white" />
            <span className="text-base font-bold tracking-tight">
              View on Explorer
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Disconnect Wallet Button */}
        <button
          onClick={handleDisconnect}
          className="w-full flex items-center  gap-2 px-5 py-4 bg-[#DC2626]/[0.04] border border-[#DC2626]/20 hover:bg-[#DC2626]/[0.08] text-[#DC2626] rounded-[15px] transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-base font-black tracking-tight">
            Disconnect Wallet
          </span>
        </button>
        <div className="w-full flex  justify-center mb-6  py-4 bg-white/[0.03] border border-white/[0.08]  text-white rounded-[15px]">
          <p className="text-gray-600 text-[13px] font-medium text-center tracking-tight">
            Your private keys never leave your wallet
          </p>
        </div>
      </div>

      {/* Footer */}
    </div>
  );
}
