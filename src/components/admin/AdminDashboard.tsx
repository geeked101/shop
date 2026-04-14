'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

type Tab = 'overview' | 'vendors' | 'riders' | 'orders' | 'zones' | 'payouts'

interface Props {
  vendors: any[]
  riders: any[]
  orders: any[]
  zones: any[]
}

export default function AdminDashboard({ vendors, riders, orders, zones: initialZones }: Props) {
  const [tab, setTab] = useState<Tab>('overview')
  const [vendorList, setVendorList] = useState(vendors)
  const [riderList, setRiderList] = useState(riders)
  const [zoneList, setZoneList] = useState(initialZones)

  const pending = vendorList.filter(v => v.status === 'pending')
  const active = vendorList.filter(v => v.status === 'active')
  const activeOrders = orders.filter(o => !['delivered','cancelled'].includes(o.status))
  const onlineRiders = riderList.filter(r => r.is_online)

  async function approveVendor(id: string) {
    const res = await fetch(`/api/admin/vendors/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) })
    if (res.ok) {
      setVendorList(prev => prev.map(v => v.id === id ? { ...v, status: 'active' } : v))
      toast.success('Vendor approved ✓ — store is now live')
    }
  }

  async function rejectVendor(id: string) {
    await fetch(`/api/admin/vendors/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'suspended' }) })
    setVendorList(prev => prev.filter(v => v.id !== id))
    toast('Application rejected')
  }

  async function toggleZone(id: string, current: boolean) {
    await fetch(`/api/admin/zones/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !current }) })
    setZoneList(prev => prev.map(z => z.id === id ? { ...z, is_active: !current } : z))
    const zone = zoneList.find(z => z.id === id)
    toast(`${zone?.name} zone ${!current ? 'enabled' : 'disabled'}`)
  }

  async function triggerPayout(vendorId: string, amount: number, name: string) {
    await fetch('/api/payouts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipientId: vendorId, recipientType: 'vendor', amount }) })
    toast.success(`Paid ${name} KES ${amount.toLocaleString()} via M-Pesa ✓`)
  }

  const TABS: Tab[] = ['overview','vendors','riders','orders','zones','payouts']

  return (
    <div className="bg-gray-950 min-h-screen pb-20 text-white">
      {/* Topbar */}
      <div className="bg-[#1a1a2e] px-4 pt-4 pb-3">
        <div className="flex justify-between items-center mb-3">
          <div className="text-base font-medium">sh<span className="text-[#FF385C]">o</span>p <span className="text-white/40 font-normal text-sm">admin</span></div>
          <span className="text-[10px] font-medium text-[#FF385C] bg-[#FF385C]/20 border border-[#FF385C]/40 px-2.5 py-1 rounded-full">Super Admin</span>
        </div>
        <div className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white/40">
          <span>⌕</span><span>Search vendors, riders, orders...</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#1a1a2e] flex overflow-x-auto scrollbar-hide border-b border-white/10 px-4">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`py-2.5 px-3 text-xs font-medium capitalize whitespace-nowrap border-b-2 flex-shrink-0 ${tab === t ? 'text-[#FF385C] border-[#FF385C]' : 'text-white/40 border-transparent'}`}>
            {t}{t === 'vendors' && pending.length > 0 && <span className="ml-1 bg-[#FF385C] text-white text-[9px] px-1.5 py-0.5 rounded-full">{pending.length}</span>}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4">
        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {[
                { label: 'Revenue today', val: 'KES 84.2k', change: '↑ 14%', up: true },
                { label: 'Active orders', val: activeOrders.length.toString(), change: `${activeOrders.length} live`, up: true },
                { label: 'Online riders', val: onlineRiders.length.toString(), change: `of ${riderList.length}`, up: false },
                { label: 'Open vendors', val: active.length.toString(), change: `${pending.length} pending`, up: false },
              ].map(s => (
                <div key={s.label} className="bg-[#1a1a2e] rounded-xl border border-white/10 p-3.5">
                  <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">{s.label}</div>
                  <div className="text-xl font-medium text-white">{s.val}</div>
                  <div className={`text-[11px] mt-0.5 ${s.up ? 'text-green-400' : 'text-white/40'}`}>{s.change}</div>
                </div>
              ))}
            </div>

            <div className="bg-[#1a1a2e] rounded-xl border border-white/10 overflow-hidden mb-4">
              <div className="flex justify-between px-4 py-2.5 border-b border-white/10">
                <span className="text-[11px] text-white/40 uppercase tracking-wide">Live orders</span>
              </div>
              {activeOrders.slice(0,3).map(o => (
                <div key={o.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/10 last:border-b-0">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-base flex-shrink-0">☕</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{o.vendor?.name ?? 'Store'}</div>
                    <div className="text-xs text-white/40">#{o.id.slice(0,8).toUpperCase()} · KES {o.total?.toLocaleString()}</div>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-green-900 text-green-400">{o.status}</span>
                </div>
              ))}
              {activeOrders.length === 0 && <div className="px-4 py-4 text-sm text-white/30 text-center">No active orders</div>}
            </div>

            {pending.length > 0 && (
              <div className="bg-[#1a1a2e] rounded-xl border border-white/10 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-white/10 text-[11px] text-white/40 uppercase tracking-wide">Pending approvals</div>
                {pending.map(v => (
                  <div key={v.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/10 last:border-b-0">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{v.name}</div>
                      <div className="text-xs text-white/40">{v.category} · {v.address}</div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => approveVendor(v.id)} className="text-[10px] bg-green-600 text-white px-2.5 py-1.5 rounded-lg font-medium">✓</button>
                      <button onClick={() => rejectVendor(v.id)} className="text-[10px] bg-white/10 text-white/60 px-2.5 py-1.5 rounded-lg font-medium">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VENDORS */}
        {tab === 'vendors' && (
          <div>
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="bg-[#1a1a2e] rounded-xl border border-white/10 p-3.5"><div className="text-[10px] text-white/40 mb-1">Total vendors</div><div className="text-xl font-medium text-white">{vendorList.length}</div></div>
              <div className="bg-[#1a1a2e] rounded-xl border border-white/10 p-3.5"><div className="text-[10px] text-white/40 mb-1">Pending review</div><div className="text-xl font-medium text-[#FF385C]">{pending.length}</div></div>
            </div>
            {pending.length > 0 && (
              <div className="bg-[#1a1a2e] rounded-xl border border-white/10 overflow-hidden mb-4">
                <div className="px-4 py-2.5 border-b border-white/10 text-[11px] text-white/40 uppercase tracking-wide">Pending approval</div>
                {pending.map(v => (
                  <div key={v.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/10 last:border-b-0">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{v.name}</div>
                      <div className="text-xs text-white/40">{v.category} · {v.zone?.name ?? v.address}</div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => approveVendor(v.id)} className="text-[10px] bg-green-600 text-white px-2.5 py-1.5 rounded-lg font-medium">Approve</button>
                      <button onClick={() => rejectVendor(v.id)} className="text-[10px] bg-white/10 text-white/60 px-2.5 py-1.5 rounded-lg font-medium">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-[#1a1a2e] rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/10 text-[11px] text-white/40 uppercase tracking-wide">Active vendors</div>
              {active.slice(0,5).map(v => (
                <div key={v.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/10 last:border-b-0">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{v.name}</div>
                    <div className="text-xs text-white/40">{v.category} · ★ {v.rating?.toFixed(1) ?? '0.0'}</div>
                  </div>
                  <span className="text-[10px] bg-green-900 text-green-400 px-2 py-0.5 rounded-full">Active</span>
                </div>
              ))}
              {active.length === 0 && <div className="px-4 py-4 text-sm text-white/30 text-center">No active vendors</div>}
            </div>
          </div>
        )}

        {/* RIDERS */}
        {tab === 'riders' && (
          <div>
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="bg-[#1a1a2e] rounded-xl border border-white/10 p-3.5"><div className="text-[10px] text-white/40 mb-1">Total riders</div><div className="text-xl font-medium text-white">{riderList.length}</div></div>
              <div className="bg-[#1a1a2e] rounded-xl border border-white/10 p-3.5"><div className="text-[10px] text-white/40 mb-1">Online now</div><div className="text-xl font-medium text-green-400">{onlineRiders.length}</div></div>
            </div>
            <div className="bg-[#1a1a2e] rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/10 text-[11px] text-white/40 uppercase tracking-wide">All riders</div>
              {riderList.map(r => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/10 last:border-b-0">
                  <div className="w-9 h-9 rounded-full bg-[#FF385C] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {r.name?.split(' ').map((n: string) => n[0]).join('').slice(0,2)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{r.name}</div>
                    <div className="text-xs text-white/40">{r.plate} · ★ {r.rating?.toFixed(1) ?? '0.0'} · {r.total_trips} trips</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${r.is_online ? 'bg-green-900 text-green-400' : 'bg-white/10 text-white/40'}`}>
                    {r.is_online ? 'Online' : 'Offline'}
                  </span>
                </div>
              ))}
              {riderList.length === 0 && <div className="px-4 py-4 text-sm text-white/30 text-center">No riders yet</div>}
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div>
            <div className="bg-[#1a1a2e] rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/10 text-[11px] text-white/40 uppercase tracking-wide">Recent orders</div>
              {orders.slice(0,10).map(o => (
                <div key={o.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/10 last:border-b-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">#{o.id.slice(0,8).toUpperCase()}</div>
                    <div className="text-xs text-white/40">{o.vendor?.name ?? 'Store'} · KES {o.total?.toLocaleString()}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${o.status === 'delivered' ? 'bg-green-900 text-green-400' : o.status === 'cancelled' ? 'bg-red-900/50 text-red-400' : 'bg-amber-900/50 text-amber-400'}`}>
                    {o.status}
                  </span>
                </div>
              ))}
              {orders.length === 0 && <div className="px-4 py-4 text-sm text-white/30 text-center">No orders yet</div>}
            </div>
          </div>
        )}

        {/* ZONES */}
        {tab === 'zones' && (
          <div className="flex flex-col gap-2.5">
            {zoneList.map(z => (
              <div key={z.id} className="bg-[#1a1a2e] rounded-xl border border-white/10 flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#FF385C]/20 flex items-center justify-center text-base flex-shrink-0">📍</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{z.name}</div>
                  <div className="text-xs text-white/40">Base KES {z.base_fare} + {z.per_km_rate}/km</div>
                </div>
                <button
                  onClick={() => toggleZone(z.id, z.is_active)}
                  className={`w-10 h-6 rounded-full relative transition-colors flex-shrink-0 ${z.is_active ? 'bg-green-500' : 'bg-white/20'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${z.is_active ? 'left-5' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* PAYOUTS */}
        {tab === 'payouts' && (
          <div>
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="bg-[#1a1a2e] rounded-xl border border-white/10 p-3.5"><div className="text-[10px] text-white/40 mb-1">Pending payouts</div><div className="text-xl font-medium text-[#FF385C]">KES 142k</div></div>
              <div className="bg-[#1a1a2e] rounded-xl border border-white/10 p-3.5"><div className="text-[10px] text-white/40 mb-1">Paid this week</div><div className="text-xl font-medium text-green-400">KES 384k</div></div>
            </div>
            <div className="bg-[#1a1a2e] rounded-xl border border-white/10 overflow-hidden">
              <div className="flex justify-between px-4 py-2.5 border-b border-white/10">
                <span className="text-[11px] text-white/40 uppercase tracking-wide">Vendor payouts</span>
                <button onClick={() => toast.success('Processing all payouts...')} className="text-xs text-[#FF385C] font-medium">Pay all →</button>
              </div>
              {active.slice(0,3).map((v, i) => {
                const amounts = [12480, 28160, 7840]
                return (
                  <div key={v.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/10 last:border-b-0">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{v.name}</div>
                      <div className="text-xs text-white/40">{v.phone ?? '+254 7xx xxx xxx'} · M-Pesa</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">KES {amounts[i]?.toLocaleString()}</div>
                      <button onClick={() => triggerPayout(v.id, amounts[i] ?? 0, v.name)} className="text-[10px] bg-[#00a651] text-white px-2.5 py-1 rounded-lg mt-1">Pay now</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-[#1a1a2e] border-t border-white/10 flex py-2.5 pb-4">
        {[['📊','Overview','overview'],['🏪','Vendors','vendors'],['🏍','Riders','riders'],['💰','Payouts','payouts']].map(([icon,label,t]) => (
          <button key={label} onClick={() => setTab(t as Tab)} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-lg">{icon}</span>
            <span className={`text-[10px] font-medium ${tab === t ? 'text-[#FF385C]' : 'text-white/40'}`}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
