import { createClient } from '@supabase/supabase-js'

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@/lib/env'

/**
 * Anonymous, session-free client used only for the public gift list.
 *
 * Deliberately does NOT read cookies. That keeps `app/page.tsx` out of dynamic
 * rendering, so the marketing shell is prerendered and only the gift query is
 * revalidated. Mutations call revalidateTag('gifts') to bust it.
 */
export const publicSupabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        // 60s is a safety net; reservations bust the tag immediately.
        next: { tags: ['gifts'], revalidate: 60 },
      } as RequestInit),
  },
})
