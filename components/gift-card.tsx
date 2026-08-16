'use client'

import Image from 'next/image'
import { memo } from 'react'

import type { Gift } from '@/lib/types'

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80',
]

// Built once instead of on every card render.
const currency = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })

type Props = {
  gift: Gift
  index: number
  pending: boolean
  onReserve: (id: string) => void
}

function GiftCardImpl({ gift, index, pending, onReserve }: Props) {
  const image = gift.image_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-[4/3] bg-secondary">
        <Image
          src={image}
          alt=""
          fill
          // First row is above the fold on most screens; the rest load lazily.
          loading={index < 3 ? 'eager' : 'lazy'}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        <span className="absolute top-4 left-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium">
          {gift.category}
        </span>
        {gift.is_reserved && (
          <span className="absolute top-4 right-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            Reservado
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-serif text-xl">
          {gift.link_url ? (
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
          )}
        </h3>
        <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{gift.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="font-medium">
            {gift.price !== null ? currency.format(gift.price) : 'À vossa escolha'}
          </span>
          <button
            type="button"
            disabled={gift.is_reserved || pending}
            onClick={() => onReserve(gift.id)}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:bg-muted disabled:text-muted-foreground"
          >
            {gift.is_reserved ? 'Agradecemos' : 'Reservar'}
          </button>
        </div>
      </div>
    </article>
  )
}

export const GiftCard = memo(GiftCardImpl)
