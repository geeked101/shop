// =============================================================
// PUSH NOTIFICATIONS — SETUP GUIDE + CODE
// =============================================================
//
// This sets up Web Push via Firebase Cloud Messaging (FCM).
// Notifications fire on order status changes via Supabase webhook.
//
// SETUP STEPS:
//   1. Create a Firebase project at https://console.firebase.google.com
//   2. Add a Web App → copy the firebaseConfig
//   3. Generate a VAPID key pair: Project Settings > Cloud Messaging > Web Push certificates
//   4. Add to .env.local:
//        NEXT_PUBLIC_FIREBASE_API_KEY=...
//        NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
//        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
//        NEXT_PUBLIC_FIREBASE_APP_ID=...
//        NEXT_PUBLIC_FIREBASE_VAPID_KEY=...
//        FIREBASE_ADMIN_KEY=<base64 of your service account JSON>
//   5. npm install firebase firebase-admin
//   6. Deploy the Supabase Edge Function in supabase/functions/push-notify/index.ts
//   7. Create a Supabase webhook: Database > Webhooks
//      → Table: orders  Event: UPDATE  URL: your-edge-function-url

// -------------------------------------------------------------
// FILE 1: src/lib/notifications.ts
// Client-side — request permission + save FCM token to DB
// -------------------------------------------------------------

import { createClient } from '@/lib/supabase'

export async function requestPushPermission(): Promise<boolean> {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return false

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return false

  try {
    const { initializeApp, getApps } = await import('firebase/app')
    const { getMessaging, getToken } = await import('firebase/messaging')

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }

    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
    const messaging = getMessaging(app)

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.ready,
    })

    if (!token) return false

    // Save token to Supabase
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('push_tokens').upsert({
        user_id: user.id,
        token,
        platform: 'web',
        updated_at: new Date().toISOString(),
      })
    }

    return true
  } catch (err) {
    console.error('[Push] Failed to get FCM token:', err)
    return false
  }
}

