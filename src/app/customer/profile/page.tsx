'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { User, Address } from '@/types'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [orderCount, setOrderCount] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [notifs, setNotifs] = useState(true)
  const [location, setLocation] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { router.push('/auth/login'); return }
      const [{ data: profile }, { data: addrs }, { data: orders }] = await Promise.all([
        supabase.from('users').select('*').eq('id', authUser.id).single(),
        supabase.from('addresses').select('*').eq('user_id', authUser.id).order('is_default', { ascending: false }),
        supabase.from('orders').select('total').eq('customer_id', authUser.id).eq('status', 'delivered'),
      ])
      if (profile) setUser(profile as User)
      setAddresses((addrs ?? []) as Address[])
      setOrderCount(orders?.length ?? 0)
      setTotalSpent(orders?.reduce((s: number, o: { total?: number }) => s + (o.total ?? 0), 0) ?? 0)
    }
    load()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'PL'

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4 border-b border-gray-100 flex items-center gap-4">
        <div className="relative">
          <div className="w-17 h-17 rounded-full bg-[#FF385C] flex items-center justify-center text-white text-2xl font-medium" style={{ width: 68, height: 68 }}>{initials}</div>
          <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs">✏</div>
        </div>
        <div className="flex-1">
          <div className="text-lg font-medium text-gray-900">{user?.name || 'Your Name'}</div>
          <div className="text-sm text-gray-400 mt-0.5">{user?.phone}</div>
          <div className="mt-1.5 inline-flex items-center gap-1 bg-[#fff0f2] px-2.5 py-1 rounded-full text-xs font-medium text-[#FF385C]">⭐ Gold member</div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white grid grid-cols-4 border-b border-gray-100">
        {[
          { val: orderCount.toString(), label: 'Orders' },
          { val: totalSpent > 0 ? `KES ${Math.round(totalSpent/1000)}k` : 'KES 0', label: 'Spent' },
          { val: addresses.length.toString(), label: 'Addresses' },
          { val: 'KES 320', label: 'Credits' },
        ].map(({ val, label }) => (
          <div key={label} className="flex flex-col items-center py-3.5 border-r border-gray-100 last:border-r-0">
            <div className="text-lg font-medium text-gray-900">{val}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Addresses */}
      <div className="mx-4 mt-4 bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center px-4 py-2.5 border-b border-gray-100">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Saved addresses</span>
          <button className="text-xs text-[#FF385C] font-medium">+ Add</button>
        </div>
        {addresses.length === 0 && (
          <div className="px-4 py-3 text-sm text-gray-400">No addresses saved yet</div>
        )}
        {addresses.map(addr => (
          <div key={addr.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0">
            <div className="w-9 h-9 rounded-full bg-[#fff0f2] flex items-center justify-center text-base flex-shrink-0">📍</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{addr.label}</div>
              <div className="text-xs text-gray-400">{addr.address}</div>
            </div>
            {addr.is_default && <span className="text-[10px] font-medium text-[#FF385C] bg-[#fff0f2] px-2 py-0.5 rounded-full">Default</span>}
          </div>
        ))}
        {/* Fallback addresses */}
        {addresses.length === 0 && [
          { label: 'Home', address: 'Ring Rd Westlands, near Sarit Centre', isDefault: true },
          { label: 'Mama Ngina University', address: 'Kikuyu Campus, Kiambu Rd', isDefault: false },
        ].map(a => (
          <div key={a.label} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0">
            <div className="w-9 h-9 rounded-full bg-[#fff0f2] flex items-center justify-center text-base flex-shrink-0">📍</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{a.label}</div>
              <div className="text-xs text-gray-400">{a.address}</div>
            </div>
            {a.isDefault && <span className="text-[10px] font-medium text-[#FF385C] bg-[#fff0f2] px-2 py-0.5 rounded-full">Default</span>}
          </div>
        ))}
      </div>

      {/* Payment methods */}
      <div className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center px-4 py-2.5 border-b border-gray-100">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Payment methods</span>
          <button className="text-xs text-[#FF385C] font-medium">+ Add</button>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-[#00a651] flex items-center justify-center text-white text-[9px] font-medium flex-shrink-0">M-PESA</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">M-Pesa</div>
            <div className="text-xs text-gray-400">{user?.phone ?? '+254 712 *** 456'} · Default</div>
          </div>
          <span className="text-[10px] font-medium text-[#FF385C] bg-[#fff0f2] px-2 py-0.5 rounded-full">Active</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-[#1a1f71] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">VISA</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">Visa card</div>
            <div className="text-xs text-gray-400">•••• •••• •••• 4821</div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100">Preferences</div>
        {[
          { icon: '🔔', bg: '#fff0f2', label: 'Order notifications', toggle: true, state: notifs, onToggle: () => setNotifs(n => !n) },
          { icon: '📍', bg: '#e8f5e9', label: 'Location access', toggle: true, state: location, onToggle: () => setLocation(l => !l) },
          { icon: '🔒', bg: '#f3e5f5', label: 'Privacy & security', toggle: false },
          { icon: '❓', bg: '#fff8e1', label: 'Help & support', toggle: false },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: item.bg }}>{item.icon}</div>
            <div className="flex-1 text-sm text-gray-900">{item.label}</div>
            {item.toggle ? (
              <button onClick={item.onToggle}
                className={`w-10 h-6 rounded-full relative transition-colors ${item.state ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${item.state ? 'left-5' : 'left-1'}`} />
              </button>
            ) : <span className="text-gray-300 text-lg">›</span>}
          </div>
        ))}
      </div>

      {/* Sign out */}
      <div className="px-4 mt-3 mb-4">
        <button onClick={signOut} className="w-full bg-[#fff0f2] border border-[#ffcdd6] text-[#FF385C] rounded-xl py-3.5 text-sm font-medium">
          Sign out
        </button>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-gray-100 flex py-2.5 pb-4">
        {[['🏠','Home','/customer/home'],['🔍','Explore','/customer/explore'],['🛍','Orders','/customer/orders'],['💬','Inbox','/customer/inbox'],['👤','Profile','']].map(([icon,label,href]) => (
          <button key={label} onClick={() => href && router.push(href)} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xl">{icon}</span>
            <span className={`text-[10px] font-medium ${label === 'Profile' ? 'text-[#FF385C]' : 'text-gray-400'}`}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
