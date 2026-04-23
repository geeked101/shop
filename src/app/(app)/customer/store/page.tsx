export const dynamic = 'force-dynamic'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import StoreView from '@/components/customer/StoreView'

export default async function StorePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams
  if (!id) notFound()

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: vendor }, { data: items }] = await Promise.all([
    supabase.from('vendors').select('*, zone:zones(*)').eq('id', id).single(),
    supabase.from('menu_items').select('*').eq('vendor_id', id).eq('is_available', true).order('category'),
  ])

  if (!vendor) notFound()

  return <StoreView vendor={vendor} menuItems={items ?? []} />
}
