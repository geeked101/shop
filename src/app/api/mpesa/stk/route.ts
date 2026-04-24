// MERGE NOTE: Replace src/app/api/mpesa/stk/route.ts with this file.
// Adds rate limiting: max 5 STK push attempts per IP per minute.

import { NextRequest, NextResponse } from 'next/server'
import { initiateSTKPush } from '@/lib/mpesa'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  // Rate limit: 5 attempts per minute per IP
  const { success: allowed } = await rateLimit(req, 'stk-push', 5, 60)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many payment attempts. Please wait a minute and try again.' },
      { status: 429 }
    )
  }

  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { orderId, phone, amount } = await req.json()

    if (!orderId || !phone || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amount < 1 || amount > 150000) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Verify the order belongs to this user
    const { data: order } = await supabase
      .from('orders')
      .select('id, customer_id, total, payment_status')
      .eq('id', orderId)
      .single()

    if (!order || order.customer_id !== user.id) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json({ error: 'Order already paid' }, { status: 400 })
    }

    const result = await initiateSTKPush({
      phone,
      amount,
      orderId,
      description: `Shop order ${orderId.slice(0, 8).toUpperCase()}`,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Save checkout ID to order
    await supabase
      .from('orders')
      .update({ mpesa_checkout_id: result.checkoutRequestId })
      .eq('id', orderId)

    return NextResponse.json({
      checkoutRequestId: result.checkoutRequestId,
      merchantRequestId: result.merchantRequestId,
    })
  } catch (err) {
    console.error('[STK Push]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
