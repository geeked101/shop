'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { User, Vendor, Zone } from '@/types'

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🏪' },
  { id: 'restaurant', label: 'Food', icon: '🍔' },
  { id: 'pharmacy', label: 'Pharmacy', icon: '💊' },
  { id: 'grocery', label: 'Grocery', icon: '🛒' },
  { id: 'shop', label: 'Shops', icon: '🏬' },
]

interface Props {
  user: User | null
  vendors: Vendor[]
  zones: Zone[]
}

export default function CustomerHome({ user, vendors }: Props) {
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = activeCategory === 'all'
    ? vendors
    : vendors.filter(v => v.category === activeCategory)

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'PL'

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white px-5 pt-4 pb-3 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-xl font-medium tracking-tight">
              sh<span className="text-[#FF385C]">o</span>p
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-3 h-3 bg-[#FF385C] rounded-full rounded-bl-none rotate-[-45deg]" />
              <span className="text-xs text-gray-500">
                Deliver to <strong className="text-gray-800 font-medium">Westlands, Nairobi</strong>
              </span>
            </div>
          </div>
          <Link href="/customer/profile">
            <div className="w-9 h-9 rounded-full bg-[#FF385C] flex items-center justify-center text-white text-xs font-medium">
              {initials}
            </div>
          </Link>
        </div>
        <Link href="/customer/explore">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-400">
            <span>⌕</span>
            <span>Search for food, stores, meds...</span>
          </div>
        </Link>
      </div>

      {/* Promo */}
      <div className="mx-4 mt-4 bg-[#FF385C] rounded-xl p-4 flex justify-between items-center">
        <div>
          <div className="text-sm font-medium text-white mb-0.5">Free delivery today</div>
          <div className="text-xs text-white/80">On your first 3 orders</div>
        </div>
        <button className="bg-white text-[#FF385C] text-xs font-medium px-3 py-1.5 rounded-full">
          Order now
        </button>
      </div>

      {/* Categories */}
      <div className="mt-5 px-4">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Browse</div>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div className={`w-13 h-13 rounded-2xl flex items-center justify-center text-xl border
                ${activeCategory === cat.id
                  ? 'bg-[#FF385C] border-[#FF385C]'
                  : 'bg-white border-gray-100'}`}
                style={{ width: 52, height: 52 }}
              >
                {cat.icon}
              </div>
              <span className={`text-[11px] font-medium ${activeCategory === cat.id ? 'text-[#FF385C]' : 'text-gray-500'}`}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stores */}
      <div className="mt-5 px-4">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          {filtered.length} stores near you
        </div>
        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">No stores in this category yet</div>
          )}
          {filtered.map(vendor => (
            <Link key={vendor.id} href={`/customer/store?id=${vendor.id}`}>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="h-28 flex items-end p-2.5" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
                  <div className="flex gap-1.5">
                    <span className="text-[10px] font-medium text-white bg-black/60 px-2 py-1 rounded-full">
                      20–35 min
                    </span>
                    <span className="text-[10px] font-medium text-white bg-black/60 px-2 py-1 rounded-full">
                      KES 80 delivery
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium text-gray-900 mb-1">{vendor.name}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-[#FF385C] font-medium">★ {vendor.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">· {vendor.category}</span>
                    {vendor.zone && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {vendor.zone.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
