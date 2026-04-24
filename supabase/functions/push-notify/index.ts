// supabase/functions/push-notify/index.ts
// Deploy with: supabase functions deploy push-notify
//
// This edge function fires when an order status changes.
// It looks up the customer's FCM token and sends a push notification.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const STATUS_MESSAGES: Record<string, { title: string; body: string }> = {
  confirmed:   { title: 'Order confirmed! ✅', body: 'Your order is being prepared.' },
  preparing:   { title: 'Preparing your order 🍳', body: 'The kitchen is on it.' },
  ready:       { title: 'Order is ready! 📦', body: 'A rider is being assigned.' },
  collecting:  { title: 'Rider collecting 🏍', body: 'Your boda is picking up your order.' },
  on_the_way:  { title: "Your order is on its way! 🏍", body: 'Track your rider in real time.' },
  delivered:   { title: 'Delivered! 🎉', body: 'Enjoy your order. Rate your experience.' },
  cancelled:   { title: 'Order cancelled', body: 'Your order was cancelled. Refund initiated.' },
}

serve(async (req) => {
  try {
    const payload = await req.json()
    const record = payload.record  // updated orders row
    const oldRecord = payload.old_record

    // Only fire on status change
    if (!record || record.status === oldRecord?.status) {
      return new Response('No status change', { status: 200 })
    }

    const msg = STATUS_MESSAGES[record.status]
    if (!msg) return new Response('No message for status', { status: 200 })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get customer FCM tokens
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', record.customer_id)

    if (!tokens?.length) return new Response('No tokens', { status: 200 })

    // Send via FCM HTTP v1
    const adminKey = Deno.env.get('FIREBASE_ADMIN_KEY')!
    const serviceAccount = JSON.parse(atob(adminKey))
    const projectId = serviceAccount.project_id

    // Get OAuth2 token for FCM
    const tokenRes = await fetch(
      `https://oauth2.googleapis.com/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: await createJWT(serviceAccount),
        }),
      }
    )
    const { access_token } = await tokenRes.json()

    // Send to each token
    const sends = tokens.map(({ token }) =>
      fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token,
            notification: { title: msg.title, body: msg.body },
            data: {
              orderId: record.id,
              status: record.status,
              url: `/customer/track?id=${record.id}`,
            },
          },
        }),
      })
    )

    await Promise.allSettled(sends)
    return new Response('Notifications sent', { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response('Error', { status: 500 })
  }
})

// Minimal JWT for Google OAuth2
async function createJWT(serviceAccount: Record<string, string>): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const claims = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }

  const encode = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  const signingInput = `${encode(header)}.${encode(claims)}`

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(serviceAccount.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(signingInput))
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  return `${signingInput}.${sigB64}`
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '')
  const bin = atob(b64)
  const buf = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i)
  return buf.buffer
}
