import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/customer/home')

  const [
    { data: vendors },
    { data: riders },
    { data: orders },
    { data: zones },
  ] = await Promise.all([
    supabase.from('vendors').select('*, zone:zones(name)').order('created_at', { ascending: false }),
    supabase.from('riders').select('*').order('created_at', { ascending: false }),
    supabase.from('orders').select('*, vendor:vendors(name), customer:users(name)').order('created_at', { ascending: false }).limit(50),
    supabase.from('zones').select('*').order('name'),
  ])

  return <AdminDashboard vendors={vendors ?? []} riders={riders ?? []} orders={orders ?? []} zones={zones ?? []} />
}
