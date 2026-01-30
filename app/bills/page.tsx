'use client'

import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { UnpaidBillsSection } from '@/components/Bills/UnpaidBillsSection'
import PageHeader from '@/components/PageHeader'
import BillPaymentsStatsCards from './components/BillPaymentsStatsCards'

export default function Bills() {
  function handleAddBill() {
    // TODO: Open add-bill flow or modal
  }

  return (
    <div className="min-h-screen bg-[#010101]">
      <PageHeader
        title="Bill Payments"
        subtitle="Manage and track your recurring bills"
        ctaLabel="Add Bill"
        onCtaClick={handleAddBill}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <section className="mb-8">
          <BillPaymentsStatsCards />
        </section>

        {/* Unpaid Bills */}
        <div className="">
          <UnpaidBillsSection />
        </div>

        {/* Paid Bills */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Recent Payments</h2>
          <div className="space-y-4">
            <BillCard
              name="Electricity"
              amount={50}
              dueDate="2023-12-20"
              recurring={true}
              status="paid"
            />
            <BillCard
              name="Internet"
              amount={30}
              dueDate="2023-12-15"
              recurring={true}
              status="paid"
            />
          </div>
        </div>

        {/* Add Bill Form */}
        <div className="bg-[#0f0f0f] rounded-xl border border-white/5 p-8">
          <h2 className="text-xl font-bold text-white mb-6">Add New Bill</h2>
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Bill Name
              </label>
              <input
                type="text"
                placeholder="e.g., Electricity, School Fees, Rent"
                className="w-full px-4 py-3 border border-white/10 rounded-lg bg-[#1a1a1a] text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    placeholder="50.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-4 py-3 border border-white/10 rounded-lg bg-[#1a1a1a] text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-white/10 rounded-lg bg-[#1a1a1a] text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                id="recurring"
                className="w-5 h-5 text-red-600 border-gray-500 rounded focus:ring-red-500 bg-[#1a1a1a]"
                disabled
              />
              <label htmlFor="recurring" className="text-sm font-medium text-gray-400">
                Recurring bill (e.g., monthly)
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-500 transition"
              disabled
            >
              Add Bill
            </button>
          </form>
        </div>

        {/* Integration Note */}
        <div className="mt-6 bg-amber-950/30 border border-amber-800/50 rounded-lg p-4">
          <p className="text-sm text-amber-200">
            <strong>Integration Required:</strong> Connect to bill_payments smart contract to create bills, 
            mark as paid, and handle recurring bill generation. Integrate with payment processing for automated payments.
          </p>
        </div>
      </main>
    </div>
  )
}

function BillCard({ name, amount, dueDate, recurring, status }: { name: string, amount: number, dueDate: string, recurring: boolean, status: 'pending' | 'paid' }) {
  const isOverdue = status === 'pending' && new Date(dueDate) < new Date()

  return (
    <div className="bg-[#0f0f0f] rounded-xl border border-white/5 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            {recurring && (
              <span className="text-xs bg-blue-900/40 text-blue-300 px-2 py-1 rounded">Recurring</span>
            )}
            {isOverdue && (
              <span className="text-xs bg-red-900/40 text-red-400 px-2 py-1 rounded flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>Overdue</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Due: {dueDate}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white mb-2">${amount}</div>
          {status === 'paid' ? (
            <div className="flex items-center justify-end space-x-1 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Paid</span>
            </div>
          ) : (
            <button
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition text-sm font-semibold"
              disabled
            >
              Pay Now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

