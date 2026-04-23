'use client'
export const dynamic = 'force-dynamic'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function OTPPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const p = sessionStorage.getItem('shop_phone') ?? ''
    setPhone(p)
    refs.current[0]?.focus()
  }, [])

  function handleInput(i: number, val: string) {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 5) refs.current[i + 1]?.focus()
    if (!loading && next.every(d => d) && next.join('').length === 6) verify(next.join(''))
  }

  function handleKey(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }

  async function verify(code: string) {
    if (loading) return
    if (!phone) { toast.error('Session expired, please try again'); router.push('/auth/login'); return }
    if (!/^\d{6}$/.test(code)) { toast.error('Enter the 6-digit code'); return }
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' })
    if (error) {
      toast.error(error.message || 'Invalid code')
      setLoading(false)
      setOtp(['', '', '', '', '', ''])
      refs.current[0]?.focus()
      return
    }
    router.push('/auth/role')
  }

  async function resend() {
    if (loading) return
    if (!phone) return
    await supabase.auth.signInWithOtp({ phone })
    toast.success('Code resent!')
  }

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 pt-12 pb-6">
      <button onClick={() => router.back()} className="text-xl mb-6 text-left">←</button>
      <h1 className="text-2xl font-medium text-gray-900 mb-2">Enter OTP</h1>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed">
        We sent a 6-digit code to <strong>{phone}</strong>
      </p>

      <div className="flex gap-2 mb-6">
        {otp.map((d, i) => (
          <input
            key={i}
            ref={el => { refs.current[i] = el }}
            type="tel"
            maxLength={1}
            value={d}
            onChange={e => handleInput(i, e.target.value)}
            onKeyDown={e => handleKey(i, e)}
            className={`flex-1 h-14 text-center text-xl font-medium rounded-xl border outline-none transition-colors
              ${d ? 'border-[#FF385C] bg-[#fff8f8]' : 'border-gray-200 bg-gray-50'}
              focus:border-[#FF385C]`}
          />
        ))}
      </div>

      <p className="text-sm text-gray-400 text-center mb-6">
        Didn&apos;t get it?{' '}
        <button onClick={resend} className="text-[#FF385C] font-medium">Resend code</button>
      </p>

      <button
        onClick={() => verify(otp.join(''))}
        disabled={loading || otp.some(d => !d)}
        className="w-full bg-[#FF385C] text-white rounded-xl py-4 text-sm font-medium disabled:opacity-50"
      >
        {loading ? 'Verifying...' : 'Verify →'}
      </button>
    </div>
  )
}
