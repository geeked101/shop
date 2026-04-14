'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { UserRole } from '@/types'

const roles = [
  { id: 'customer' as UserRole, icon: '🛍', label: 'Customer', desc: 'Order food, groceries and more delivered to you', bg: 'bg-[#fff0f2]' },
  { id: 'vendor' as UserRole, icon: '🏪', label: 'Vendor', desc: 'Register your shop, restaurant or pharmacy', bg: 'bg-[#e8f5e9]' },
  { id: 'rider' as UserRole, icon: '🏍', label: 'Rider', desc: 'Make deliveries and earn on your schedule', bg: 'bg-[#e3f2fd]' },
]

const redirects: Record<UserRole, string> = {
  customer: '/customer/home',
  vendor: '/vendor/register',
  rider: '/rider/deliveries',
  admin: '/admin/dashboard',
}

export default function RolePage() {
  const [selected, setSelected] = useState<UserRole>('customer')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function confirm() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Session expired'); router.push('/auth/login'); return }

    const { error } = await supabase.from('users').upsert({
      id: user.id,
      phone: user.phone ?? '',
      name: '',
      role: selected,
    })

    if (error) { toast.error('Something went wrong'); setLoading(false); return }
    router.push(redirects[selected])
  }

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 pt-12 pb-8">
      <h1 className="text-2xl font-medium text-gray-900 mb-2">Who are you?</h1>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed">
        Choose how you want to use Shop. You can add more roles later.
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {roles.map(r => (
          <div
            key={r.id}
            onClick={() => setSelected(r.id)}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all
              ${selected === r.id ? 'border-[#FF385C] bg-[#fff8f8]' : 'border-gray-200 bg-white'}`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${r.bg}`}>
              {r.icon}
            </div>
            <div className="flex-1">
              <div className="text-base font-medium text-gray-900 mb-0.5">{r.label}</div>
              <div className="text-xs text-gray-500">{r.desc}</div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
              ${selected === r.id ? 'border-[#FF385C]' : 'border-gray-300'}`}>
              {selected === r.id && <div className="w-2.5 h-2.5 rounded-full bg-[#FF385C]" />}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={confirm}
        disabled={loading}
        className="w-full bg-[#FF385C] text-white rounded-xl py-4 text-sm font-medium disabled:opacity-60"
      >
        {loading ? 'Setting up...' : 'Continue →'}
      </button>
    </div>
  )
}
