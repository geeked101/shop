export const dynamic = 'force-dynamic'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import VendorDashboard from '@/components/vendor/VendorDashboard'

export default async function VendorDashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*, zone:zones(name)')
    .eq('user_id', user.id)
    .single()

  if (!vendor) redirect('/vendor/register')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*), customer:users(name, phone)')
    .eq('vendor_id', vendor.id)
    .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'collecting', 'on_the_way'])
    .order('created_at', { ascending: false })

  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('vendor_id', vendor.id)

  return <VendorDashboard vendor={vendor} orders={orders ?? []} menuItems={menuItems ?? []} />
}
