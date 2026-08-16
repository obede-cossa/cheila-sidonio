'use client'

import Image from 'next/image'
import { memo } from 'react'

import type { Gift } from '@/lib/types'

/**
 * Replaces the four random Unsplash photos. Those were misleading — a guest
 * could not tell a real product photo from a stock one.
 */
const PLACEHOLDER = '/gift-placeholder.jpg'

const currency = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })

type Props = {
  gift: Gift
  index: number
  pending: boolean
  onReserve: (id: string) => void
}

function GiftCardImpl({ gift, index, pending, onReserve }: Props) {
  const image = gift.image_url || PLACEHOLDER

  const title = gift.link_url ? (
    <a href={gift.link_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
      {gift.title}
    </a>
  ) : (
    gift.title
  )

  return (
    // Row on phones (image left, content right), stacked card from sm upwards.
    <article className="flex flex-row overflow-hidden rounded-2xl border border-border bg-card sm:flex-col">
      <div className="relative w-28 shrink-0 self-stretch bg-secondary sm:aspect-[4/3] sm:w-full sm:self-auto">
        <Image
          src={image}
          alt=""
          fill
          loading={index < 3 ? 'eager' : 'lazy'}
          sizes="(max-width: 640px) 112px, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        {/* Overlay badges only make sense on the larger image. */}
        <span className="absolute top-4 left-4 hidden rounded-full bg-background/90 px-3 py-1 text-xs font-medium sm:inline">
          {gift.category}
        </span>
        {gift.is_reserved && (
          <span className="absolute top-4 right-4 hidden rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground sm:inline">
            Reservado
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        {/* Mobile-only meta line, replacing the overlay badges. */}
        <p className="flex items-center gap-2 text-xs text-muted-foreground sm:hidden">
          <span>{gift.category}</span>
          {gift.is_reserved && (
            <>
              <span aria-hidden>·</span>
              <span className="text-primary">Reservado</span>
            </>
          )}
        </p>

        <h3 className="mt-1 truncate font-serif text-lg sm:mt-0 sm:text-xl sm:whitespace-normal">
          {title}
        </h3>

        <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground sm:mt-2 sm:line-clamp-none sm:min-h-12">
          {gift.description}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3 sm:mt-5">
          <span className="text-sm font-medium sm:text-base">
            {gift.price !== null ? currency.format(gift.price) : 'À vossa escolha'}
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
      </div>
    </article>
  )
}

export const GiftCard = memo(GiftCardImpl)
