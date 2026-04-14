import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_PATHS = ['/auth/login', '/auth/otp', '/auth/role']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return res

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // Role-based route protection
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  const role = profile?.role

  if (pathname.startsWith('/vendor') && role !== 'vendor') {
    return NextResponse.redirect(new URL('/customer/home', req.url))
  }
  if (pathname.startsWith('/rider') && role !== 'rider') {
    return NextResponse.redirect(new URL('/customer/home', req.url))
  }
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/customer/home', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/mpesa/callback).*)'],
}
