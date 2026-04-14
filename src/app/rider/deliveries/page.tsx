'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { riderEarnings } from '@/lib/distance'
import toast from 'react-hot-toast'

type DeliveryStep = 'idle' | 'request' | 'accepted' | 'pickup' | 'delivering' | 'done'

interface DeliveryRequest {
  orderId: string
  store: string
  storeAddress: string
  customer: string
  customerAddress: string
  items: string[]
  distanceKm: number
  earnings: number
  estimatedMins: number
}

const MOCK_REQUEST: DeliveryRequest = {
  orderId: 'SHP-00489',
  store: 'Java House Westlands',
  storeAddress: 'Ring Rd Westlands · 1.2km from you',
  customer: 'Pluto Kariuki',
  customerAddress: 'Sarit Centre area · 2.4km from pickup',
  items: ['Beef Burger', 'Java Latte', 'Cheese Fries'],
  distanceKm: 3.6,
  earnings: riderEarnings(3.6),
  estimatedMins: 18,
}

export default function RiderDeliveriesPage() {
  const [isOnline, setIsOnline] = useState(false)
  const [step, setStep] = useState<DeliveryStep>('idle')
  const [countdown, setCountdown] = useState(30)
  const [elapsedSecs, setElapsedSecs] = useState(0)
  const [tripsToday, setTripsToday] = useState(7)
  const [earningsToday, setEarningsToday] = useState(1540)
  const router = useRouter()

  // Countdown timer when request is live
  useEffect(() => {
    if (step !== 'request') return
    if (countdown <= 0) { setStep('idle'); toast('Request expired'); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [step, countdown])

  // Simulate incoming request after going online
  useEffect(() => {
    if (!isOnline) return
    const t = setTimeout(() => { setStep('request'); setCountdown(30) }, 2000)
    return () => clearTimeout(t)
  }, [isOnline])

  // Call timer when delivering
  useEffect(() => {
    if (!['accepted','pickup','delivering'].includes(step)) return
    const t = setInterval(() => setElapsedSecs(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [step])

  function formatTime(s: number) {
    return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`
  }

  function acceptDelivery() {
    setStep('accepted')
    toast.success('Delivery accepted!')
  }

  function declineDelivery() {
    setStep('idle')
    setCountdown(30)
  }

  function confirmPickup() {
    setStep('delivering')
    toast('Order picked up! Head to customer 🏍')
  }

  function confirmDelivery() {
    setStep('done')
    setTripsToday(t => t + 1)
    setEarningsToday(e => e + MOCK_REQUEST.earnings)
    toast.success(`Delivery complete! +KES ${MOCK_REQUEST.earnings} earned 🎉`)
    setTimeout(() => {
      setStep('idle')
      setElapsedSecs(0)
    }, 3000)
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Topbar */}
      <div className="bg-[#1a1a2e] px-4 pt-4 pb-3">
        <div className="flex justify-between items-center mb-1">
          <div>
            <div className="text-base font-medium text-white">James Mwangi</div>
            <div className="text-xs text-white/50">Boda rider · Westlands zone</div>
          </div>
          <button
            onClick={() => { setIsOnline(o => !o); if (isOnline) setStep('idle') }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium
              ${isOnline ? 'bg-green-50 border-green-400 text-green-600' : 'bg-white/10 border-white/20 text-white/60'}`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            {isOnline ? 'Online' : 'Go Online'}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-[#1a1a2e] grid grid-cols-4 border-t border-white/10">
        {[
          { val: tripsToday.toString(), label: 'Trips today' },
          { val: `KES ${earningsToday.toLocaleString()}`, label: 'Earned today' },
          { val: '4.9 ★', label: 'Rating' },
          { val: '2.1km', label: 'From you' },
        ].map(({ val, label }) => (
          <div key={label} className="flex flex-col items-center py-3 border-r border-white/10 last:border-r-0">
            <div className="text-xs font-medium text-white">{val}</div>
            <div className="text-[10px] text-white/40 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Map placeholder */}
      <div className="h-44 bg-[#eef2e6] flex items-center justify-center relative">
        <div className="text-5xl">🗺</div>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-2 text-xs font-medium text-gray-900 border border-gray-100 whitespace-nowrap">
          📍 You are in Westlands · {isOnline ? '2 active requests nearby' : 'Go online to see requests'}
        </div>
      </div>

      <div className="px-4 pt-4">

        {/* Offline state */}
        {!isOnline && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
            <div className="text-4xl mb-3">😴</div>
            <div className="text-sm font-medium text-gray-900 mb-1">You&apos;re offline</div>
            <div className="text-xs text-gray-400 mb-4">Toggle online to start receiving delivery requests</div>
            <button onClick={() => setIsOnline(true)} className="bg-[#FF385C] text-white px-6 py-2.5 rounded-xl text-sm font-medium">Go online</button>
          </div>
        )}

        {/* Waiting */}
        {isOnline && step === 'idle' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center animate-pulse">
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-sm font-medium text-gray-900">Looking for deliveries near you...</div>
            <div className="text-xs text-gray-400 mt-1">Westlands · CBD zones</div>
          </div>
        )}

        {/* Delivery request */}
        {step === 'request' && (
          <div className="bg-white rounded-xl border-2 border-[#FF385C] overflow-hidden" style={{ animation: 'pulse 2s infinite' }}>
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">🔔 New delivery request</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#FF385C]">{countdown}s</span>
                <div className="w-8 h-8 rounded-full border-2 border-[#FF385C] flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-[#FF385C] opacity-70" />
                </div>
              </div>
            </div>
            <div className="px-4 py-3">
              {/* Route */}
              <div className="flex gap-3 mb-3">
                <div className="flex flex-col items-center pt-1 flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF385C]" />
                </div>
                <div className="flex flex-col gap-3 flex-1">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{MOCK_REQUEST.store}</div>
                    <div className="text-xs text-gray-400">{MOCK_REQUEST.storeAddress}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{MOCK_REQUEST.customer}</div>
                    <div className="text-xs text-gray-400">{MOCK_REQUEST.customerAddress}</div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="flex gap-1.5 flex-wrap mb-3">
                {MOCK_REQUEST.items.map(item => (
                  <span key={item} className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{item}</span>
                ))}
              </div>

              {/* Fare breakdown */}
              <div className="flex justify-between bg-gray-50 rounded-xl px-3 py-2.5 mb-3">
                <div className="text-center"><div className="text-sm font-medium text-gray-900">KES {MOCK_REQUEST.earnings}</div><div className="text-[10px] text-gray-400">Your earnings</div></div>
                <div className="w-px bg-gray-200" />
                <div className="text-center"><div className="text-sm font-medium text-gray-900">{MOCK_REQUEST.distanceKm}km</div><div className="text-[10px] text-gray-400">Total distance</div></div>
                <div className="w-px bg-gray-200" />
                <div className="text-center"><div className="text-sm font-medium text-gray-900">~{MOCK_REQUEST.estimatedMins} min</div><div className="text-[10px] text-gray-400">Est. time</div></div>
              </div>

              <div className="flex gap-2">
                <button onClick={declineDelivery} className="flex-1 py-3 bg-gray-100 rounded-xl text-sm font-medium text-gray-600">Decline</button>
                <button onClick={acceptDelivery} className="flex-[2] py-3 bg-[#FF385C] rounded-xl text-sm font-medium text-white">🏍 Accept delivery</button>
              </div>
            </div>
          </div>
        )}

        {/* Active delivery */}
        {['accepted','pickup','delivering','done'].includes(step) && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-[#FF385C] px-4 py-3 flex justify-between">
              <div className="text-sm font-medium text-white">Delivery in progress</div>
              <div className="text-xs text-white/80">#{MOCK_REQUEST.orderId} · {formatTime(elapsedSecs)}</div>
            </div>
            <div className="px-4 py-4">
              {[
                { key: 'accepted', icon: '✓', label: 'Order accepted', sub: 'Heading to ' + MOCK_REQUEST.store, done: true },
                { key: 'pickup', icon: '🏍', label: 'At pickup point', sub: 'Collecting order from restaurant', active: step === 'accepted' },
                { key: 'delivering', icon: '📦', label: 'En route to customer', sub: MOCK_REQUEST.customer + ' · ' + MOCK_REQUEST.customerAddress, active: step === 'delivering' },
                { key: 'done', icon: '✅', label: 'Delivered', sub: step === 'done' ? `Delivered to ${MOCK_REQUEST.customer} ✓` : 'Mark when handed to customer', active: false, done: step === 'done' },
              ].map((s, i) => {
                const isDone = s.done || (step === 'delivering' && i < 2) || (step === 'done')
                const isActive = s.active
                return (
                  <div key={s.key} className="flex items-center gap-3 mb-4 last:mb-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 border-2 ${isDone ? 'bg-green-500 border-green-500 text-white' : isActive ? 'bg-[#FF385C] border-[#FF385C] text-white' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
                      {s.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{s.label}</div>
                      <div className="text-xs text-gray-400">{s.sub}</div>
                    </div>
                    {isActive && step === 'accepted' && s.key === 'pickup' && (
                      <button onClick={confirmPickup} className="text-xs font-medium text-[#FF385C]">Confirm →</button>
                    )}
                    {step === 'delivering' && s.key === 'delivering' && (
                      <button onClick={confirmDelivery} className="text-xs font-medium text-[#FF385C]">Delivered →</button>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex gap-2 px-4 pb-4">
              <a href="tel:+254712345678" className="flex-1 py-3 text-center bg-[#FF385C] rounded-xl text-sm font-medium text-white">📞 Call customer</a>
              <button onClick={() => router.push('/rider/inbox')} className="flex-1 py-3 bg-gray-100 rounded-xl text-sm font-medium text-gray-700">💬 Message</button>
            </div>
          </div>
        )}

        {/* Earnings summary */}
        <div className="mt-4 bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-3">Today&apos;s summary</div>
          <div className="grid grid-cols-2 gap-2.5">
            {[['Trips', tripsToday.toString()], ['Earned', `KES ${earningsToday.toLocaleString()}`], ['Distance', '38.4km'], ['Rating', '4.9 ★']].map(([label, val]) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <div className="text-base font-medium text-gray-900">{val}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-[#1a1a2e] border-t border-white/10 flex py-2.5 pb-4">
        {[['🏍','Deliveries',''],['💬','Inbox','/rider/inbox'],['💰','Earnings','/rider/earnings'],['👤','Profile','/rider/profile']].map(([icon,label,href]) => (
          <button key={label} onClick={() => href && router.push(href)} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-lg">{icon}</span>
            <span className={`text-[10px] font-medium ${label === 'Deliveries' ? 'text-[#FF385C]' : 'text-white/40'}`}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
