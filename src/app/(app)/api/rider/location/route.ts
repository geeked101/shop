import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lat, lng, is_online } = await req.json()

  const update: Record<string, unknown> = {}
  if (lat !== undefined) update.lat = lat
  if (lng !== undefined) update.lng = lng
  if (is_online !== undefined) update.is_online = is_online

  const { error } = await supabase.from('riders').update(update).eq('user_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')
  if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })

  const { data: order } = await supabase
    .from('orders')
    .select('rider:riders(lat,lng,name,phone,plate,rating,is_online)')
    .eq('id', orderId)
    .single()

  return NextResponse.json(order)
}
