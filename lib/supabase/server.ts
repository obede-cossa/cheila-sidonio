import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@/lib/env'

/**
 * Cookie-bound client. Use in Server Components and Server Actions whenever the
 * couple's session matters (dashboard reads, inserts, updates, deletes).
 */
export async function createServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Called from a Server Component: cookies are read-only there.
          // proxy.ts refreshes the session, so this is safe to swallow.
        }
      },
    },
  })
}
