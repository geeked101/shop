'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { Vendor, Order, MenuItem } from '@/types'

type Tab = 'orders' | 'menu' | 'earnings'

interface Props { vendor: Vendor; orders: Order[]; menuItems: MenuItem[] }

export default function VendorDashboard({ vendor, orders: initialOrders, menuItems }: Props) {
  const [tab, setTab] = useState<Tab>('orders')
  const [orders, setOrders] = useState(initialOrders)
  const [isOpen, setIsOpen] = useState(vendor.is_open)
  const supabase = createClient()

  async function toggleStore() {
    const next = !isOpen
    setIsOpen(next)
    await supabase.from('vendors').update({ is_open: next }).eq('id', vendor.id)
    toast.success(next ? 'Store is now open' : 'Store is now closed')
  }

  async function updateOrderStatus(orderId: string, status: string) {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as Order['status'] } : o))
    toast.success('Order updated')
  }

  const newOrders = orders.filter(o => o.status === 'pending')
  const activeOrders = orders.filter(o => ['confirmed', 'preparing', 'ready', 'collecting', 'on_the_way'].includes(o.status))

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Topbar */}
      <div className="bg-[#1a1a2e] px-4 pt-4 pb-3">
        <div className="flex justify-between items-center mb-2.5">
          <div>
            <div className="text-base font-medium text-white">{vendor.name}</div>
            <div className="text-xs text-white/50 mt-0.5">{vendor.category} · {(vendor.zone as { name: string } | null)?.name}</div>
          </div>
          <button onClick={toggleStore} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${isOpen ? 'bg-[#f0fff4] border-green-400 text-green-600' : 'bg-white/10 border-white/20 text-white/60'}`}>
            <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-gray-400'}`} />
            {isOpen ? 'Open' : 'Closed'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#1a1a2e] flex border-b border-white/10 px-4">
        {(['orders', 'menu', 'earnings'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`py-2.5 px-3 text-xs font-medium capitalize border-b-2 ${tab === t ? 'text-[#FF385C] border-[#FF385C]' : 'text-white/40 border-transparent'}`}>
            {t}{t === 'orders' && newOrders.length > 0 && <span className="ml-1.5 bg-[#FF385C] text-white text-[9px] px-1.5 py-0.5 rounded-full">{newOrders.length}</span>}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4">
        {/* ORDERS */}
        {tab === 'orders' && (
          <div className="flex flex-col gap-3">
            {newOrders.length === 0 && activeOrders.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">No active orders right now</div>
            )}
            {[...newOrders, ...activeOrders].map(order => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex justify-between items-center px-3.5 py-2.5 border-b border-gray-100">
                  <div>
                    <div className="text-xs font-medium text-gray-900">#{order.id.slice(0,8).toUpperCase()}</div>
                    <div className="text-[11px] text-gray-400">{new Date(order.created_at).toLocaleTimeString()}</div>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${
                    order.status === 'pending' ? 'bg-[#fff0f2] text-[#FF385C]'
                    : order.status === 'preparing' ? 'bg-[#fff8e1] text-amber-600'
                    : 'bg-[#f0fff4] text-green-600'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="px-3.5 py-2.5 border-b border-gray-100">
                  <div className="text-xs text-gray-500 mb-1.5">
                    {(order as Order & { order_items: { name: string; quantity: number }[] }).order_items?.map((i: { name: string; quantity: number }) => `${i.quantity}× ${i.name}`).join(' · ')}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900">KES {order.total.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 px-3.5 py-2.5">
                  {order.status === 'pending' && <>
                    <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="flex-1 py-2 text-xs font-medium text-gray-500 bg-gray-100 rounded-lg">Decline</button>
                    <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="flex-2 flex-[2] py-2 text-xs font-medium text-white bg-[#FF385C] rounded-lg">Accept order</button>
                  </>}
                  {order.status === 'preparing' && (
                    <button onClick={() => updateOrderStatus(order.id, 'ready')} className="w-full py-2 text-xs font-medium text-white bg-green-500 rounded-lg">Mark as ready ✓</button>
                  )}
                  {['ready', 'collecting', 'on_the_way'].includes(order.status) && (
                    <div className="text-xs text-gray-400 text-center w-full py-1">Rider is collecting...</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MENU */}
        {tab === 'menu' && (
          <div className="flex flex-col gap-2.5">
            {menuItems.map(item => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 flex items-center gap-3 p-3">
                <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-xl flex-shrink-0">🍔</div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-gray-900">{item.name}</div>
                  <div className="text-xs text-gray-400">KES {item.price.toLocaleString()}</div>
                </div>
                <div className={`w-10 h-6 rounded-full relative cursor-pointer ${item.is_available ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${item.is_available ? 'left-5' : 'left-1'}`} />
                </div>
              </div>
            ))}
            <button className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3.5 text-sm font-medium text-gray-400">+ Add new item</button>
          </div>
        )}

        {/* EARNINGS */}
        {tab === 'earnings' && (
          <div>
            <div className="bg-[#FF385C] rounded-xl p-4 mb-4">
              <div className="text-xs text-white/80 mb-1">Available for payout</div>
              <div className="text-3xl font-medium text-white mb-3">KES 12,480</div>
              <button className="bg-white text-[#FF385C] text-xs font-medium px-4 py-2 rounded-xl">Withdraw to M-Pesa</button>
              <div className="text-[11px] text-white/70 mt-2">Next auto-payout: Friday 6:00 AM</div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[['Today', 'KES 8,560', '↑ 12%'], ['This week', 'KES 52,340', '↑ 8%'], ['Orders today', '14', '↑ 3 more'], ['Avg order', 'KES 611', '↓ 2%']].map(([label, val, change]) => (
                <div key={label} className="bg-white rounded-xl border border-gray-100 p-3.5">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{label}</div>
                  <div className="text-lg font-medium text-gray-900">{val}</div>
                  <div className={`text-[11px] mt-0.5 ${change?.startsWith('↑') ? 'text-green-500' : 'text-red-400'}`}>{change}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-[#1a1a2e] border-t border-white/10 flex py-2.5 pb-4">
        {[['📊','Dashboard'], ['💬','Inbox'], ['🏪','My Store'], ['👤','Profile']].map(([icon, label], i) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-lg">{icon}</span>
            <span className={`text-[10px] font-medium ${i === 0 ? 'text-[#FF385C]' : 'text-white/40'}`}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
