'use client'

import {
  useActionState,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react'
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react'

import { deleteGift, saveGift } from '@/app/actions'
import type { ActionResult, Gift } from '@/lib/types'

const dateFormat = new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short', timeStyle: 'short' })
const currency = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })

const inputClass = 'rounded-xl border border-input bg-background px-4 py-3'
const controlClass = 'rounded-xl bg-secondary px-3 py-2 text-sm outline-none'

type Status = 'todos' | 'disponivel' | 'reservado'
type Sort = 'recentes' | 'antigos' | 'nome' | 'preco-desc' | 'preco-asc' | 'reserva'

const SORT_LABELS: Record<Sort, string> = {
  recentes: 'Adicionados (recentes)',
  antigos: 'Adicionados (antigos)',
  nome: 'Nome (A-Z)',
  'preco-desc': 'Preço (maior)',
  'preco-asc': 'Preço (menor)',
  reserva: 'Reservados primeiro',
}

export function DashboardTable({ gifts }: { gifts: Gift[] }) {
  const [editing, setEditing] = useState<Partial<Gift> | null>(null)
  const [isDeleting, startDelete] = useTransition()
  const [error, setError] = useState('')
  const [state, formAction] = useActionState<ActionResult | null, FormData>(saveGift, null)

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('todas')
  const [status, setStatus] = useState<Status>('todos')
  const [sort, setSort] = useState<Sort>('recentes')

  const deferredQuery = useDeferredValue(query)

  useEffect(() => {
    if (state?.ok) setEditing(null)
  }, [state])

  const categories = useMemo(
    () => Array.from(new Set(gifts.map((gift) => gift.category))).sort(),
    [gifts],
  )

  const stats = useMemo(() => {
    const reserved = gifts.filter((gift) => gift.is_reserved)
    const priced = gifts.filter((gift) => gift.price !== null)
    return {
      total: gifts.length,
      reserved: reserved.length,
      available: gifts.length - reserved.length,
      // Sum of what guests have committed to, ignoring open-value gifts.
      reservedValue: reserved.reduce((sum, gift) => sum + (gift.price ?? 0), 0),
      missingPrice: gifts.length - priced.length,
      missingImage: gifts.filter((gift) => !gift.image_url).length,
    }
  }, [gifts])

  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase()

    const matches = gifts.filter((gift) => {
      if (category !== 'todas' && gift.category !== category) return false
      if (status === 'disponivel' && gift.is_reserved) return false
      if (status === 'reservado' && !gift.is_reserved) return false
      if (!needle) return true
      return (
        gift.title.toLowerCase().includes(needle) ||
        gift.category.toLowerCase().includes(needle) ||
        (gift.description?.toLowerCase().includes(needle) ?? false)
      )
    })

    return matches.sort((a, b) => {
      switch (sort) {
        case 'nome':
          return a.title.localeCompare(b.title, 'pt')
        case 'preco-desc':
          return (b.price ?? -1) - (a.price ?? -1)
        case 'preco-asc':
          return (a.price ?? Infinity) - (b.price ?? Infinity)
        case 'reserva':
          return Number(b.is_reserved) - Number(a.is_reserved)
        case 'antigos':
          return 0
        default:
          return 0
      }
    })
  }, [gifts, deferredQuery, category, status, sort])

  // The server already returns oldest-first; 'recentes' just reverses that.
  const ordered = useMemo(
    () => (sort === 'recentes' ? [...filtered].reverse() : filtered),
    [filtered, sort],
  )

  const isFiltered = query !== '' || category !== 'todas' || status !== 'todos'

  function resetFilters() {
    setQuery('')
    setCategory('todas')
    setStatus('todos')
  }

  function handleDelete(gift: Gift) {
    if (!confirm(`Apagar "${gift.title}"? Esta acção não pode ser desfeita.`)) return
    setError('')
    startDelete(async () => {
      const result = await deleteGift(gift.id)
      if (!result.ok) setError(result.error)
    })
  }

  return (
    <>
      <dl className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Presentes" value={String(stats.total)} />
        <Stat label="Disponíveis" value={String(stats.available)} />
        <Stat label="Reservados" value={String(stats.reserved)} />
        <Stat
          label="Valor reservado"
          value={currency.format(stats.reservedValue)}
          hint={stats.missingPrice > 0 ? `${stats.missingPrice} sem preço` : undefined}
        />
      </dl>

      {stats.missingImage > 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          {stats.missingImage}{' '}
          {stats.missingImage === 1 ? 'presente usa' : 'presentes usam'} a imagem genérica das
          alianças. Adicionem um URL para os distinguir na lista.
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => setEditing({})}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Adicionar presente
        </button>
      </div>

      {editing && (
        <form
          action={formAction}
          key={editing.id ?? 'new'}
          className="mt-8 grid gap-3 rounded-2xl border border-border bg-card p-5 md:grid-cols-2"
        >
          <input type="hidden" name="id" defaultValue={editing.id ?? ''} />
          <input
            required
            name="title"
            defaultValue={editing.title ?? ''}
            placeholder="Nome do presente"
            className={inputClass}
          />
          <input
            name="category"
            defaultValue={editing.category ?? ''}
            placeholder="Categoria"
            list="categorias"
            className={inputClass}
          />
          <datalist id="categorias">
            {categories.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
          <textarea
            name="description"
            defaultValue={editing.description ?? ''}
            placeholder="Descrição"
            className={`${inputClass} md:col-span-2`}
          />
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={editing.price ?? ''}
            placeholder="Preço"
            className={inputClass}
          />
          <input
            name="image_url"
            type="url"
            defaultValue={editing.image_url ?? ''}
            placeholder="URL da imagem (opcional)"
            className={inputClass}
          />
          <input
            name="link_url"
            type="url"
            defaultValue={editing.link_url ?? ''}
            placeholder="Link da loja (opcional)"
            className={`${inputClass} md:col-span-2`}
          />
          {state && !state.ok && (
            <p role="alert" className="text-sm text-destructive md:col-span-2">
              {state.error}
            </p>
          )}
          <div className="flex gap-3 md:col-span-2">
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-full border border-border px-5 py-2 text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-3 px-3">
          <Search className="h-5 w-5 text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar por nome, descrição ou categoria..."
            aria-label="Pesquisar presentes"
            className="w-full bg-transparent py-2 outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filtrar por categoria"
            className={controlClass}
          >
            <option value="todas">Todas as categorias</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as Status)}
            aria-label="Filtrar por estado"
            className={controlClass}
          >
            <option value="todos">Todos os estados</option>
            <option value="disponivel">Disponíveis</option>
            <option value="reservado">Reservados</option>
          </select>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as Sort)}
            aria-label="Ordenar"
            className={controlClass}
          >
            {(Object.keys(SORT_LABELS) as Sort[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>

          {isFiltered && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm"
            >
              <X className="h-4 w-4" /> Limpar
            </button>
          )}
        </div>
      </div>

      {isFiltered && (
        <p className="mt-3 text-sm text-muted-foreground">
          A mostrar {ordered.length} de {stats.total}.
        </p>
      )}

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="hidden grid-cols-[1fr_140px_180px_120px] gap-4 border-b border-border bg-secondary/50 px-5 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase md:grid">
          <span>Presente</span>
          <span>Categoria</span>
          <span>Estado</span>
          <span>Acções</span>
        </div>

        {gifts.length === 0 && (
          <p className="px-5 py-10 text-center text-muted-foreground">
            Ainda não há presentes. Adicionem o primeiro.
          </p>
        )}

        {gifts.length > 0 && ordered.length === 0 && (
          <p className="px-5 py-10 text-center text-muted-foreground">
            Nenhum presente corresponde a estes filtros.
          </p>
        )}

        {ordered.map((gift) => (
          <div
            key={gift.id}
            className="grid gap-3 border-b border-border px-5 py-4 last:border-0 md:grid-cols-[1fr_140px_180px_120px] md:items-center md:gap-4"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{gift.title}</p>
              <p className="text-sm text-muted-foreground">
                {gift.price !== null ? currency.format(gift.price) : 'Livre'}
                {!gift.image_url && ' · sem imagem'}
              </p>
            </div>
            <span className="text-sm text-muted-foreground">{gift.category}</span>
            <span className="text-sm">
              {gift.is_reserved
                ? `Reservado ${gift.reserved_at ? dateFormat.format(new Date(gift.reserved_at)) : ''}`
                : 'Disponível'}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(gift)}
                className="rounded-lg border border-border p-2"
                aria-label={`Editar ${gift.title}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDelete(gift)}
                className="rounded-lg border border-border p-2 text-destructive disabled:opacity-50"
                aria-label={`Apagar ${gift.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4">
      <dt className="text-xs tracking-wider text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-1 font-serif text-3xl">{value}</dd>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
