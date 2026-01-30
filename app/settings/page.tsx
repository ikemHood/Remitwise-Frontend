"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Wallet,
  Bell,
  Globe,
  ShieldCheck,
  Info,
  FileText,
  Clock,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Zap,
  HelpCircle,
  DollarSign,
  Languages,
  Moon,
  CheckCircle,
} from "lucide-react";
import SettingsSection from "@/components/SettingsSection";
import SettingsItem from "@/components/SettingsItem";
import { AccountSection } from "@/components/AccountSection";
  ExternalLink,
  Mail,
  ChevronRight,
  CheckCircle,
  Zap,
  AlertCircle,
  Languages,
  Moon,
  ChevronDown,
} from "lucide-react";
import SettingsSection from "@/components/SettingsSection";
import SettingsItem from "@/components/SettingsItem";
import SettingsHeader from "@/components/SettingsHeader";
import PreferencesRow from "@/components/PreferencesRow";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    billReminders: true,
    paymentConfirmations: true,
    goalUpdates: true,
    goalUpdates: false,
    securityAlerts: true,
  });

  const [security, setSecurity] = useState({
    autoSignTransactions: false,
  });

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/dashboard"
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-full border border-gray-700/50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">Settings</h1>
              <p className="text-xs sm:text-sm text-gray-400">Manage your account and preferences</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center relative">
              <span className="text-white font-bold text-sm">R</span>
              <span className="absolute top-1.5 right-1.5 w-1 h-1 bg-white rounded-full"></span>
            </div>
            <span className="hidden sm:inline text-white font-semibold">RemitWise</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto py-6 px-4 pb-12">
  const [currency, setCurrency] = useState("USD");

  const stellarAddress = "GCF2...7P3Q";

  return (
<main className="w-full min-h-screen bg-[#0F0F0F] md:px-[171.5px] px-[16px] font-inter">
  <SettingsHeader />

      <div className="w-full py-6">
        {/* Account Section */}
        <div className="mb-8">
          <AccountSection />
        </div>

        {/* Notifications Section */}
        <SettingsSection 
          title="Notifications" 
          subtitle="Manage alert preferences"
          icon={<Bell className="w-5 h-5" />}
        >
          <SettingsItem
            icon={<FileText className="w-5 h-5" />}
            title="Bill Reminders"
            description="Get notified before bills are due"
            type="toggle"
            enabled={notifications.billReminders}
            onToggle={(val) =>
              setNotifications({ ...notifications, billReminders: val })
            }
          />
          <SettingsItem
            icon={<CheckCircle className="w-5 h-5" />}
            title="Payment Confirmations"
            description="Receive transaction confirmations"
            type="toggle"
            enabled={notifications.paymentConfirmations}
            onToggle={(val) =>
              setNotifications({ ...notifications, paymentConfirmations: val })
            }
          />
          <SettingsItem
            icon={<Zap className="w-5 h-5" />}
            title="Goal Progress Updates"
            description="Track savings goal milestones"
            type="toggle"
            enabled={notifications.goalUpdates}
            onToggle={(val) =>
              setNotifications({ ...notifications, goalUpdates: val })
            }
          />
          <SettingsItem
            icon={<Clock className="w-5 h-5" />}
            title="Security Alerts"
            description="Important security notifications"
            type="toggle"
            enabled={notifications.securityAlerts}
            onToggle={(val) =>
              setNotifications({ ...notifications, securityAlerts: val })
            }
          />
        </SettingsSection>

        {/* Preferences Section */}
        <SettingsSection 
          title="Preferences" 
          subtitle="Customize your experience"
          icon={<Globe className="w-5 h-5" />}
        >
          <SettingsItem
            icon={<DollarSign className="w-5 h-5" />}
            title="Currency Display"
            description="Default currency for amounts"
            type="dropdown"
            hasDropdownBar
          />
          <SettingsItem
            icon={<Languages className="w-5 h-5" />}
            title="Language"
            description="App display language"
            type="dropdown"
            hasDropdownBar
            comingSoon
          />
          <SettingsItem
            icon={<Moon className="w-5 h-5" />}
            title="Theme"
            description="Visual appearance"
            type="dropdown"
            hasDropdownBar
            comingSoon
          />
        </SettingsSection>
        <div className="mb-8 bg-[#010101] p-4">
          {/* Section header (matches your sample UI) */}
          <div className="px-4 mb-3">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center justify-center bg-[#DC262633] w-[40px] h-[40px] rounded-[14px]">
                <Bell className="w-[20px] h-[20px] text-[#DC2626]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#FFFFFF]">
                  Notifications
                </h2>
                <p className="text-[#FFFFFF80] text-[12px] -mt-1">
                  Manage alert preferences
                </p>
              </div>
            </div>
          </div>

          {/* Dark card list */}
          <SettingsSection title="" variant="dark-card">
            <SettingsItem
              variant="notification-row"
              divider
              icon={<FileText className="w-5 h-5" />}
              title="Bill Reminders"
              description="Get notified before bills are due"
              type="toggle"
              enabled={notifications.billReminders}
              onToggle={(val) =>
                setNotifications({ ...notifications, billReminders: val })
              }
            />
            <SettingsItem
              variant="notification-row"
              divider
              icon={<CheckCircle className="w-5 h-5" />}
              title="Payment Confirmations"
              description="Receive transaction confirmations"
              type="toggle"
              enabled={notifications.paymentConfirmations}
              onToggle={(val) =>
                setNotifications({
                  ...notifications,
                  paymentConfirmations: val,
                })
              }
            />
            <SettingsItem
              variant="notification-row"
              divider
              icon={<Zap className="w-5 h-5" />}
              title="Goal Progress Updates"
              description="Track savings goal milestones"
              type="toggle"
              enabled={notifications.goalUpdates}
              onToggle={(val) =>
                setNotifications({ ...notifications, goalUpdates: val })
              }
            />
            <SettingsItem
              variant="notification-row"
              icon={<AlertCircle className="w-5 h-5" />}
              title="Security Alerts"
              description="Important security notifications"
              type="toggle"
              enabled={notifications.securityAlerts}
              onToggle={(val) =>
                setNotifications({ ...notifications, securityAlerts: val })
              }
            />
          </SettingsSection>

          {/* <div className="px-4 mt-4 text-center">
            <p className="text-gray-500 text-xs">
              Notification preferences are saved locally and will persist across
              sessions.
            </p>
          </div> */}
        </div>

        {/* Preferences Section */}
        {/* Preferences Section - Custom Dark Theme Implementation */}
        <div className="bg-black p-6 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 flex items-center justify-center bg-[#DC262633] rounded-xl">
              <Globe className="w-5 h-5 text-[#DC2626]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Preferences</h2>
              <p className="text-sm text-gray-400">Customize your experience</p>
            </div>
          </div>

          <div className="bg-[#0F0F0F] border border-[#FFFFFF14] rounded-3xl overflow-hidden">
            {/* Currency Row */}
            <PreferencesRow
              icon={<span className="text-xl">$</span>}
              title="Currency Display"
              subtitle="Default currency for amounts"
              rightContent={
                <div className="relative">
                  <select
                    className="w-full bg-[#FFFFFF0D] text-white text-sm rounded-lg px-4 py-2 pr-8 appearance-none border border-zinc-800 focus:outline-none focus:border-[#FF4500]"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    <ChevronDown className="w-5 h-5 text-gray-300" />
                  </div>
                </div>
              }
            />

            {/* Language Row */}
            <PreferencesRow
              icon={<Languages className="w-5 h-5" />}
              title={
                <div className="flex items-center justify-between w-full">
                  <span className="text-white text-[14px] md:text-[16px]">Language</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold text-[#DC2626] border border-[#DC262633] bg-[#DC26261A] rounded-full uppercase tracking-wider">
                    Coming Soon
                  </span>
                </div>
              }
              subtitle="App display language"
              rightContent={
                <div className="relative w-full">
                  <select
                    className="w-full bg-[#FFFFFF0D] text-gray-500 text-sm rounded-lg px-4 py-2 pr-8 appearance-none border border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled
                    defaultValue="English"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    <ChevronDown className="w-5 h-5 text-gray-300" />
                  </div>
                </div>
              }
            />

            {/* Theme Row */}
            <PreferencesRow
              icon={<Moon className="w-5 h-5" />}
              title={
                <div className="flex items-center justify-between w-full">
                  <span>Theme</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold text-[#DC2626] border border-[#DC262633] bg-[#DC26261A] rounded-full uppercase tracking-wider">
                    Coming Soon
                  </span>
                </div>
              }
              subtitle="Visual appearance"
              rightContent={
                <div className="relative w-full">
                  <select
                    className="w-full bg-[#FFFFFF0D] text-gray-500 text-sm rounded-lg px-4 py-2 pr-8 appearance-none border border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled
                    defaultValue="Dark"
                  >
                    <option>Dark</option>
                    <option>Light</option>
                    <option>System</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    <ChevronDown className="w-5 h-5 text-gray-300" />
                  </div>
                </div>
              }
            />
          </div>
        </div>

        {/* Security Section */}
        <SettingsSection 
          title="Security" 
          subtitle="Protect your account"
          icon={<ShieldCheck className="w-5 h-5" />}
        >
          <SettingsItem
            icon={<Zap className="w-5 h-5" />}
            title="Auto-sign Transactions"
            description="Skip confirmation for small amounts"
            type="toggle"
            enabled={security.autoSignTransactions}
            onToggle={(val) =>
              setSecurity({ ...security, autoSignTransactions: val })
            }
          />
          <SettingsItem
            icon={<Clock className="w-5 h-5" />}
            title="Session Timeout"
            description="Auto logout after inactivity"
            type="dropdown"
            hasDropdownBar
          />
        </SettingsSection>

        {/* About Section */}
        <SettingsSection 
          title="About" 
          subtitle="App information and support"
          icon={<Info className="w-5 h-5" />}
        >
          <SettingsItem
            icon={<Clock className="w-5 h-5" />}
            title="App Version"
            description="Current version: 1.0.0"
            type="text"
            value="v1.0.0"
            hasIconBackground
          />
          <SettingsItem
            icon={<FileText className="w-5 h-5" />}
            title="Terms of Service"
            description="Read our terms and conditions"
            type="navigation"
            rightIcon={<ExternalLink className="w-4 h-4" />}
            hasIconBackground
          />
          <SettingsItem
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Privacy Policy"
            description="How we protect your data"
            type="navigation"
            rightIcon={<ExternalLink className="w-4 h-4" />}
            hasIconBackground
          />
          <SettingsItem
            icon={<HelpCircle className="w-5 h-5" />}
            title="Help & Support"
            description="Get help with your account"
            type="navigation"
            rightIcon={<ChevronRight className="w-4 h-4" />}
            hasIconBackground
          />
          <SettingsItem
            icon={<Mail className="w-5 h-5" />}
            title="Contact Us"
            description="support@remitwise.com"
            type="navigation"
            rightIcon={<ExternalLink className="w-4 h-4" />}
            hasIconBackground
          />
        </SettingsSection>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center space-y-1">
          <p className="text-sm text-gray-500">
            RemitWise © 2026 - All Rights Reserved
          </p>
          <p className="text-xs text-gray-600">
            Powered by Stellar Blockchain
          </p>
        {/* About Section (redesigned) */}
        <div className="mb-8">
          <div className="px-4 mb-3 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <Info className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                About
              </h2>
              <p className="text-sm text-gray-500">
                App information and support
              </p>
            </div>
          </div>

          <div className="mx-4 rounded-2xl overflow-hidden border border-gray-800 bg-gray-900">
            <div className="divide-y divide-gray-800">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-lg bg-gray-800 flex items-center justify-center text-gray-200">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                      App Version
                    </span>
                    <span className="text-xs text-gray-400">
                      Current version: 1.0.0
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-400">v1.0.0</div>
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-lg bg-gray-800 flex items-center justify-center text-gray-200">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                      Terms of Service
                    </span>
                    <span className="text-xs text-gray-400">
                      Read our terms and conditions
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400" />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-lg bg-gray-800 flex items-center justify-center text-gray-200">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                      Privacy Policy
                    </span>
                    <span className="text-xs text-gray-400">
                      How we protect your data
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400" />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-lg bg-gray-800 flex items-center justify-center text-gray-200">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                      Help & Support
                    </span>
                    <span className="text-xs text-gray-400">
                      Get help with your account
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-lg bg-gray-800 flex items-center justify-center text-gray-200">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                      Contact Us
                    </span>
                    <span className="text-xs text-gray-400">
                      support@remitwise.com
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}