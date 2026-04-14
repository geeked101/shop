import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function mpesaB2C(phone: string, amount: number, remarks: string): Promise<{ success: boolean; conversationId?: string; error?: string }> {
  // Daraja B2C API for payouts to vendors/riders
  // In production: use BusinessPayBill or B2C API
  // For now returns mock success — wire up Daraja B2C when going live
  console.log(`[Payout] ${phone} → KES ${amount} (${remarks})`)
  return { success: true, conversationId: `MOCK-${Date.now()}` }
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { recipientId, recipientType, amount } = await req.json()

  // Get recipient phone
  const table = recipientType === 'vendor' ? 'vendors' : 'riders'
  const adminSupabase = getAdminClient()
  const { data: recipient } = await adminSupabase.from(table).select('phone, name').eq('id', recipientId).single()
  if (!recipient) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })

  const result = await mpesaB2C(recipient.phone, amount, `Shop payout to ${recipient.name}`)

  // Log payout
  await adminSupabase.from('payouts').insert({
    recipient_id: recipientId,
    recipient_type: recipientType,
    amount,
    status: result.success ? 'paid' : 'failed',
    mpesa_ref: result.conversationId,
  })

  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })

  return NextResponse.json({ success: true, conversationId: result.conversationId })
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('payouts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json(data ?? [])
}
