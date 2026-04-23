'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

type Tab = 'all' | 'active' | 'delivered' | 'cancelled'

interface Order {
  id: string
  status: string
  total: number
  created_at: string
  vendor: { name: string; category: string } | null
  order_items: { name: string; quantity: number }[]
  rating: number | null
}

const STATUS_STYLE: Record<string, string> = {
  delivered: 'bg-green-50 text-green-600',
  cancelled: 'bg-[#fff0f2] text-[#FF385C]',
  pending: 'bg-amber-50 text-amber-600',
  on_the_way: 'bg-blue-50 text-blue-600',
  preparing: 'bg-amber-50 text-amber-600',
}

const CAT_ICONS: Record<string, string> = {
  restaurant: '☕', pharmacy: '💊', grocery: '🛒', shop: '🏪'
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [tab, setTab] = useState<Tab>('all')
  const [loading, setLoading] = useState(true)
  const [receipt, setReceipt] = useState<Order | null>(null)
  const [starRating, setStarRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('orders')
        .select('*, vendor:vendors(name,category), order_items(name,quantity)')
        .order('created_at', { ascending: false })
      setOrders((data ?? []) as Order[])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = tab === 'all' ? orders : orders.filter(o => {
    if (tab === 'active') return !['delivered','cancelled'].includes(o.status)
    return o.status === tab
  })

  async function submitRating(orderId: string) {
    if (!starRating) { toast.error('Select a star rating'); return }
    await supabase.from('orders').update({ rating: starRating, review: reviewText }).eq('id', orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, rating: starRating } : o))
    setReceipt(null)
    toast.success('Review submitted! ⭐')
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Topbar */}
      <div className="bg-white px-4 pt-4 pb-0 border-b border-gray-100 sticky top-0 z-10">
        <div className="text-xl font-medium text-gray-900 mb-3">My Orders</div>
        <div className="flex">
          {(['all','active','delivered','cancelled'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-medium capitalize border-b-2
                ${tab === t ? 'text-[#FF385C] border-[#FF385C]' : 'text-gray-400 border-transparent'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">
        {loading && <div className="text-center py-10 text-sm text-gray-400">Loading orders...</div>}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🛍</div>
            <div className="text-sm font-medium text-gray-900">No orders here</div>
            <div className="text-xs text-gray-400 mt-1">Your orders will appear here</div>
          </div>
        )}

        {filtered.map(order => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden" onClick={() => setReceipt(order)}>
            <div className="flex items-center gap-3 px-3.5 py-3 border-b border-gray-100">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: order.vendor?.category ? '#fff3e0' : '#f5f5f5' }}>
                {CAT_ICONS[order.vendor?.category ?? ''] ?? '🏪'}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{order.vendor?.name ?? 'Store'}</div>
                <div className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
              </div>
              <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
                {order.status === 'delivered' ? 'Delivered ✓' : order.status === 'on_the_way' ? 'On the way' : order.status}
              </span>
            </div>

            <div className="flex gap-1.5 px-3.5 py-2.5 border-b border-gray-100 flex-wrap">
              {order.order_items.slice(0, 2).map((item, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{item.name}</span>
              ))}
              {order.order_items.length > 2 && <span className="text-xs text-gray-400">+{order.order_items.length - 2} more</span>}
            </div>

            <div className="flex justify-between items-center px-3.5 py-3">
              <div>
                <div className="text-sm font-medium text-gray-900">KES {order.total.toLocaleString()}</div>
                <div className="text-[11px] text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</div>
              </div>
              <div className="flex gap-2 items-center">
                {order.status === 'delivered' && !order.rating && (
                  <button onClick={e => { e.stopPropagation(); setReceipt(order); setStarRating(0) }}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-medium border border-gray-200">
                    Rate ★
                  </button>
                )}
                {order.rating && (
                  <div className="flex">
                    {[1,2,3,4,5].map(s => <span key={s} className={`text-xs ${s <= order.rating! ? 'text-[#FF385C]' : 'text-gray-200'}`}>★</span>)}
                  </div>
                )}
                {order.status !== 'cancelled' && (
                  <button
                    onClick={e => { e.stopPropagation(); toast.success(`Reordering from ${order.vendor?.name}...`) }}
                    className="text-xs bg-[#FF385C] text-white px-3 py-1.5 rounded-full font-medium">
                    Reorder
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Receipt / Rating sheet */}
      {receipt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setReceipt(null)}>
          <div className="bg-white rounded-t-3xl w-full max-w-[390px] max-h-[80vh] overflow-y-auto p-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="text-base font-medium text-gray-900 mb-0.5">{receipt.vendor?.name}</div>
            <div className="text-xs text-gray-400 mb-4">#{receipt.id.slice(0,8).toUpperCase()} · {new Date(receipt.created_at).toLocaleDateString()}</div>

            {receipt.order_items.map((item, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-500">{item.quantity}× {item.name}</span>
                <span className="font-medium text-gray-900">—</span>
              </div>
            ))}
            <div className="flex justify-between py-2 border-b border-gray-100 text-sm"><span className="text-gray-400">Delivery + service</span><span className="font-medium">KES 110</span></div>
            <div className="flex justify-between py-3 text-sm font-medium"><span>Total paid</span><span className="text-[#FF385C]">KES {receipt.total.toLocaleString()}</span></div>

            {receipt.status === 'delivered' && !receipt.rating && (
              <div className="mt-2 border-t border-gray-100 pt-4">
                <div className="text-sm font-medium text-gray-900 mb-3">Rate your experience</div>
                <div className="flex gap-2 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setStarRating(s)} className={`text-3xl ${s <= starRating ? 'text-[#FF385C]' : 'text-gray-200'}`}>★</button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Tell us about your order..."
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-gray-900 outline-none resize-none mb-3"
                  rows={3}
                />
                <button onClick={() => submitRating(receipt.id)} className="w-full bg-[#FF385C] text-white rounded-xl py-3.5 text-sm font-medium">Submit review</button>
              </div>
            )}
            <button onClick={() => setReceipt(null)} className="w-full mt-2 bg-gray-100 text-gray-700 rounded-xl py-3 text-sm font-medium">Close</button>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-gray-100 flex py-2.5 pb-4">
        {[['🏠','Home','/customer/home'],['🔍','Explore','/customer/explore'],['🛍','Orders',''],['💬','Inbox','/customer/inbox'],['👤','Profile','/customer/profile']].map(([icon,label,href]) => (
          <button key={label} onClick={() => href && router.push(href)} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xl">{icon}</span>
            <span className={`text-[10px] font-medium ${label === 'Orders' ? 'text-[#FF385C]' : 'text-gray-400'}`}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
