'use client'

import { memo } from 'react'

import type { Gift } from '@/lib/types'

const currency = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
})

type Props = {
  gift: Gift
  index: number
  pending: boolean
  onReserve: (id: string) => void
}

function GiftCardImpl({ gift, pending, onReserve }: Props) {
  const title = gift.link_url ? (
    <a
      href={gift.link_url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-primary"
    >
      {gift.title}
    </a>
  ) : (
    gift.title
  )

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
          {gift.category}
        </span>

        {gift.is_reserved && (
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            Reservado
          </span>
        )}
      </div>

      <h3 className="mt-4 font-serif text-xl">
        {title}
      </h3>

      {gift.description && (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {gift.description}
        </p>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-base font-medium">
          {gift.price !== null
            ? currency.format(gift.price)
            : 'À vossa escolha'}
        </span>

        <button
          type="button"
          disabled={gift.is_reserved || pending}
          onClick={() => onReserve(gift.id)}
          className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:bg-muted disabled:text-muted-foreground"
        >
          {gift.is_reserved ? 'Agradecemos' : 'Reservar'}
        </button>
      </div>
    </article>
  )
}

export const GiftCard = memo(GiftCardImpl)