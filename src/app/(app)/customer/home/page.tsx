export const dynamic = 'force-dynamic'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import CustomerHome from '@/components/customer/CustomerHome'

export default async function CustomerHomePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: vendors }, { data: zones }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('vendors').select('*, zone:zones(name)').eq('status', 'active').order('rating', { ascending: false }).limit(20),
    supabase.from('zones').select('*').eq('is_active', true),
  ])

  return <CustomerHome user={profile} vendors={vendors ?? []} zones={zones ?? []} />
}
