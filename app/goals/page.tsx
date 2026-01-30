'use client'

import { Target, Calendar } from 'lucide-react'
import PageHeader from '@/components/PageHeader'

export default function SavingsGoals() {
  function handleNewGoal() {
    // TODO: Open create-goal flow or modal
  }

  return (
    <div className="min-h-screen bg-[#010101]">
      <PageHeader
        title="Savings Goals"
        subtitle="Track and achieve your financial dreams"
        ctaLabel="New Goal"
        onCtaClick={handleNewGoal}
        showBottomDivider
        ctaVariant="redOrange"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GoalCard
            name="Education Fund"
            current={360}
            target={1000}
            deadline="2025-12-31"
            description="Saving for children's education"
          />
          <GoalCard
            name="Medical Emergency"
            current={180}
            target={500}
            deadline="2024-06-30"
            description="Emergency medical fund"
          />
          <GoalCard
            name="Marriage Fund"
            current={0}
            target={2000}
            deadline="2026-12-31"
            description="Wedding expenses"
          />
        </div>

        {/* Create Goal Form Placeholder */}
        <div className="mt-8 bg-[#0f0f0f] rounded-xl border border-white/5 p-8">
          <h2 className="text-xl font-bold text-white mb-6">Create New Savings Goal</h2>
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Goal Name
              </label>
              <input
                type="text"
                placeholder="e.g., Education, Medical, Marriage"
                className="w-full px-4 py-3 border border-white/10 rounded-lg bg-[#1a1a1a] text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Target Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    placeholder="1000.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-4 py-3 border border-white/10 rounded-lg bg-[#1a1a1a] text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Target Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-white/10 rounded-lg bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-500 transition"
              disabled
            >
              Create Goal
            </button>
          </form>
        </div>

        {/* Integration Note */}
        <div className="mt-6 bg-amber-950/30 border border-amber-800/50 rounded-lg p-4">
          <p className="text-sm text-amber-200">
            <strong>Integration Required:</strong> Connect to savings_goals smart contract to create goals, 
            add funds, and track progress. Display visual progress bars and completion status.
          </p>
        </div>
      </main>
    </div>
  )
}

function GoalCard({ name, current, target, deadline, description }: { name: string, current: number, target: number, deadline: string, description: string }) {
  const percentage = Math.min((current / target) * 100, 100)
  const remaining = target - current

  return (
    <div className="bg-[#0f0f0f] rounded-xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-white">{name}</h3>
        </div>
        <span className="text-sm text-gray-400">{percentage.toFixed(0)}%</span>
      </div>

      <p className="text-sm text-gray-400 mb-4">{description}</p>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progress</span>
          <span className="font-semibold text-white">${current} / ${target}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3">
          <div className="bg-orange-500 h-3 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2 text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{deadline}</span>
        </div>
        <div className="text-white font-semibold">
          ${remaining} remaining
        </div>
      </div>
    </div>
  )
}

