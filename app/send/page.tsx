'use client'

import { useState } from 'react'
import EmergencyTransferModal from './components/EmergencyTransferModal'

import Link from 'next/link'
import { ArrowLeft, Send, AlertCircle } from 'lucide-react'
import SendHeader from './components/SendHeader'

export default function SendMoney() {
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <SendHeader />
    
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Send Money to Family</h2>
            <p className="text-gray-600">
              Send remittance via Stellar network. Funds will be automatically split according to your configuration.
            </p>
          </div>

          {/* Form Placeholder */}
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled
              />
              <p className="mt-2 text-sm text-gray-500">
                Stellar address of the recipient wallet
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="300.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled
              >
                <option>USDC (Stellar)</option>
                <option>XLM</option>
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Automatic Split</h3>
                  <p className="text-sm text-blue-700">
                    This remittance will be automatically allocated according to your split configuration:
                  </p>
                  <ul className="mt-2 text-sm text-blue-700 space-y-1">
                    <li>• 50% → Daily Spending</li>
                    <li>• 30% → Savings</li>
                    <li>• 15% → Bills</li>
                    <li>• 5% → Insurance</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                disabled
              >
                Preview Transaction
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center space-x-2"
                disabled
              >
                <Send className="w-5 h-5" />
                <span>Send Remittance</span>
              </button>
            </div>
          </form>
9
          {/* Emergency Mode */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Transfer</h3>
            <p className="text-gray-600 mb-4">
              Need to send money urgently? Use emergency mode for priority processing.
            </p>
            <button
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              onClick={() => setShowEmergencyModal(true)}
            >
              Emergency Transfer
            </button>
          </div>
        </div>

        {/* Integration Note */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Integration Required:</strong> Connect to Stellar SDK, implement wallet connection (Freighter or similar), 
            integrate with anchor platform for fiat on/off-ramps, and connect to smart contracts for automatic split execution.
          </p>
        </div>


        {/* emergency transfer modal */}
        <EmergencyTransferModal
  open={showEmergencyModal}
  onClose={() => setShowEmergencyModal(false)}
/>
      </main>
    </div>
  )
}

