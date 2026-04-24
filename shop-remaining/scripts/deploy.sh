#!/bin/bash
# =============================================================
# SHOP APP — VERCEL PRODUCTION DEPLOY SCRIPT
# Run from the /shop directory: bash scripts/deploy.sh
# =============================================================

set -e

echo "🏗  Building Shop for production..."
echo ""

# ── Step 1: Check required env vars ──────────────────────────
check_env() {
  if [ -z "${!1}" ]; then
    echo "❌ Missing env var: $1"
    echo "   Add it to .env.local or your Vercel project settings"
    exit 1
  fi
}

echo "🔍 Checking environment variables..."
check_env NEXT_PUBLIC_SUPABASE_URL
check_env NEXT_PUBLIC_SUPABASE_ANON_KEY
check_env SUPABASE_SERVICE_ROLE_KEY
check_env MPESA_CONSUMER_KEY
check_env MPESA_CONSUMER_SECRET
check_env MPESA_SHORTCODE
check_env MPESA_PASSKEY
check_env MPESA_CALLBACK_URL
check_env MPESA_ENV
echo "✅ All env vars present"
echo ""

# ── Step 2: Type check ────────────────────────────────────────
echo "🔷 Running TypeScript check..."
npx tsc --noEmit
echo "✅ TypeScript clean"
echo ""

# ── Step 3: Build ─────────────────────────────────────────────
echo "⚡ Building Next.js..."
npm run build
echo "✅ Build successful"
echo ""

# ── Step 4: Deploy to Vercel ──────────────────────────────────
echo "🚀 Deploying to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "Installing Vercel CLI..."
  npm install -g vercel
fi

# Deploy
vercel --prod \
  --env NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --env NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  --env SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  --env MPESA_CONSUMER_KEY="$MPESA_CONSUMER_KEY" \
  --env MPESA_CONSUMER_SECRET="$MPESA_CONSUMER_SECRET" \
  --env MPESA_SHORTCODE="$MPESA_SHORTCODE" \
  --env MPESA_PASSKEY="$MPESA_PASSKEY" \
  --env MPESA_CALLBACK_URL="$MPESA_CALLBACK_URL" \
  --env MPESA_ENV="$MPESA_ENV"

echo ""
echo "🎉 Shop is live!"
echo ""
echo "📋 Post-deploy checklist:"
echo "   1. Update MPESA_CALLBACK_URL to your Vercel domain"
echo "   2. Test M-Pesa STK push on sandbox"
echo "   3. Check Supabase Auth > Phone is enabled"
echo "   4. Verify /api/mpesa/callback is accessible publicly"
echo "   5. Register your Daraja callback URL on the Safaricom portal"
