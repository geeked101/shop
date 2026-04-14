import { NextRequest, NextResponse } from 'next/server'
import { initiateSTKPush } from '@/lib/mpesa'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { orderId, phone, amount } = await req.json()
    if (!orderId || !phone || !amount) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const result = await initiateSTKPush({
      phone,
      amount,
      orderId,
      description: `Shop order ${orderId}`,
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
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
