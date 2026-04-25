export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import LandingContent from '@/components/LandingContent'

export default async function RootPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (profile) {
      switch (profile.role) {
        case 'vendor': redirect('/vendor/dashboard'); break
        case 'rider': redirect('/rider/deliveries'); break
        case 'admin': redirect('/admin/dashboard'); break
        default: redirect('/customer/home'); break
      }
    } else {
      redirect('/customer/home')
    }
  }

  return <LandingContent />
}
