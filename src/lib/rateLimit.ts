// src/lib/rateLimit.ts
// In-memory rate limiter for API routes.
// For production, swap the Map for an Upstash Redis client.
//
// Usage in any API route:
//   import { rateLimit } from '@/lib/rateLimit'
//   const { success } = await rateLimit(req, 'stk-push', 5, 60)
//   if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

import { NextRequest } from 'next/server'

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store (process-scoped, resets on cold start)
// Replace with Redis for multi-instance deployments
const store = new Map<string, RateLimitEntry>()

/**
 * Rate limit a request.
 *
 * @param req       The incoming Next.js request
 * @param key       Namespace for this limit (e.g. 'stk-push', 'create-order')
 * @param limit     Max requests allowed per window
 * @param windowSec Window duration in seconds
 */
export async function rateLimit(
  req: NextRequest,
  key: string,
  limit: number,
  windowSec: number
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  // Use IP + key as the store key
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'anonymous'

  const storeKey = `${key}:${ip}`
  const now = Date.now()

  const entry = store.get(storeKey)

  if (!entry || entry.resetAt < now) {
    // New window
    const resetAt = now + windowSec * 1000
    store.set(storeKey, { count: 1, resetAt })
    return { success: true, remaining: limit - 1, resetAt }
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

// Cleanup old entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key)
    }
  }, 5 * 60 * 1000)
}
