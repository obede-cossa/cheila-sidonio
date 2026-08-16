/**
 * Validates Supabase credentials at import time.
 *
 * A malformed URL here does not fail loudly on its own — it surfaces much later
 * as PGRST125 ("Invalid path specified in request URL") on every REST call and
 * as an opaque auth failure on every login, because both clients build their
 * paths by appending to this value.
 */

function required(name: string, value: string | undefined): string {
  const trimmed = value?.trim()
  if (!trimmed) {
    throw new Error(
      `Missing environment variable: ${name}. Copy .env.example to .env.local and fill it in.`,
    )
  }
  return trimmed
}

function normalizeSupabaseUrl(raw: string): string {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL is not a valid URL: ${JSON.stringify(raw)}. ` +
        `Expected something like https://abcdefgh.supabase.co`,
    )
  }

  if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
    throw new Error(`NEXT_PUBLIC_SUPABASE_URL must use https. Got: ${url.protocol}//`)
  }

  // This is the one that causes PGRST125. The Supabase clients append
  // /rest/v1 and /auth/v1 themselves, so any path here gets doubled up.
  const path = url.pathname.replace(/\/+$/, '')
  if (path !== '') {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL must be the bare project URL with no path. ` +
        `Got a path of "${path}" — remove it. ` +
        `Correct: ${url.protocol}//${url.host}`,
    )
  }

  if (url.search || url.hash) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must not contain a query string or fragment.')
  }

  // Returned without a trailing slash so `${url}/rest/v1` never doubles up.
  return `${url.protocol}//${url.host}`
}

function validateKey(raw: string): string {
  const looksPublishable = raw.startsWith('sb_publishable_')
  const looksLegacyAnon = raw.startsWith('eyJ')

  if (raw.startsWith('sb_secret_') || raw.startsWith('service_role')) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY looks like a service-role/secret key. ' +
        'That key bypasses RLS and must never be exposed to the browser. ' +
        'Use the publishable (or legacy anon) key.',
    )
  }

  if (!looksPublishable && !looksLegacyAnon) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY does not look like a Supabase key. ' +
        'Expected it to start with sb_publishable_ or eyJ.',
    )
  }

  return raw
}

export const SUPABASE_URL = normalizeSupabaseUrl(
  required('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
)

export const SUPABASE_PUBLISHABLE_KEY = validateKey(
  required(
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
)
