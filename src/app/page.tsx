export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function RootPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  switch (profile?.role) {
    case 'vendor': redirect('/vendor/dashboard')
    case 'rider': redirect('/rider/deliveries')
    case 'admin': redirect('/admin/dashboard')
    default: redirect('/customer/home')
  }
}
