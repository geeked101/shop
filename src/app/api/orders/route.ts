// MERGE NOTE: Replace src/app/api/orders/route.ts with this file.
// Adds rate limiting: max 10 orders per IP per minute.

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const { success: allowed } = await rateLimit(req, 'create-order', 10, 60)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Slow down.' }, { status: 429 })
  }

  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { items, vendorId, subtotal, deliveryFee, serviceFee, total, paymentMethod, note } = await req.json()

    if (!items?.length || !vendorId) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 })
    }

    // Create order
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        vendor_id: vendorId,
        subtotal,
        delivery_fee: deliveryFee,
        service_fee: serviceFee,
        total,
        delivery_address: 'Westlands, Nairobi',
        delivery_lat: -1.2741,
        delivery_lng: 36.8119,
        distance_km: 2.4,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cash' ? 'paid' : 'pending',
        status: paymentMethod === 'cash' ? 'confirmed' : 'pending',
        note: note ?? '',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const orderItems = items.map((ci: { item: { id: string; name: string; price: number }; quantity: number }) => ({
      order_id: order.id,
      menu_item_id: ci.item.id,
      name: ci.item.name,
      price: ci.item.price,
      quantity: ci.quantity,
    }))

    await supabase.from('order_items').insert(orderItems)

    return NextResponse.json({ orderId: order.id })
  } catch (err) {
    console.error('[Orders]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('orders')
    .select('*, vendor:vendors(name, category), order_items(*)')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}
