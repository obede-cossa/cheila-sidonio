# Setup

This is the **complete** project, not a patch. Do not merge it into the old
folder — replace it.

```bash
pnpm install
cp .env.example .env.local     # then fill in the two Supabase values
pnpm dev
```

## Environment variables

| Variable | Required |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes — bare project URL, no trailing slash, no `/rest/v1` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes — publishable (`sb_publishable_…`) or legacy anon (`eyJ…`) |
| `NEXT_PUBLIC_SITE_URL` | no — Open Graph only |

`lib/env.ts` validates both at startup and throws a readable message rather than
letting a bad URL surface later as `PGRST125`.

## Database

Run once in the Supabase SQL editor, in this order:

1. `supabase/schema.sql` — table, index, RLS policies, `reserve_gift()`
2. `supabase/policies-hardening.sql` — owner allowlist, missing columns

## Couple's login

There is no seeded account. Create one in
**Supabase → Authentication → Users → Add user**, tick **Auto Confirm User**,
then put that email into section 4 of `policies-hardening.sql` and run it.

Also turn off public signup: **Authentication → Sign In / Providers →** uncheck
"Allow new users to sign up". Otherwise a stranger can register, and only the
allowlist stands between them and your gift list.

## Troubleshooting

`node check-supabase.mjs` reads `.env.local` directly and hits the REST endpoint
with no Next.js in the way. Use it to tell "my credentials are wrong" apart from
"my app code is wrong".

## Next 15

Rename `proxy.ts` to `middleware.ts` and its exported `proxy` function to
`middleware`. Everything else is unchanged.
