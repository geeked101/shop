'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Order } from '@/types'

const STEPS = [
  { key: 'pending', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'on_the_way', label: 'On the way' },
  { key: 'delivered', label: 'Delivered' },
]

const STEP_INDEX: Record<string, number> = {
  pending: 0, confirmed: 1, preparing: 1,
  ready: 2, collecting: 2, on_the_way: 2, delivered: 3, cancelled: -1,
}

export default function TrackContent() {
  const params = useSearchParams()
  const router = useRouter()
  const orderId = params.get('id')
  const [order, setOrder] = useState<Order | null>(null)
  const [eta, setEta] = useState(15)
  const supabase = createClient()

  useEffect(() => {
    if (!orderId) return
    supabase
      .from('orders')
      .select('*, vendor:vendors(name,category), rider:riders(name,phone,plate,rating)')
      .eq('id', orderId)
      .single()
      .then(({ data }: { data: unknown }) => { if (data) setOrder(data as Order) })

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload: { new: Partial<Order> }) =>
          setOrder(prev => prev ? { ...prev, ...payload.new } as Order : prev)
      )
      .subscribe()

    const timer = setInterval(() => setEta(e => Math.max(1, e - 1)), 60000)
    return () => { supabase.removeChannel(channel); clearInterval(timer) }
  }, [orderId])

  if (!order) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-sm text-gray-400">Loading order...</div>
    </div>
  )

  const stepIdx = STEP_INDEX[order.status] ?? 0

  return (
    <div className="bg-gray-50 min-h-screen pb-6">
      <div className="bg-white px-4 py-3.5 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => router.push('/customer/home')} className="text-lg">←</button>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">Order tracking</div>
          <div className="text-xs text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</div>
        </div>
        <div className="w-6" />
      </div>

      <div className="h-52 bg-[#eef2e6] flex items-center justify-center relative">
        <div className="text-5xl">🗺️</div>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-2 flex items-center gap-2 text-xs font-medium text-gray-900 border border-gray-100">
          <span className="w-2 h-2 rounded-full bg-[#FF385C] animate-pulse" />
          Arriving in {eta} min
        </div>
      </div>

      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex items-center">
          {STEPS.map((step, i) => (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all
                  ${i < stepIdx ? 'bg-[#FF385C] border-[#FF385C] text-white'
                    : i === stepIdx ? 'border-[#FF385C] text-[#FF385C] bg-[#fff0f2]'
                    : 'border-gray-200 text-gray-400'}`}>
                  {i < stepIdx ? '✓' : i === stepIdx ? '🏍' : ''}
                </div>
                <div className={`text-[10px] mt-1 font-medium ${i <= stepIdx ? 'text-[#FF385C]' : 'text-gray-400'}`}>
                  {step.label}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < stepIdx ? 'bg-[#FF385C]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {order.rider && (
        <div className="mx-4 mt-3.5 bg-white rounded-xl border border-gray-100 p-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#FF385C] flex items-center justify-center text-white text-base font-medium flex-shrink-0">
              {order.rider.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{order.rider.name}</div>
              <div className="text-xs text-gray-400">Boda rider · {order.rider.plate}</div>
              <div className="text-xs text-gray-400 mt-0.5">★ {order.rider.rating.toFixed(1)}</div>
            </div>
            <div className="flex gap-2">
              <a href={`tel:+254${order.rider.phone}`} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-base border border-gray-200">📞</a>
              <button onClick={() => router.push('/customer/inbox')} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-base border border-gray-200">💬</button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-3.5 py-2 text-[11px] font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100">Order summary</div>
        <div className="flex justify-between items-center px-3.5 py-3">
          <span className="text-sm font-medium text-gray-900">Total paid</span>
          <span className="text-sm font-medium text-[#FF385C]">KES {order.total.toLocaleString()}</span>
        </div>
      </div>

      <div className="mx-4 mt-3 flex gap-2">
        <button onClick={() => router.push('/customer/inbox')} className="flex-1 bg-white border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-900">💬 Message rider</button>
        <button className="flex-1 bg-[#FF385C] rounded-xl py-3 text-sm font-medium text-white">📞 Call support</button>
      </div>
    </div>
  )
}
