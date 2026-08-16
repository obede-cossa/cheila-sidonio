import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next 16 renamed `middleware.ts` to `proxy.ts`. If you are still on Next 15,
 * rename this file to `middleware.ts` and export `middleware` instead of `proxy`.
 *
 * Two jobs:
 *  1. Refresh the Supabase session cookie before it expires.
 *  2. Bounce anonymous requests away from /dashboard.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  // Only run where a session actually matters. Keeping the public page out of
  // this matcher is what lets it stay prerendered.
  matcher: ['/dashboard/:path*', '/login'],
}
