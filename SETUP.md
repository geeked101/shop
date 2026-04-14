# Shop App — Next.js Implementation

## Quick Start

```bash
npm install
cp .env.local.example .env.local  # fill in your keys
npm run dev
```

---

## Setup Steps

### 1. Supabase
1. Create project at https://supabase.com
2. Run `supabase-schema.sql` in SQL Editor
3. Enable Phone Auth: Authentication > Providers > Phone
4. Copy URL + anon key to `.env.local`

### 2. M-Pesa Daraja
1. Register at https://developer.safaricom.co.ke
2. Create app → get Consumer Key + Secret
3. For sandbox: use shortcode `174379`, passkey from Daraja portal
4. Set `MPESA_CALLBACK_URL` to your deployed URL + `/api/mpesa/callback`
5. For production: go live on Daraja, update `MPESA_ENV=production`

### 3. Deploy to Vercel
```bash
npm install -g vercel
vercel login
vercel --prod
```
Add env vars in Vercel dashboard or via `vercel env add`

---

## Project Structure

```
src/
├── app/
│   ├── auth/           login · otp · role
│   ├── customer/       home · store · cart · track · inbox · explore · orders · profile
│   ├── vendor/         register · dashboard
│   ├── rider/          deliveries
│   ├── admin/          dashboard
│   └── api/
│       ├── orders/           POST create, GET list
│       ├── mpesa/stk/        POST STK push
│       ├── mpesa/callback/   POST Daraja callback
│       ├── admin/vendors/    PATCH approve/reject
│       ├── admin/zones/      PATCH toggle
│       ├── rider/location/   PATCH GPS update
│       └── payouts/          POST pay vendor/rider
├── components/
│   ├── customer/       CustomerHome · StoreView
│   ├── vendor/         VendorDashboard
│   ├── admin/          AdminDashboard
├── lib/
│   ├── supabase.ts     browser client
│   ├── supabase-server.ts  server client
│   ├── mpesa.ts        Daraja STK push + callback
│   └── distance.ts     Haversine + fare calc
├── store/              Zustand cart + app state
└── types/              TypeScript types + calculateFare()
```

---

## Fare Formula
```
delivery_fee = base_fare + (distance_km × per_km_rate)
            = KES 50    + (km × KES 12.5)

rider_earnings = delivery_fee × 0.80
platform_cut   = delivery_fee × 0.20
```

---

## Remaining (Production Hardening)

| Item | Status | Notes |
|------|--------|-------|
| Supabase Storage | ⚠ Wired up | Need bucket setup for vendor docs/logos |
| Push notifications | ⚠ Pending | Use Supabase Realtime → FCM/Web Push |
| Google Maps | ⚠ Pending | Replace map placeholders with real Maps SDK |
| M-Pesa B2C payouts | ⚠ Mock | Wire `mpesa.ts` B2C endpoint for real payouts |
| Rate limiting | ⚠ Pending | Add to API routes before production |
| Error monitoring | ⚠ Pending | Add Sentry |

---

## Zones (configurable via Admin > Zones)
CBD, Westlands, Roysambu, Kilimani, Lavington,
South B, South C, Mutomo, Parklands, Kasarani, Eastleigh, Ngong Rd

## Commission
- Platform: 12% per order (vendor pays)
- Rider: 80% of delivery fee
