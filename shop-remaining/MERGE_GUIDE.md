# Shop App — Remaining Steps Merge Guide

This folder contains everything that wasn't in the main `shop-nextjs-final.zip`.
Follow this guide exactly to merge it all in.

---

## What's in this folder

| File/Folder | What it does | Action |
|---|---|---|
| `supabase-storage.sql` | Storage bucket + RLS policies | Run in Supabase SQL Editor |
| `supabase-push-tokens.sql` | push_tokens table for FCM | Run in Supabase SQL Editor |
| `src/lib/storage.ts` | Upload utility (uploadVendorFile, getSignedUrl) | Copy to shop/src/lib/ |
| `src/lib/rateLimit.ts` | In-memory rate limiter | Copy to shop/src/lib/ |
| `src/lib/notifications.ts` | FCM permission + token save | Copy to shop/src/lib/ |
| `src/lib/sentry.ts` | Sentry helpers (captureMpesaError etc.) | Copy to shop/src/lib/ |
| `src/components/maps/DeliveryMap.tsx` | Real Google Maps component | Copy to shop/src/components/maps/ |
| `src/app/vendor/register/page.tsx` | Vendor register with real uploads | REPLACE shop/src/app/vendor/register/page.tsx |
| `src/app/customer/track/TrackContent.tsx` | Tracking with real Maps | REPLACE shop/src/app/customer/track/TrackContent.tsx |
| `src/app/api/mpesa/stk/route.ts` | Rate-limited STK push | REPLACE shop/src/app/api/mpesa/stk/route.ts |
| `src/app/api/orders/route.ts` | Rate-limited orders | REPLACE shop/src/app/api/orders/route.ts |
| `src/app/api/payouts/route.ts` | Real M-Pesa B2C payouts | REPLACE shop/src/app/api/payouts/route.ts |
| `supabase/functions/push-notify/index.ts` | Edge function: push on order update | Deploy to Supabase functions |
| `public/firebase-messaging-sw.js` | Background push service worker | Copy to shop/public/ |
| `scripts/deploy.sh` | One-command Vercel deploy | Copy to shop/scripts/ |

---

## Step-by-step merge

### 1. Supabase Storage

```bash
# In Supabase SQL Editor, run:
# 1. supabase-storage.sql
# 2. supabase-push-tokens.sql
```

### 2. Copy lib files

```bash
cp src/lib/storage.ts        ../shop/src/lib/
cp src/lib/rateLimit.ts      ../shop/src/lib/
cp src/lib/notifications.ts  ../shop/src/lib/
cp src/lib/sentry.ts         ../shop/src/lib/
```

### 3. Copy Maps component

```bash
mkdir -p ../shop/src/components/maps
cp src/components/maps/DeliveryMap.tsx ../shop/src/components/maps/
```

### 4. Replace pages & API routes

```bash
cp src/app/vendor/register/page.tsx          ../shop/src/app/vendor/register/page.tsx
cp src/app/customer/track/TrackContent.tsx   ../shop/src/app/customer/track/TrackContent.tsx
cp src/app/api/mpesa/stk/route.ts            ../shop/src/app/api/mpesa/stk/route.ts
cp src/app/api/orders/route.ts               ../shop/src/app/api/orders/route.ts
cp src/app/api/payouts/route.ts              ../shop/src/app/api/payouts/route.ts
```

### 5. Copy service worker

```bash
cp public/firebase-messaging-sw.js ../shop/public/
# Then open the file and replace the 4 REPLACE_WITH_ placeholders
# with your actual Firebase config values
```

### 6. Deploy Supabase Edge Function

```bash
cd ../shop
npx supabase functions deploy push-notify \
  --project-ref YOUR_SUPABASE_PROJECT_REF
```

### 7. Install new dependencies

```bash
cd ../shop
npm install firebase firebase-admin @sentry/nextjs
```

### 8. Add new env vars to .env.local

```env
# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_maps_api_key

# Firebase (for push notifications)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
FIREBASE_ADMIN_KEY=base64_of_service_account_json

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@oXXX.ingest.sentry.io/XXX
SENTRY_AUTH_TOKEN=your_auth_token
SENTRY_ORG=your-org
SENTRY_PROJECT=shop

# M-Pesa B2C (for payouts)
MPESA_B2C_INITIATOR_NAME=your_initiator
MPESA_B2C_INITIATOR_PASSWORD=your_password
MPESA_B2C_SHORTCODE=your_b2c_shortcode
MPESA_B2C_RESULT_URL=https://yourdomain.com/api/mpesa/b2c/result
MPESA_B2C_QUEUE_URL=https://yourdomain.com/api/mpesa/b2c/queue
MPESA_B2C_SECURITY_CREDENTIAL=encrypted_credential
```

### 9. Setup Sentry (automated)

```bash
cd ../shop
npx @sentry/wizard@latest -i nextjs
# Follow the prompts — it auto-generates sentry.client.config.ts etc.
```

### 10. Deploy

```bash
cd ../shop
chmod +x scripts/deploy.sh
bash scripts/deploy.sh
```

---

## Credential sources

| Credential | Where to get it |
|---|---|
| Supabase URL + keys | supabase.com → Project Settings → API |
| Google Maps key | console.cloud.google.com → APIs → Maps JavaScript API |
| Firebase config | console.firebase.google.com → Project Settings → Web App |
| Firebase VAPID key | Project Settings → Cloud Messaging → Web Push certificates |
| Firebase service account | Project Settings → Service accounts → Generate new key |
| Safaricom Daraja | developer.safaricom.co.ke → Create app |
| Daraja B2C access | developer.safaricom.co.ke → Apply for B2C |
| Sentry DSN | sentry.io → Projects → Settings → Client Keys |

---

## What's fully done after merging

| Feature | Status |
|---|---|
| Auth (phone + OTP + role) | ✅ |
| Customer home, store, cart | ✅ |
| M-Pesa STK Push (rate-limited) | ✅ |
| Order tracking (real-time + Google Maps) | ✅ |
| Inbox + calls | ✅ |
| Explore + search | ✅ |
| Orders history + reviews | ✅ |
| Customer profile | ✅ |
| Vendor registration (real file uploads) | ✅ |
| Vendor dashboard (orders/menu/earnings) | ✅ |
| Rider view (accept/deliver flow) | ✅ |
| Admin panel (vendors/riders/zones/payouts) | ✅ |
| Supabase Storage (vendor docs) | ✅ |
| Google Maps (live rider tracking) | ✅ |
| M-Pesa B2C payouts (vendors + riders) | ✅ |
| Push notifications (FCM + edge function) | ✅ |
| Rate limiting (orders + STK push) | ✅ |
| Sentry error monitoring | ✅ |
| Vercel deployment | ✅ |

**That's everything. Shop is production-ready.**
