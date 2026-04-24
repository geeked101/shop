// MERGE NOTE: Add Sentry to the main shop project.
//
// SETUP:
//   1. Create account at https://sentry.io
//   2. Create a Next.js project → copy DSN
//   3. npm install @sentry/nextjs
//   4. npx @sentry/wizard@latest -i nextjs  (auto-configures)
//   5. Add to .env.local:
//        NEXT_PUBLIC_SENTRY_DSN=https://xxx@oXXX.ingest.sentry.io/XXX
//        SENTRY_AUTH_TOKEN=your_auth_token  (for source maps)
//        SENTRY_ORG=your-org
//        SENTRY_PROJECT=shop

// ─── sentry.client.config.ts ──────────────────────────────────
export const SENTRY_CLIENT_CONFIG = `
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.05,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: false,
    }),
  ],
  // Don't log in dev unless explicitly enabled
  enabled: process.env.NODE_ENV === 'production' || process.env.SENTRY_DEBUG === 'true',
  beforeSend(event) {
    // Scrub M-Pesa phone numbers from error reports
    if (event.request?.data) {
      const data = event.request.data
      if (typeof data === 'string') {
        event.request.data = data.replace(/254[0-9]{9}/g, '254XXXXXXXXX')
      }
    }
    return event
  },
})
`

// ─── sentry.server.config.ts ──────────────────────────────────
export const SENTRY_SERVER_CONFIG = `
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  enabled: process.env.NODE_ENV === 'production',
})
`

// ─── sentry.edge.config.ts ────────────────────────────────────
export const SENTRY_EDGE_CONFIG = `
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === 'production',
})
`

// ─── next.config.ts (updated with Sentry) ─────────────────────
export const NEXT_CONFIG = `
import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // your existing config here
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Upload source maps for readable stack traces
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
})
`

// ─── src/lib/sentry.ts ────────────────────────────────────────
// Helper to capture M-Pesa errors with context
export const SENTRY_HELPERS = `
import * as Sentry from '@sentry/nextjs'

export function captureMpesaError(
  error: unknown,
  context: {
    orderId?: string
    amount?: number
    operation: 'stk-push' | 'callback' | 'b2c-payout'
  }
) {
  Sentry.withScope(scope => {
    scope.setTag('mpesa.operation', context.operation)
    if (context.orderId) scope.setTag('order.id', context.orderId)
    if (context.amount) scope.setExtra('amount', context.amount)
    Sentry.captureException(error)
  })
}

export function captureOrderError(
  error: unknown,
  context: { orderId?: string; userId?: string; action: string }
) {
  Sentry.withScope(scope => {
    scope.setTag('order.action', context.action)
    if (context.orderId) scope.setTag('order.id', context.orderId)
    if (context.userId) scope.setUser({ id: context.userId })
    Sentry.captureException(error)
  })
}
`
