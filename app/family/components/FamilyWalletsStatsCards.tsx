'use client'

import { Users, DollarSign, Activity } from 'lucide-react'

type FamilyStatsData = {
  familyMembers: number
  totalSpendingLimit: string
  spentThisMonth: string
  averageUtilization: string
}

const defaultStats: FamilyStatsData = {
  familyMembers: 4,
  totalSpendingLimit: '7,800',
  spentThisMonth: '1,670',
  averageUtilization: '21',
}

const iconWrapperClass =
  'flex items-center justify-center w-10 h-10 rounded-xl bg-[#1a1a1a] border border-red-500/30 text-red-500'

export default function FamilyWalletsStatsCards({
  stats = defaultStats,
}: {
  stats?: FamilyStatsData
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Family Members */}
      <div className="rounded-2xl bg-[#0f0f0f] p-5 sm:p-6 border border-white/5">
        <div className={`${iconWrapperClass} mb-3`}>
          <Users className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
        </div>
        <p className="text-sm text-gray-400 mb-1">Family Members</p>
        <p className="text-2xl sm:text-3xl font-bold text-white">
          {stats.familyMembers}
        </p>
        <p className="text-sm text-gray-400 mt-1">Active accounts</p>
      </div>

      {/* Total Spending Limit (highlighted) */}
      <div className="rounded-2xl bg-[#1a1515] p-5 sm:p-6 border border-red-500/20 shadow-[0_0_24px_rgba(239,68,68,0.15)]">
        <div className={`${iconWrapperClass} mb-3`}>
          <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
        </div>
        <p className="text-sm text-gray-400 mb-1">Total Spending Limit</p>
        <p className="text-2xl sm:text-3xl font-bold text-white">
          ${stats.totalSpendingLimit}
        </p>
        <p className="text-sm text-red-500 font-medium mt-1">
          ${stats.spentThisMonth} spent this month
        </p>
      </div>

      {/* Average Utilization */}
      <div className="rounded-2xl bg-[#0f0f0f] p-5 sm:p-6 border border-white/5">
        <div className={`${iconWrapperClass} mb-3`}>
          <Activity className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
        </div>
        <p className="text-sm text-gray-400 mb-1">Average Utilization</p>
        <p className="text-2xl sm:text-3xl font-bold text-white">
          {stats.averageUtilization}%
        </p>
        <p className="text-sm text-gray-400 mt-1">Of total limits</p>
      </div>
    </div>
  )
}
