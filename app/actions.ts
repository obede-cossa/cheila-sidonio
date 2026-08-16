'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import { createServerSupabase } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/types'

/**
 * Next 16 changed the cache invalidation API.
 *
 *   revalidateTag('gifts')              -> deprecated, TS2554 in Next 16
 *   revalidateTag('gifts', 'max')       -> stale-while-revalidate
 *   updateTag('gifts')                  -> expire now + refresh (read-your-writes)
 *
 * We want the last one. A guest who reserves a gift and reloads must see it
 * reserved immediately, and the couple must see their edits straight away.
 * Stale-while-revalidate would show them the old list on the next request.
 *
 * updateTag() is only callable from Server Actions, which is where all three
 * mutations below live. If you ever move one of these into a Route Handler,
 * that call has to become revalidateTag('gifts', 'max').
 */
function bustGifts() {
  updateTag('gifts')
  revalidatePath('/')
  revalidatePath('/dashboard')
}

/** Guests reserve without an account. The DB function is the source of truth. */
export async function reserveGift(giftId: string): Promise<ActionResult> {
  const supabase = await createServerSupabase()
  const { error } = await supabase.rpc('reserve_gift', { gift_id: giftId })

  if (error) {
    return { ok: false, error: 'Este presente já foi reservado.' }
  }

  bustGifts()
  return { ok: true }
}

export async function signIn(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  const supabase = await createServerSupabase()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { ok: false, error: 'Não foi possível entrar. Verifiquem os vossos dados.' }
  }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  redirect('/')
}

async function requireUser() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  return supabase
}

export async function saveGift(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await requireUser()

  const id = String(formData.get('id') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  if (!title) return { ok: false, error: 'O nome do presente é obrigatório.' }

  const rawPrice = String(formData.get('price') ?? '').trim()
  const price = rawPrice === '' ? null : Number(rawPrice)
  if (price !== null && (!Number.isFinite(price) || price < 0)) {
    return { ok: false, error: 'Preço inválido.' }
  }

  const payload = {
    title,
    description: String(formData.get('description') ?? '').trim() || null,
    category: String(formData.get('category') ?? '').trim() || 'Casa',
    price,
    link_url: String(formData.get('link_url') ?? '').trim() || null,
    image_url: String(formData.get('image_url') ?? '').trim() || null,
  }

  const { error } = id
    ? await supabase.from('gifts').update(payload).eq('id', id)
    : await supabase.from('gifts').insert(payload)

  if (error) return { ok: false, error: 'Não foi possível guardar o presente.' }

  bustGifts()
  return { ok: true }
}

export async function deleteGift(giftId: string): Promise<ActionResult> {
  const supabase = await requireUser()
  const { error } = await supabase.from('gifts').delete().eq('id', giftId)

  if (error) return { ok: false, error: 'Não foi possível apagar o presente.' }

  bustGifts()
  return { ok: true }
}
