'use client'

import { useState } from 'react'
import { AlertCircle, Wallet, TrendingUp, FileText, Shield, Info } from 'lucide-react'

interface SplitCategoryProps {
  icon: any
  label: string
  amount: number
  percentage: number
}

const SplitCategory = ({ icon: Icon, label, amount, percentage }: SplitCategoryProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-white">
      <div className="flex items-center space-x-3">
        <Icon className="w-4 h-4 text-red-500" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-sm font-bold">${amount.toFixed(2)}</span>
        <span className="text-[10px] text-gray-500">{percentage}%</span>
      </div>
    </div>
    <div className="w-full bg-gray-800/50 h-1 rounded-full overflow-hidden">
      <div 
        className="bg-red-600 h-full transition-all duration-300" 
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
)

export default function AutomaticSplitCard() {
  const [amount, setAmount] = useState<string>('')
  const total = parseFloat(amount) || 0

  const categories = [
    { icon: Wallet, label: 'Daily Spending', percentage: 50 },
    { icon: TrendingUp, label: 'Savings', percentage: 30 },
    { icon: Info, label: 'Bills', percentage: 15 },
    { icon: Shield, label: 'Insurance', percentage: 5 },
  ]

  return (
    <div className="space-y-4">
      {/* Main Split Card */}
      <div className="bg-[#141414] rounded-3xl p-6 border border-gray-800/50 shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-red-500/10 p-2 rounded-full">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-white text-xl font-bold">Automatic Split</h2>
        </div>

        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Your remittance will be automatically split according to your configured allocation rules:
        </p>

        <div className="space-y-6">
          {categories.map((cat, index) => (
            <SplitCategory 
              key={index}
              icon={cat.icon}
              label={cat.label}
              amount={(total * cat.percentage) / 100}
              percentage={cat.percentage}
            />
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800/50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white font-bold text-lg">Total Amount</span>
            <div className="text-right">
              <span className="text-white text-3xl font-bold">${total.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
            </div>
          </div>

          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter an amount to see split preview"
              className="w-full bg-[#1A1A1A] text-white px-5 py-4 rounded-2xl border border-gray-800 focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-gray-600 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Stellar Info Card */}
      <div className="bg-[#141414] rounded-2xl p-4 border border-gray-800/50 flex items-start space-x-4">
        <div className="bg-red-500/10 p-1.5 rounded-full mt-0.5">
          <Info className="w-4 h-4 text-red-500" />
        </div>
        <p className="text-gray-300 text-xs leading-relaxed">
          <span className="font-bold text-white">Fast & Secure:</span> on Stellar network settle in 3-5 seconds with minimal fees.
        </p>
      </div>
    </div>
  )
}
