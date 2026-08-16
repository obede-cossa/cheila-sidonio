export type Gift = {
  id: string
  title: string
  description: string | null
  category: string
  image_url: string | null
  link_url: string | null
  price: number | null
  is_reserved: boolean
  reserved_at: string | null
}

/** Columns the public list needs. Keep in sync with the select() in app/page.tsx. */
export const GIFT_COLUMNS =
  'id,title,description,category,image_url,link_url,price,is_reserved,reserved_at'

export type ActionResult = { ok: true } | { ok: false; error: string }
