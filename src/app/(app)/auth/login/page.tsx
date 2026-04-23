'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function sendOTP() {
    const raw = phone.replace(/\s/g, '')
    if (raw.length < 9) return toast.error('Enter a valid phone number')
    const formatted = '+254' + raw.replace(/^(0|254|\+254)/, '')
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted })
    if (error) { toast.error(error.message); setLoading(false); return }
    sessionStorage.setItem('shop_phone', formatted)
    toast.success('Code sent!')
    router.push('/auth/otp')
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#1a1a2e] flex flex-col items-center justify-center py-16 px-8">
        <div className="text-5xl font-medium text-white tracking-tight mb-2">
          sh<span className="text-[#FF385C]">o</span>p
        </div>
        <div className="text-sm text-white/50">Delivered to your door</div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-8 pb-6">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">Enter your number</h1>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          We'll send a one-time code to verify your number.
        </p>

        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 block">
          Phone number
        </label>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden mb-5 focus-within:border-[#FF385C]">
          <div className="px-3 py-3.5 text-sm font-medium text-gray-800 border-r border-gray-200 bg-gray-50 whitespace-nowrap">
            🇰🇪 +254
          </div>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendOTP()}
            placeholder="712 000 000"
            className="flex-1 px-3 py-3.5 text-sm text-gray-900 outline-none bg-transparent"
            maxLength={12}
          />
        </div>

        <button
          onClick={sendOTP}
          disabled={loading}
          className="w-full bg-[#FF385C] text-white rounded-xl py-4 text-sm font-medium disabled:opacity-60 mb-4"
        >
          {loading ? 'Sending...' : 'Send code →'}
        </button>

        <p className="text-xs text-gray-400 text-center leading-relaxed">
          By continuing you agree to our{' '}
          <span className="text-[#FF385C]">Terms of Service</span> and{' '}
          <span className="text-[#FF385C]">Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}
