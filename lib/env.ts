/**
 * Fails loudly at import time instead of producing a broken Supabase client
 * with `undefined` credentials (which surfaces as a confusing 401 at runtime).
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Copy .env.example to .env.local and fill it in.`,
    )
  }
  return value
}

// NEXT_PUBLIC_* must be referenced literally — Next inlines them at build time,
// so process.env[name] with a dynamic key does NOT work in client bundles.
export const SUPABASE_URL = required(
  'NEXT_PUBLIC_SUPABASE_URL',
  process.env.NEXT_PUBLIC_SUPABASE_URL,
)

export const SUPABASE_PUBLISHABLE_KEY = required(
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
)
