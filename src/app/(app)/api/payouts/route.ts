import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const BASE_URL = process.env.MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke'

async function getAccessToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY!
  const secret = process.env.MPESA_CONSUMER_SECRET!
  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}` },
  })
  const data = await res.json()
  return data.access_token
}

function getSecurityCredential(): string {
  // In production, encrypt the initiator password with Safaricom's public certificate
  // For sandbox, use the pre-generated sandbox credential
  // See: https://developer.safaricom.co.ke/docs#b2c-api
  return process.env.MPESA_ENV === 'production'
    ? process.env.MPESA_B2C_SECURITY_CREDENTIAL!
    : 'Safaricom123!!' // sandbox demo value
}

interface B2CResult {
  success: boolean
  conversationId?: string
  error?: string
}

async function sendB2C(phone: string, amount: number, remarks: string): Promise<B2CResult> {
  try {
    const accessToken = await getAccessToken()
    const formattedPhone = phone.replace(/^(\+254|0)/, '254')

    const body = {
      InitiatorName: process.env.MPESA_B2C_INITIATOR_NAME!,
      SecurityCredential: getSecurityCredential(),
      CommandID: 'BusinessPayment', // or 'SalaryPayment' for rider payouts
      Amount: Math.round(amount),
      PartyA: process.env.MPESA_B2C_SHORTCODE!,
      PartyB: formattedPhone,
      Remarks: remarks.slice(0, 100),
      QueueTimeOutURL: process.env.MPESA_B2C_QUEUE_URL!,
      ResultURL: process.env.MPESA_B2C_RESULT_URL!,
      Occasion: 'Shop payout',
    }

    const res = await fetch(`${BASE_URL}/mpesa/b2c/v3/paymentrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (data.ResponseCode === '0') {
      return { success: true, conversationId: data.ConversationID }
    }

    return { success: false, error: data.errorMessage ?? data.ResponseDescription ?? 'B2C failed' }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { recipientId, recipientType, amount } = await req.json()
  if (!recipientId || !recipientType || !amount) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const adminSupabase = getAdminClient()
  const table = recipientType === 'vendor' ? 'vendors' : 'riders'
  const { data: recipient } = await adminSupabase
    .from(table)
    .select('phone, name')
    .eq('id', recipientId)
    .single()

  if (!recipient) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })

  const result = await sendB2C(recipient.phone, amount, `Shop ${recipientType} payout to ${recipient.name}`)

  await adminSupabase.from('payouts').insert({
    recipient_id: recipientId,
    recipient_type: recipientType,
    amount,
    status: result.success ? 'paid' : 'failed',
    mpesa_ref: result.conversationId,
  })

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true, conversationId: result.conversationId })
}

// B2C result callback — add this as a separate route
// at src/app/api/mpesa/b2c/result/route.ts
export const B2C_RESULT_HANDLER = `
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = body.Result
  const success = result.ResultCode === 0
  const conversationId = result.ConversationID

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await supabase
    .from('payouts')
    .update({ status: success ? 'paid' : 'failed' })
    .eq('mpesa_ref', conversationId)

  return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
}
`
