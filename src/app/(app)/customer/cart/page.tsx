'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store'
import toast from 'react-hot-toast'
import { calculateFare } from '@/types'

const DELIVERY_FEE = 80
const SERVICE_FEE = 30

export default function CartPage() {
  const router = useRouter()
  const { items, vendor, updateQty, clearCart, paymentMethod, setPaymentMethod, note, setNote } = useCartStore()
  const subtotal = useCartStore(s => s.subtotal())
  const total = subtotal + DELIVERY_FEE + SERVICE_FEE

  const [phone, setPhone] = useState('0712 *** 456')
  const [loading, setLoading] = useState(false)
  const [showMpesa, setShowMpesa] = useState(false)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="text-5xl">🛒</div>
        <div className="text-base font-medium text-gray-900">Your cart is empty</div>
        <button onClick={() => router.back()} className="text-sm text-[#FF385C]">Browse stores →</button>
      </div>
    )
  }

  async function placeOrder() {
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, vendorId: vendor?.id, subtotal, deliveryFee: DELIVERY_FEE, serviceFee: SERVICE_FEE, total, paymentMethod, note }),
      })
      const { orderId, error } = await res.json()
      if (error) throw new Error(error)

      if (paymentMethod === 'mpesa') {
        const stkRes = await fetch('/api/mpesa/stk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, phone: phone.replace(/\s/g, ''), amount: total }),
        })
        const stkData = await stkRes.json()
        if (stkData.error) throw new Error(stkData.error)
        setShowMpesa(false)
        toast.success('Check your phone for M-Pesa prompt!')
      } else {
        toast.success('Order placed!')
      }

      clearCart()
      router.push(`/customer/track?id=${orderId}`)
    } catch (err) {
      toast.error(String(err))
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-4">
      {/* Topbar */}
      <div className="bg-white px-4 py-3.5 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-lg text-gray-900">←</button>
        <span className="text-base font-medium text-gray-900">Your cart</span>
      </div>

      {/* Cart items */}
      <div className="mx-4 mt-3.5 bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-3.5 py-2.5 text-[11px] font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100">
          {vendor?.name} · {items.reduce((s, i) => s + i.quantity, 0)} items
        </div>
        {items.map(({ item, quantity }) => (
          <div key={item.id} className="flex items-center gap-3 px-3.5 py-3 border-b border-gray-100 last:border-b-0">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl flex-shrink-0">🍔</div>
            <div className="flex-1">
              <div className="text-[13px] font-medium text-gray-900">{item.name}</div>
              <div className="text-xs text-gray-400">KES {item.price.toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQty(item.id, quantity - 1)} className="w-6 h-6 rounded-full border-[1.5px] border-[#FF385C] text-[#FF385C] text-xs flex items-center justify-center">−</button>
              <span className="text-xs font-medium w-4 text-center text-gray-900">{quantity}</span>
              <button onClick={() => updateQty(item.id, quantity + 1)} className="w-6 h-6 rounded-full border-[1.5px] border-[#FF385C] text-[#FF385C] text-xs flex items-center justify-center">+</button>
            </div>
          </div>
        ))}
      </div>

      {/* Address */}
      <div className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-3.5 py-2 text-[11px] font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100">Delivery address</div>
        <div className="flex items-center gap-3 px-3.5 py-3">
          <div className="w-8 h-8 rounded-full bg-[#fff0f2] flex items-center justify-center text-sm">📍</div>
          <div className="flex-1">
            <div className="text-[13px] font-medium text-gray-900">Westlands, Nairobi</div>
            <div className="text-xs text-gray-400">Ring Rd Westlands, near Sarit Centre</div>
          </div>
          <span className="text-xs text-[#FF385C] font-medium">Change</span>
        </div>
      </div>

      {/* Order summary */}
      <div className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-3.5 py-2 text-[11px] font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100">Order summary</div>
        {[
          { label: 'Subtotal', val: `KES ${subtotal.toLocaleString()}` },
          { label: 'Delivery fee', val: `KES ${DELIVERY_FEE}` },
          { label: 'Service fee', val: `KES ${SERVICE_FEE}` },
        ].map(row => (
          <div key={row.label} className="flex justify-between px-3.5 py-2.5 border-b border-gray-100">
            <span className="text-[13px] text-gray-500">{row.label}</span>
            <span className="text-[13px] font-medium text-gray-900">{row.val}</span>
          </div>
        ))}
        <div className="flex justify-between px-3.5 py-3">
          <span className="text-sm font-medium text-gray-900">Total</span>
          <span className="text-base font-medium text-[#FF385C]">KES {total.toLocaleString()}</span>
        </div>
      </div>

      {/* Payment method */}
      <div className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-3.5 py-2 text-[11px] font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100">Payment method</div>
        {[
          { id: 'mpesa' as const, icon: '💚', label: 'M-Pesa', sub: `+254 ${phone}` },
          { id: 'cash' as const, icon: '💵', label: 'Cash on delivery', sub: 'Pay rider directly' },
        ].map(opt => (
          <div key={opt.id} onClick={() => setPaymentMethod(opt.id)} className="flex items-center gap-3 px-3.5 py-3 border-b border-gray-100 last:border-b-0 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">{opt.icon}</div>
            <div className="flex-1">
              <div className="text-[13px] font-medium text-gray-900">{opt.label}</div>
              <div className="text-xs text-gray-400">{opt.sub}</div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === opt.id ? 'border-[#FF385C]' : 'border-gray-300'}`}>
              {paymentMethod === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[#FF385C]" />}
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      <div className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-3.5 py-2 text-[11px] font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100">Note to restaurant</div>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. No onions, extra sauce..." className="w-full px-3.5 py-3 text-[13px] text-gray-900 outline-none resize-none bg-transparent" rows={2} />
      </div>

      {/* CTA */}
      <div className="px-4 mt-4">
        <button
          onClick={() => paymentMethod === 'mpesa' ? setShowMpesa(true) : placeOrder()}
          className="w-full bg-[#FF385C] rounded-xl py-4 flex justify-between items-center px-4"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-white bg-white/25 px-2 py-0.5 rounded-full">📱</span>
            <span className="text-sm font-medium text-white">
              {paymentMethod === 'mpesa' ? 'Pay with M-Pesa' : 'Place order'}
            </span>
          </div>
          <span className="text-sm font-medium text-white">KES {total.toLocaleString()}</span>
        </button>
      </div>

      {/* M-Pesa sheet */}
      {showMpesa && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowMpesa(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-[390px] p-5 pb-9" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <div className="w-14 h-14 rounded-2xl bg-[#00a651] flex items-center justify-center text-white text-xs font-medium mx-auto mb-3">M-PESA</div>
            <h2 className="text-lg font-medium text-center text-gray-900 mb-1.5">M-Pesa STK Push</h2>
            <p className="text-sm text-gray-500 text-center mb-4 leading-relaxed">A payment request will be sent to your phone. Enter your M-Pesa PIN to confirm.</p>
            <div className="bg-gray-50 rounded-xl p-3.5 text-center mb-3.5">
              <div className="text-xs text-gray-400 mb-1">Amount to pay</div>
              <div className="text-2xl font-medium text-gray-900">KES {total.toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3.5 py-3 mb-4 border border-gray-200">
              <span className="text-lg">🇰🇪</span>
              <span className="text-sm font-medium text-gray-900">+254</span>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="flex-1 bg-transparent outline-none text-sm text-gray-900" placeholder="712 000 000" />
            </div>
            <button onClick={placeOrder} disabled={loading} className="w-full bg-[#00a651] text-white rounded-xl py-3.5 text-sm font-medium disabled:opacity-60 mb-2.5">
              {loading ? 'Processing...' : 'Send payment request'}
            </button>
            <button onClick={() => setShowMpesa(false)} className="w-full text-sm text-gray-400 py-2">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
