'use client'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || url === 'your_supabase_url') {
    // Return a stub during build/SSR when env vars aren't set
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithOtp: async () => ({ error: null }),
        verifyOtp: async () => ({ error: null }),
        signOut: async () => {},
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), order: () => ({ data: [], error: null }), limit: () => ({ data: [], error: null }) }) }),
        insert: async () => ({ data: null, error: null }),
        update: () => ({ eq: () => ({ data: null, error: null }) }),
        upsert: async () => ({ data: null, error: null }),
      }),
      channel: () => ({ on: () => ({ subscribe: () => {} }) }),
      removeChannel: () => {},
    } as any // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  return createBrowserClient(url, key)
}
