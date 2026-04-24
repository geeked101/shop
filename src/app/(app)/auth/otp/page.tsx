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
    // Only allow numbers
    const cleanVal = val.replace(/[^0-9]/g, '')
    if (!cleanVal && val !== '') return

    const next = [...otp]
    next[i] = cleanVal.slice(-1)
    setOtp(next)

    // Move focus forward
    if (cleanVal && i < 5) {
      refs.current[i + 1]?.focus()
    }
    
    // Auto-verify when full
    const fullCode = next.join('')
    if (fullCode.length === 6 && !loading) {
      verify(fullCode)
    }
  }

  function handleKey(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace') {
      if (!otp[i] && i > 0) {
        const next = [...otp]
        next[i - 1] = ''
        setOtp(next)
        refs.current[i - 1]?.focus()
      } else {
        const next = [...otp]
        next[i] = ''
        setOtp(next)
      }
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const data = e.clipboardData.getData('text').slice(0, 6).replace(/[^0-9]/g, '')
    if (data.length) {
      const next = [...otp]
      data.split('').forEach((char, index) => {
        if (index < 6) next[index] = char
      })
      setOtp(next)
      verify(data)
    }
  }

  async function verify(code: string) {
    if (loading || code.length !== 6) return
    if (!phone) { 
      toast.error('Session expired, please try again')
      router.push('/auth/login')
      return 
    }
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

      <div className="flex gap-2 mb-8 justify-between">
        {otp.map((d, i) => (
          <input
            key={i}
            ref={el => { refs.current[i] = el }}
            type="tel"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={d}
            onPaste={handlePaste}
            onChange={e => handleInput(i, e.target.value)}
            onKeyDown={e => handleKey(i, e)}
            className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-2xl border-2 outline-none transition-all duration-200
              ${d ? 'border-[#FF385C] bg-[#fff8f8] text-[#FF385C]' : 'border-gray-100 bg-gray-50 text-gray-900'}
              focus:border-[#FF385C] focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,56,92,0.1)]`}
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
