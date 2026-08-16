import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { CalendarDays, Heart, LockKeyhole, Sparkles } from 'lucide-react'

import { GiftBrowser } from '@/components/gift-browser'
import { SiteHeader } from '@/components/site-header'
import { publicSupabase } from '@/lib/supabase/public'
import { GIFT_COLUMNS, type Gift } from '@/lib/types'

const RING_IMAGE =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pngtree-wedding-rings-on-transparent-background-png-image_20428176-OIBSeApWWHfIjsO3zrgeT9J1wEFAcT.png'

async function getGifts(): Promise<{ gifts: Gift[]; error: string | null }> {
  const { data, error } = await publicSupabase
    .from('gifts')
    .select(GIFT_COLUMNS)
    .order('is_reserved', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    // This runs on the server: look in the `pnpm dev` terminal or the Vercel
    // function logs, not the browser console.
    console.error('[gifts] query failed', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    return { gifts: [], error: `${error.code ?? 'error'}: ${error.message}` }
  }

  return { gifts: (data ?? []) as Gift[], error: null }
}

async function GiftSection() {
  const { gifts, error } = await getGifts()

  // Fail loudly in development. In production guests see the normal empty
  // state rather than a Postgres error message.
  if (error && process.env.NODE_ENV !== 'production') {
    return (
      <section id="lista" className="mx-auto max-w-6xl px-5 py-16">
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6">
          <h2 className="font-serif text-2xl text-destructive">A query aos presentes falhou</h2>
          <pre className="mt-3 overflow-x-auto text-sm text-destructive">{error}</pre>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              <code>42703</code> — a coluna não existe. Compare GIFT_COLUMNS em{' '}
              <code>lib/types.ts</code> com a tabela real.
            </li>
            <li>
              <code>42P01</code> — a tabela <code>gifts</code> não existe. Corra{' '}
              <code>supabase/schema.sql</code>.
            </li>
            <li>
              Sem erro mas lista vazia — RLS activo sem policy de SELECT para <code>anon</code>, ou a
              tabela está mesmo vazia.
            </li>
          </ul>
        </div>
      </section>
    )
  }

  return <GiftBrowser gifts={gifts} />
}

function GiftSkeleton() {
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="aspect-[4/3] animate-pulse bg-secondary" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-2/3 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-full animate-pulse rounded bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section
        id="top"
        className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1fr_0.9fr] md:py-20"
      >
        <div>
          <p className="mb-5 flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-primary uppercase">
            <Sparkles className="h-4 w-4" /> O nosso novo começo
          </p>
          <h1 className="max-w-xl font-serif text-5xl leading-[1.05] tracking-tight text-balance md:text-7xl">
            Um presente para a nossa história.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground">
            A vossa presença é o nosso maior presente. Se quiserem celebrar connosco de uma forma
            especial, reunimos aqui algumas ideias para o nosso novo lar.
          </p>
          <a
            href="#lista"
            className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
          >
            Ver lista de presentes
          </a>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-secondary">
          <Image
            src="/couple-wedding.png"
            alt="Retrato dos noivos num jardim"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 45vw"
            className="object-cover"
          />
          <div className="absolute bottom-5 left-5 rounded-full bg-background/90 px-4 py-2 text-sm text-foreground">
            Com amor, Cheila &amp; Sidonio
          </div>
        </div>
      </section>

      <section className="border-y border-border/70 bg-secondary/35">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-5 text-sm text-muted-foreground">
          <Image
            src={RING_IMAGE}
            alt="Alianças douradas"
            width={48}
            height={48}
            className="h-12 w-12 object-contain"
          />
          <p>
            <strong className="text-foreground">Cada gesto conta.</strong> Obrigado por fazerem parte
            deste capítulo.
          </p>
        </div>
      </section>

      <Suspense
        fallback={
          <section className="mx-auto max-w-6xl px-5 py-16">
            <h2 className="font-serif text-4xl">Lista de presentes</h2>
            <GiftSkeleton />
          </section>
        }
      >
        <GiftSection />
      </Suspense>

      <section id="ajuda" className="bg-primary px-5 py-14 text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          <div>
            <Heart className="h-6 w-6" />
            <h3 className="mt-4 font-serif text-2xl">Feito com amor</h3>
            <p className="mt-2 text-sm leading-6 opacity-80">
              Cada presente foi pensado para acompanhar o nosso dia a dia.
            </p>
          </div>
          <div>
            <CalendarDays className="h-6 w-6" />
            <h3 className="mt-4 font-serif text-2xl">Reservem um presente</h3>
            <p className="mt-2 text-sm leading-6 opacity-80">
              A reserva demora apenas alguns segundos e não pede o vosso nome.
            </p>
          </div>
          <div>
            <LockKeyhole className="h-6 w-6" />
            <h3 className="mt-4 font-serif text-2xl">Sem complicações</h3>
            <p className="mt-2 text-sm leading-6 opacity-80">
              Os noivos apenas recebem a data e hora da reserva.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/70 px-5 py-8 text-center text-sm text-muted-foreground">
        <Link href="/login" className="hover:text-primary">
          Área dos noivos
        </Link>
      </footer>
    </main>
  )
}
