'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import { deleteGift, saveGift } from '@/app/actions'
import type { ActionResult, Gift } from '@/lib/types'

const dateFormat = new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short', timeStyle: 'short' })
const currency = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })

const inputClass = 'rounded-xl border border-input bg-background px-4 py-3'

export function DashboardTable({ gifts }: { gifts: Gift[] }) {
  const [editing, setEditing] = useState<Partial<Gift> | null>(null)
  const [isDeleting, startDelete] = useTransition()
  const [error, setError] = useState('')
  const [state, formAction] = useActionState<ActionResult | null, FormData>(saveGift, null)

  // Close the form once the save succeeds.
  useEffect(() => {
    if (state?.ok) setEditing(null)
  }, [state])

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
            className={inputClass}
          />
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

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
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

        {gifts.map((gift) => (
          <div
            key={gift.id}
            className="grid gap-3 border-b border-border px-5 py-4 last:border-0 md:grid-cols-[1fr_140px_180px_120px] md:items-center md:gap-4"
          >
            <div>
              <p className="font-medium">{gift.title}</p>
              <p className="text-sm text-muted-foreground">
                {gift.price !== null ? currency.format(gift.price) : 'Livre'}
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
