'use client'
export const dynamic = 'force-dynamic'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { uploadVendorFile } from '@/lib/storage'
import toast from 'react-hot-toast'

const TYPES = [
  { id: 'restaurant', icon: '🍔', label: 'Restaurant / Food', desc: 'Meals, snacks, beverages, fast food', bg: '#fff3e0' },
  { id: 'shop', icon: '🛒', label: 'Shop / Retail', desc: 'Electronics, clothing, hardware, general goods', bg: '#e3f2fd' },
  { id: 'pharmacy', icon: '💊', label: 'Pharmacy', desc: 'Medicines, health products, wellness', bg: '#e8f5e9' },
  { id: 'grocery', icon: '🥕', label: 'Grocery / Supermarket', desc: 'Fresh produce, household items, drinks', bg: '#f3e5f5' },
]

const ZONES = ['CBD','Westlands','Roysambu','Kilimani','Lavington','South B','South C','Mutomo','Parklands','Kasarani','Eastleigh','Ngong Rd']
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

type DocType = 'logo' | 'cert' | 'kra' | 'licence'

interface DocState {
  file: File | null
  url: string | null
  uploading: boolean
  done: boolean
}

function emptyDoc(): DocState {
  return { file: null, url: null, uploading: false, done: false }
}

export default function VendorRegisterPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState('restaurant')
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [minOrder, setMinOrder] = useState('300')
  const [selectedZones, setSelectedZones] = useState<string[]>(['CBD','Westlands'])
  const [closedDays, setClosedDays] = useState<number[]>([6])
  const [docs, setDocs] = useState<Record<DocType, DocState>>({
    logo: emptyDoc(), cert: emptyDoc(), kra: emptyDoc(), licence: emptyDoc()
  })
  const fileRefs = useRef<Record<DocType, HTMLInputElement | null>>({ logo: null, cert: null, kra: null, licence: null })
  const router = useRouter()
  const supabase = createClient()

  const progress = (step / 5) * 100

  async function handleFileSelect(type: DocType, file: File) {
    setDocs(prev => ({ ...prev, [type]: { ...prev[type], file, uploading: true, done: false } }))

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Not logged in'); return }

    const result = await uploadVendorFile(file, user.id, type)
    if (!result.success) {
      toast.error(`Upload failed: ${result.error}`)
      setDocs(prev => ({ ...prev, [type]: emptyDoc() }))
      return
    }

    setDocs(prev => ({ ...prev, [type]: { file, url: result.url ?? null, uploading: false, done: true } }))
    toast.success(`${type} uploaded ✓`)
  }

  async function submit() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Not logged in'); setLoading(false); return }

    const { error } = await supabase.from('vendors').insert({
      user_id: user.id,
      name, description: desc, category, phone,
      address, lat: -1.2741, lng: 36.8119,
      min_order: Number(minOrder),
      status: 'pending',
      rating: 0, rating_count: 0,
      is_open: false,
      logo_url: docs.logo.url,
    })

    if (error) { toast.error(error.message); setLoading(false); return }
    setStep(6)
  }

  if (step === 6) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#FF385C] flex items-center justify-center text-4xl mb-4">🎉</div>
        <div className="text-2xl font-medium text-gray-900 mb-2">You&apos;re on Shop!</div>
        <div className="text-sm text-gray-500 mb-6 leading-relaxed">Application submitted. Our team will review and activate your store within 24 hours.</div>
        <div className="w-full bg-white border border-gray-100 rounded-xl overflow-hidden mb-6">
          {['Application submitted ✅','Documents verified (up to 24hrs)','Store goes live — add products','First order comes in 🎉'].map((s, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0">
              <div className="w-7 h-7 rounded-full bg-[#fff0f2] flex items-center justify-center text-xs font-medium text-[#FF385C]">{i+1}</div>
              <div className="text-sm text-gray-900">{s}</div>
            </div>
          ))}
        </div>
        <button onClick={() => router.push('/vendor/dashboard')} className="w-full bg-[#FF385C] text-white rounded-xl py-4 text-sm font-medium">Go to vendor dashboard →</button>
      </div>
    )
  }

  const DOC_CONFIG: { key: DocType; label: string; icon: string; required: boolean }[] = [
    { key: 'logo', label: 'Business logo', icon: '🖼', required: true },
    { key: 'cert', label: 'Registration certificate', icon: '📄', required: true },
    { key: 'kra', label: 'KRA PIN certificate', icon: '📄', required: true },
    { key: 'licence', label: 'Food / health licence', icon: '📄', required: false },
  ]

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Step bar */}
      <div className="px-5 pt-4 pb-3 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs text-gray-400">Step <span className="text-[#FF385C] font-medium">{step}</span> of 5</span>
          <button onClick={() => setStep(5)} className="text-xs text-gray-400">Skip to review</button>
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#FF385C] rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="px-5 pt-5">
        {/* Step 1: Type */}
        {step === 1 && (
          <div>
            <div className="text-xl font-medium text-gray-900 mb-1.5">What are you registering?</div>
            <div className="text-sm text-gray-400 mb-5">Choose your business type to get started.</div>
            <div className="flex flex-col gap-3">
              {TYPES.map(t => (
                <div key={t.id} onClick={() => setCategory(t.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer ${category === t.id ? 'border-[#FF385C] bg-[#fff8f8]' : 'border-gray-200'}`}>
                  <div className="w-13 h-13 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ width: 52, height: 52, background: t.bg }}>{t.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{t.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{t.desc}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${category === t.id ? 'border-[#FF385C]' : 'border-gray-300'}`}>
                    {category === t.id && <div className="w-2.5 h-2.5 rounded-full bg-[#FF385C]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div>
            <div className="text-xl font-medium text-gray-900 mb-1.5">Business details</div>
            <div className="text-sm text-gray-400 mb-5">This is what customers will see.</div>
            {[
              { label: 'Business name', val: name, set: setName, ph: 'e.g. Java House Westlands', type: 'text' },
              { label: 'Phone', val: phone, set: setPhone, ph: '0712 000 000', type: 'tel' },
              { label: 'Address', val: address, set: setAddress, ph: 'Street, area, city', type: 'text' },
              { label: 'Min. order (KES)', val: minOrder, set: setMinOrder, ph: '300', type: 'number' },
            ].map(f => (
              <div key={f.label} className="mb-4">
                <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">{f.label}</div>
                <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-gray-900 outline-none focus:border-[#FF385C]" />
              </div>
            ))}
            <div className="mb-4">
              <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">Description</div>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What makes your business special?"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-gray-900 outline-none focus:border-[#FF385C] resize-none" rows={3} />
            </div>
          </div>
        )}

        {/* Step 3: Documents — REAL UPLOAD */}
        {step === 3 && (
          <div>
            <div className="text-xl font-medium text-gray-900 mb-1.5">Verify your business</div>
            <div className="text-sm text-gray-400 mb-5">Upload docs. Files go to Supabase Storage. Takes under 24 hours to approve.</div>
            {DOC_CONFIG.map(d => {
              const state = docs[d.key]
              return (
                <div key={d.key} className="mb-4">
                  <div className="flex justify-between mb-1.5">
                    <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{d.label}</div>
                    {!d.required && <div className="text-[10px] text-gray-300">Optional</div>}
                  </div>
                  <input
                    type="file"
                    ref={el => { fileRefs.current[d.key] = el }}
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(d.key, f) }}
                  />
                  <div
                    onClick={() => fileRefs.current[d.key]?.click()}
                    className={`border-2 rounded-xl p-5 text-center cursor-pointer transition-all
                      ${state.done ? 'border-green-400 bg-green-50'
                        : state.uploading ? 'border-blue-300 bg-blue-50'
                        : 'border-dashed border-gray-300 bg-white'}`}
                  >
                    <div className="text-2xl mb-1.5">
                      {state.uploading ? '⏳' : state.done ? '✅' : d.icon}
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {state.uploading ? 'Uploading...'
                        : state.done ? (state.file?.name ?? 'Uploaded ✓')
                        : 'Tap to upload'}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {state.done ? 'Tap to replace' : 'PDF or image · Max 5MB'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Step 4: Zones + Hours */}
        {step === 4 && (
          <div>
            <div className="text-xl font-medium text-gray-900 mb-1.5">Zones & opening hours</div>
            <div className="text-sm text-gray-400 mb-5">Where you deliver and when you&apos;re open.</div>
            <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">Delivery zones</div>
            <div className="flex flex-wrap gap-2 mb-5">
              {ZONES.map(z => (
                <button key={z} onClick={() => setSelectedZones(prev => prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z])}
                  className={`px-3.5 py-1.5 rounded-full border text-xs font-medium ${selectedZones.includes(z) ? 'bg-[#FF385C] border-[#FF385C] text-white' : 'border-gray-200 text-gray-500'}`}>
                  {z}
                </button>
              ))}
            </div>
            <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">Opening hours</div>
            {DAYS.map((day, i) => (
              <div key={day} className="flex items-center gap-3 mb-2.5">
                <span className="text-xs font-medium text-gray-700 w-8">{day}</span>
                <button onClick={() => setClosedDays(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i])}
                  className={`w-10 h-6 rounded-full relative ${!closedDays.includes(i) ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${!closedDays.includes(i) ? 'left-5' : 'left-1'}`} />
                </button>
                {!closedDays.includes(i)
                  ? <span className="text-xs text-gray-500">8:00 AM – 10:00 PM</span>
                  : <span className="text-xs text-gray-300">Closed</span>}
              </div>
            ))}
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div>
            <div className="text-xl font-medium text-gray-900 mb-1.5">Review & submit</div>
            <div className="text-sm text-gray-400 mb-5">Everything look good?</div>
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden mb-4">
              {[
                { key: 'Type', val: TYPES.find(t => t.id === category)?.label ?? '' },
                { key: 'Name', val: name || '—' },
                { key: 'Phone', val: phone || '—' },
                { key: 'Address', val: address || '—' },
                { key: 'Min. order', val: `KES ${minOrder}` },
                { key: 'Documents', val: `${Object.values(docs).filter(d => d.done).length}/3 uploaded` },
                { key: 'Zones', val: selectedZones.join(', ') || '—' },
              ].map(row => (
                <div key={row.key} className="flex justify-between items-center px-4 py-3 border-b border-gray-100 last:border-b-0">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">{row.key}</span>
                  <span className="text-sm font-medium text-gray-900 text-right max-w-[55%]">{row.val}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">By submitting, you agree to Shop&apos;s vendor terms and 12% commission per order.</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-gray-100 px-5 py-3.5 pb-6 flex gap-2.5">
        {step > 1 && <button onClick={() => setStep(s => s - 1)} className="px-4 py-3.5 bg-gray-100 rounded-xl text-sm font-medium text-gray-700">← Back</button>}
        <button
          onClick={() => step < 5 ? setStep(s => s + 1) : submit()}
          disabled={loading}
          className="flex-1 bg-[#FF385C] text-white rounded-xl py-3.5 text-sm font-medium disabled:opacity-60"
        >
          {loading ? 'Submitting...' : step < 5 ? 'Continue →' : 'Submit ✅'}
        </button>
      </div>
    </div>
  )
}
