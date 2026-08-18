'use client'

import { useDeferredValue, useMemo, useOptimistic, useState, useTransition } from 'react'
import { Search, ShieldCheck } from 'lucide-react'

import { GiftCard } from '@/components/gift-card'
import { reserveGift } from '@/app/actions'
import type { Gift } from '@/lib/types'

type Sort = 'Recomendados' | 'Menor preço' | 'Maior preço'

export function GiftBrowser({ gifts }: { gifts: Gift[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')
  const [sort, setSort] = useState<Sort>('Recomendados')
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  const [optimisticGifts, markReserved] = useOptimistic(gifts, (state, id: string) =>
    state.map((gift) => (gift.id === id ? { ...gift, is_reserved: true } : gift)),
  )

  const deferredQuery = useDeferredValue(query)

  const categories = useMemo(
    () => ['Todos', ...Array.from(new Set(gifts.map((gift) => gift.category)))],
    [gifts],
  )

  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase()

    const matches = optimisticGifts.filter((gift) => {
      if (category !== 'Todos' && gift.category !== category) return false
      if (!needle) return true
      return (
        gift.title.toLowerCase().includes(needle) ||
        (gift.description?.toLowerCase().includes(needle) ?? false)
      )
    })

    return matches.sort((a, b) => {
      if (sort === 'Menor preço') return (a.price ?? 0) - (b.price ?? 0)
      if (sort === 'Maior preço') return (b.price ?? 0) - (a.price ?? 0)
      return Number(a.is_reserved) - Number(b.is_reserved)
    })
  }, [optimisticGifts, deferredQuery, category, sort])

  const available = optimisticGifts.filter((gift) => !gift.is_reserved).length

  function handleReserve(id: string) {
    setMessage('')
    startTransition(async () => {
      markReserved(id)
      const result = await reserveGift(id)
      setMessage(result.ok ? 'Presente reservado com carinho.' : result.error)
    })
  }

  return (
    <section id="lista" className="mx-auto max-w-6xl px-5 py-16">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="mt-2 font-serif text-4xl">Lista de presentes</h2>
          <p className="mt-3 text-muted-foreground">
            {available}{' '}
            {available === 1 ? 'presente ainda disponível' : 'presentes ainda disponíveis'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" /> 87 424 7084
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 md:flex-row">
        <div className="flex flex-1 items-center gap-3 px-3">
          <Search className="h-5 w-5 text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar presentes..."
            aria-label="Pesquisar presentes"
            className="w-full bg-transparent py-2 outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filtrar por categoria"
            className="rounded-xl bg-secondary px-3 py-2 text-sm outline-none"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as Sort)}
            aria-label="Ordenar"
            className="rounded-xl bg-secondary px-3 py-2 text-sm outline-none"
          >
            <option>Recomendados</option>
            <option>Menor preço</option>
            <option>Maior preço</option>
          </select>
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {filtered.length} presentes encontrados
      </p>

      {message && (
        <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm text-primary">{message}</p>
      )}

      {filtered.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border px-5 py-12 text-center text-muted-foreground">
          Nenhum presente corresponde à pesquisa. Limpem o filtro para ver a lista completa.
        </p>
      ) : (
        // Single-column list on phones (rows), grid of cards from sm upwards.
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {filtered.map((gift, index) => (
            <GiftCard
              key={gift.id}
              gift={gift}
              index={index}
              pending={isPending}
              onReserve={handleReserve}
            />
          ))}
        </div>
      )}
    </section>
  )
}
