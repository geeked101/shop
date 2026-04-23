import { NextRequest, NextResponse } from 'next/server'
import { parseSTKCallback } from '@/lib/mpesa'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const body = await req.json()
    const result = parseSTKCallback(body)
    if (result.success) {
      await supabase.from('orders').update({
        payment_status: 'paid',
        mpesa_receipt: result.mpesaReceiptNumber,
        status: 'confirmed',
      }).eq('mpesa_checkout_id', result.checkoutRequestId)
    } else {
      await supabase.from('orders').update({
        payment_status: 'failed', status: 'cancelled',
      }).eq('mpesa_checkout_id', result.checkoutRequestId)
    }
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  } catch (err) {
    console.error('mpesa callback:', err)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }
}
