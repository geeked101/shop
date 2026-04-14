const MPESA_ENV = process.env.MPESA_ENV ?? 'sandbox'
const BASE_URL = MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke'

async function getAccessToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY!
  const secret = process.env.MPESA_CONSUMER_SECRET!
  const credentials = Buffer.from(`${key}:${secret}`).toString('base64')

  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  })
  const data = await res.json()
  return data.access_token
}

function getTimestamp(): string {
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
}

function getPassword(timestamp: string): string {
  const shortcode = process.env.MPESA_SHORTCODE!
  const passkey = process.env.MPESA_PASSKEY!
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')
}

export interface STKPushParams {
  phone: string       // 254712345678
  amount: number      // KES amount
  orderId: string     // used as account reference
  description: string
}

export interface STKPushResult {
  success: boolean
  checkoutRequestId?: string
  merchantRequestId?: string
  error?: string
}

export async function initiateSTKPush(params: STKPushParams): Promise<STKPushResult> {
  try {
    const accessToken = await getAccessToken()
    const timestamp = getTimestamp()
    const password = getPassword(timestamp)
    const shortcode = process.env.MPESA_SHORTCODE!
    const callbackUrl = process.env.MPESA_CALLBACK_URL!

    // Format phone: remove leading 0 or +254, ensure starts with 254
    const phone = params.phone.replace(/^(\+254|0)/, '254')

    const body = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(params.amount),
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: params.orderId,
      TransactionDesc: params.description,
    }

    const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (data.ResponseCode === '0') {
      return {
        success: true,
        checkoutRequestId: data.CheckoutRequestID,
        merchantRequestId: data.MerchantRequestID,
      }
    }

    return { success: false, error: data.errorMessage ?? 'STK push failed' }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export interface STKCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string
      CheckoutRequestID: string
      ResultCode: number
      ResultDesc: string
      CallbackMetadata?: {
        Item: Array<{ Name: string; Value?: string | number }>
      }
    }
  }
}

export function parseSTKCallback(body: STKCallbackBody) {
  const cb = body.Body.stkCallback
  const success = cb.ResultCode === 0
  let mpesaReceiptNumber: string | undefined
  let amount: number | undefined
  let phone: string | undefined

  if (success && cb.CallbackMetadata) {
    for (const item of cb.CallbackMetadata.Item) {
      if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = String(item.Value)
      if (item.Name === 'Amount') amount = Number(item.Value)
      if (item.Name === 'PhoneNumber') phone = String(item.Value)
    }
  }

  return {
    success,
    checkoutRequestId: cb.CheckoutRequestID,
    merchantRequestId: cb.MerchantRequestID,
    resultDesc: cb.ResultDesc,
    mpesaReceiptNumber,
    amount,
    phone,
  }
}
