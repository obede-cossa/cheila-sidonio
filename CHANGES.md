# Refactor notes

Only changed/new files are in this archive. Drop them over the existing tree.

## Delete after copying

```
lib/supabase/client.ts   # nothing runs Supabase in the browser anymore
```

`components/ui/button.tsx` and `@base-ui/react` are dead code today (nothing
imports the button). They were left in place so a future `shadcn add` still
works — delete both together if you want them gone.

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | The publishable (`sb_publishable_...`) or legacy anon (`eyJ...`) key |
| `NEXT_PUBLIC_SITE_URL` | no | Absolute URL for Open Graph tags |

The old fallback chain `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || NEXT_PUBLIC_SUPABASE_ANON_KEY`
is gone. One name, one source of truth, and a startup error instead of a
mystery 401 when it is missing.

No service-role key. Every write runs as the couple's own session and is
enforced by RLS, so there is nothing to leak.

## Required before deploy

Run `supabase/schema.sql` in the SQL editor. Until you do, the anon key in the
browser can `DELETE FROM gifts` — the old `if (!authed) return` in `saveGift`
was UI decoration, not access control.

## What changed and why

**Rendering.** `app/page.tsx` was one 46-line `'use client'` file. The browser
had to download the bundle, hydrate, authenticate, then fetch gifts — a blank
page for the whole chain. It is now a Server Component that queries in the same
render pass, with the interactive list split into `components/gift-browser.tsx`.

**Caching.** The public page reads through `lib/supabase/public.ts`, a
cookie-free client tagged `gifts`. Because it never touches cookies, the shell
prerenders; mutations call `revalidateTag('gifts')`. The header links
unconditionally to `/login` for the same reason — an auth check there would
have forced the whole page dynamic.

**Images.** `unoptimized: true` plus raw `<img>` meant full-size Unsplash JPEGs,
eagerly, with no dimensions (layout shift). Now `next/image` with `sizes`,
lazy loading below the first row, and `priority` on the hero. Note the
`hostname: '**'` remote pattern in `next.config.mjs` — read the comment there,
it is a deliberate trade-off.

**Fonts.** `--font-serif: 'Cormorant Garamond'` was declared in CSS but never
loaded anywhere. Every heading was silently rendering in Georgia. Now
self-hosted via `next/font/google`.

**Reservations.** `reserve()` did an RPC then refetched the entire list. Now a
server action with `useOptimistic`, so the card flips instantly. The RPC itself
is rewritten as a single conditional `UPDATE ... WHERE is_reserved = false`,
which is what actually prevents two guests reserving the same gift.

**Bundle.** The dashboard was a boolean toggle in the same component, so every
guest downloaded the edit forms and delete handlers. It is now `/dashboard`,
gated by `proxy.ts` and re-checked server-side.

**Type safety.** `typescript.ignoreBuildErrors: true` is removed. Run
`pnpm typecheck` — if something fails, that error was already shipping.

## Smaller fixes

- Dead nav link `#historia` pointed at a section that does not exist — removed.
- The `SlidersHorizontal` button did nothing — removed.
- `link_url` was fetched and never rendered — the card title now links to it.
- `message` never cleared and had no `role="alert"`.
- Delete had no confirmation.
- `Intl` formatters hoisted to module scope instead of rebuilt per card.
- `select('*')` narrowed to an explicit column list (`lib/types.ts`).
- Empty-state and error-state copy added; `loadGifts` used to swallow failures
  into `data || []`.
- `eslint` and `eslint-config-next` added — `pnpm lint` previously crashed
  because neither was installed.

## Not done (deliberately)

- **Rate limiting on `reserve_gift`.** Anyone can reserve everything. A shared
  passphrase or a Turnstile check would fix it; scoped out here.
- **No optimistic rollback UI.** If the action fails, React reverts the card and
  the message explains why. Good enough at this scale.
- **Realtime.** Two guests on the page at once will not see each other's
  reservations until a reload. Supabase Realtime on the `gifts` table is the
  fix if you want it.

## Next 15 users

Rename `proxy.ts` to `middleware.ts` and rename the exported `proxy` function
to `middleware`. Everything else is unchanged.
