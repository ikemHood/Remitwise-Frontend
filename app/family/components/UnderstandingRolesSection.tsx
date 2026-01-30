'use client'

import { Send, Wallet, Crown } from 'lucide-react'

const roles = [
  {
    icon: Send,
    name: 'Sender',
    description:
      'Can initiate and send remittances to family members',
  },
  {
    icon: Wallet,
    name: 'Recipient',
    description:
      'Can receive remittances within their spending limit',
  },
  {
    icon: Crown,
    name: 'Admin',
    description:
      'Full access to manage all members and settings',
  },
]

const iconBoxClass =
  'flex items-center justify-center w-10 h-10 rounded-xl bg-[#1a1a1a] border border-orange-500/50 text-orange-500 flex-shrink-0'

export default function UnderstandingRolesSection() {
  return (
    <section className="rounded-2xl bg-[#0f0f0f] border border-white/5 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-white">Understanding Roles</h2>
      <p className="text-sm text-gray-400 mt-1 mb-6">
        Different permissions for different family members.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {roles.map(({ icon: Icon, name, description }) => (
          <div key={name} className="flex gap-4">
            <div className={iconBoxClass}>
              <Icon className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-bold text-orange-500">{name}</h3>
              <p className="text-sm text-gray-400 mt-1">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
