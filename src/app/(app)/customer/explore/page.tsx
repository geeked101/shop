'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Vendor } from '@/types'

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🏪' },
  { id: 'restaurant', label: 'Food', icon: '🍔' },
  { id: 'pharmacy', label: 'Pharmacy', icon: '💊' },
  { id: 'grocery', label: 'Grocery', icon: '🛒' },
  { id: 'shop', label: 'Shops', icon: '🏬' },
  { id: 'open', label: 'Open now', icon: '🟢' },
]

const ZONES = ['Westlands','CBD','Roysambu','Kilimani','Lavington','South B','South C','Mutomo','Parklands','Kasarani','Eastleigh','Ngong Rd']

const CAT_COLORS: Record<string, string> = {
  restaurant: '#fff3e0', pharmacy: '#e3f2fd', grocery: '#e8f5e9', shop: '#f3e5f5'
}
const CAT_ICONS: Record<string, string> = {
  restaurant: '🍔', pharmacy: '💊', grocery: '🛒', shop: '🏬'
}

export default function ExplorePage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedZones, setSelectedZones] = useState<string[]>(['Westlands','CBD'])
  const [showZoneSheet, setShowZoneSheet] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      let q = supabase.from('vendors').select('*, zone:zones(name)').eq('status', 'active')
      if (activeCategory !== 'all' && activeCategory !== 'open') q = q.eq('category', activeCategory)
      if (activeCategory === 'open') q = q.eq('is_open', true)
      const { data } = await q.order('rating', { ascending: false })
      setVendors(data ?? [])
    }
    load()
  }, [activeCategory])

  const filtered = vendors.filter(v => {
    if (query) return v.name.toLowerCase().includes(query.toLowerCase()) || v.category.includes(query.toLowerCase())
    return true
  })

  function toggleZone(z: string) {
    setSelectedZones(prev => prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z])
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Topbar */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 sticky top-0 z-10">
        <div className="text-xl font-medium text-gray-900 mb-3">Explore</div>
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.5">
            <span className="text-gray-400">⌕</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search stores, food, meds..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
            />
            {query && <button onClick={() => setQuery('')} className="text-gray-400 text-sm">✕</button>}
          </div>
          <button
            onClick={() => setShowZoneSheet(true)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-base border
              ${selectedZones.length > 0 ? 'bg-[#FF385C] border-[#FF385C] text-white' : 'bg-white border-gray-200 text-gray-700'}`}
          >⊞</button>
        </div>
      </div>

      {/* Category chips */}
      <div className="bg-white flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide border-b border-gray-100">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap flex-shrink-0
              ${activeCategory === cat.id ? 'bg-[#FF385C] border-[#FF385C] text-white' : 'bg-white border-gray-200 text-gray-500'}`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4">
        {/* Category cards (shown when no search) */}
        {!query && activeCategory === 'all' && (
          <div className="mb-5">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Categories</div>
            <div className="grid grid-cols-3 gap-2.5">
              {['restaurant','pharmacy','grocery','shop','restaurant','grocery'].map((cat, i) => (
                <button key={i} onClick={() => setActiveCategory(cat)}
                  className="rounded-xl p-4 flex flex-col items-center gap-2 border border-gray-100"
                  style={{ background: CAT_COLORS[cat] }}>
                  <span className="text-2xl">{CAT_ICONS[cat]}</span>
                  <span className="text-xs font-medium text-gray-700 capitalize">{cat === 'restaurant' && i === 4 ? 'Bakery' : cat}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search results or filtered list */}
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          {query ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${query}"` : 'Nearby stores'}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-sm font-medium text-gray-900 mb-1">No results found</div>
            <div className="text-xs text-gray-400">Try a different search or browse categories</div>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {filtered.map(vendor => (
            <button
              key={vendor.id}
              onClick={() => router.push(`/customer/store?id=${vendor.id}`)}
              className="bg-white rounded-xl border border-gray-100 flex items-center gap-3 p-3 text-left"
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: CAT_COLORS[vendor.category] ?? '#f5f5f5' }}>
                {CAT_ICONS[vendor.category] ?? '🏪'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 mb-0.5">{vendor.name}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                  <span className="text-[#FF385C] font-medium">★ {vendor.rating.toFixed(1)}</span>
                  <span>· {(vendor.zone as { name: string } | null)?.name ?? 'Nairobi'}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${vendor.is_open ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {vendor.is_open ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-medium text-gray-900">20–35 min</div>
                <div className="text-[11px] text-gray-400 mt-0.5">KES 80 fee</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Zone filter sheet */}
      {showZoneSheet && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowZoneSheet(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-[390px] p-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="text-base font-medium text-gray-900 mb-4">Filter by zone</div>
            <div className="flex flex-wrap gap-2 mb-5">
              {ZONES.map(z => (
                <button key={z} onClick={() => toggleZone(z)}
                  className={`px-3.5 py-1.5 rounded-full border text-xs font-medium
                    ${selectedZones.includes(z) ? 'bg-[#FF385C] border-[#FF385C] text-white' : 'border-gray-200 text-gray-500'}`}>
                  {z}
                </button>
              ))}
            </div>
            <button onClick={() => setShowZoneSheet(false)} className="w-full bg-[#FF385C] text-white rounded-xl py-3.5 text-sm font-medium">
              Apply filters
            </button>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-gray-100 flex py-2.5 pb-4">
        {[['🏠','Home','/customer/home'],['🔍','Explore',''],['🛍','Orders','/customer/orders'],['💬','Inbox','/customer/inbox'],['👤','Profile','/customer/profile']].map(([icon,label,href]) => (
          <button key={label} onClick={() => href && router.push(href)} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xl">{icon}</span>
            <span className={`text-[10px] font-medium ${label === 'Explore' ? 'text-[#FF385C]' : 'text-gray-400'}`}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
