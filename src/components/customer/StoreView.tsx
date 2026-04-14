'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store'
import toast from 'react-hot-toast'
import type { Vendor, MenuItem } from '@/types'

interface Props { vendor: Vendor; menuItems: MenuItem[] }

export default function StoreView({ vendor, menuItems }: Props) {
  const router = useRouter()
  const { items, addItem, updateQty, itemCount, subtotal } = useCartStore()
  const [activeTab, setActiveTab] = useState('Popular')

  const categories = ['Popular', ...Array.from(new Set(menuItems.map(i => i.category)))]

  const displayed = activeTab === 'Popular'
    ? menuItems.slice(0, 6)
    : menuItems.filter(i => i.category === activeTab)

  function getQty(itemId: string) {
    return items.find(i => i.item.id === itemId)?.quantity ?? 0
  }

  function handleAdd(item: MenuItem) {
    const { vendor: cartVendor } = useCartStore.getState()
    if (cartVendor && cartVendor.id !== vendor.id) {
      toast('Starting new cart from this store', { icon: '🛒' })
    }
    addItem(item, vendor)
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Hero */}
      <div className="h-40 relative flex items-end p-3.5" style={{ background: 'linear-gradient(160deg, #1a1a2e, #16213e)' }}>
        <button onClick={() => router.back()} className="absolute top-3.5 left-3.5 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white text-base">←</button>
        <button className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white text-base">♡</button>
        {vendor.is_open
          ? <span className="text-[11px] font-medium text-white bg-[#FF385C] px-2.5 py-1 rounded-full">Open now</span>
          : <span className="text-[11px] font-medium text-white bg-gray-600 px-2.5 py-1 rounded-full">Closed</span>}
      </div>

      {/* Store info */}
      <div className="bg-white px-4 pt-3.5 pb-3 border-b border-gray-100">
        <div className="text-lg font-medium text-gray-900 mb-1.5">{vendor.name}</div>
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2.5">
          <span className="text-[#FF385C] font-medium">★ {vendor.rating.toFixed(1)}</span>
          <span>· {vendor.category}</span>
          <span>· 20–30 min</span>
        </div>
        <div className="flex justify-between items-center bg-gray-50 rounded-xl px-3 py-2.5">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">KES 80</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Delivery fee</div>
          </div>
          <div className="w-px h-7 bg-gray-200" />
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">20–30 min</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Est. time</div>
          </div>
          <div className="w-px h-7 bg-gray-200" />
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">KES {vendor.min_order}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Min. order</div>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="bg-white flex overflow-x-auto scrollbar-hide border-b border-gray-100 px-4 sticky top-0 z-10">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`py-3 px-3 text-xs font-medium whitespace-nowrap border-b-2 flex-shrink-0 transition-colors
              ${activeTab === cat ? 'text-[#FF385C] border-[#FF385C]' : 'text-gray-400 border-transparent'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu items */}
      <div className="px-4 pt-4 flex flex-col gap-2.5">
        {displayed.map(item => {
          const qty = getQty(item.id)
          return (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 flex gap-3 p-3">
              <div className="w-[76px] h-[76px] rounded-xl bg-orange-50 flex items-center justify-center text-3xl flex-shrink-0">
                🍔
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 mb-0.5">{item.name}</div>
                <div className="text-xs text-gray-400 mb-2 truncate">{item.description}</div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">KES {item.price.toLocaleString()}</span>
                  {qty === 0 ? (
                    <button
                      onClick={() => handleAdd(item)}
                      className="w-7 h-7 rounded-full bg-[#FF385C] text-white text-lg flex items-center justify-center"
                    >+</button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, qty - 1)} className="w-6 h-6 rounded-full border-2 border-[#FF385C] text-[#FF385C] text-sm flex items-center justify-center">−</button>
                      <span className="text-sm font-medium w-4 text-center">{qty}</span>
                      <button onClick={() => updateQty(item.id, qty + 1)} className="w-6 h-6 rounded-full border-2 border-[#FF385C] text-[#FF385C] text-sm flex items-center justify-center">+</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Cart bar */}
      {itemCount() > 0 && (
        <div
          onClick={() => router.push('/customer/cart')}
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-[#FF385C] px-4 py-3.5 flex justify-between items-center cursor-pointer z-20"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-white text-xs font-medium">
              {itemCount()}
            </div>
            <span className="text-sm font-medium text-white">View cart</span>
          </div>
          <span className="text-sm font-medium text-white">KES {subtotal().toLocaleString()}</span>
        </div>
      )}
    </div>
  )
}
