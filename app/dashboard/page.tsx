import { redirect } from 'next/navigation'

import { signOut } from '@/app/actions'
import { DashboardTable } from '@/app/dashboard/dashboard-table'
import { createServerSupabase } from '@/lib/supabase/server'
import { GIFT_COLUMNS, type Gift } from '@/lib/types'

export const metadata = { title: 'Dashboard | Cheila & Sidonio' }

export default async function DashboardPage() {
  const supabase = await createServerSupabase()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // proxy.ts already blocks anonymous requests; this is the real gate.
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('gifts')
    .select(GIFT_COLUMNS)
    .order('created_at', { ascending: true })

  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-primary">Espaço privado</p>
          <h1 className="mt-2 font-serif text-5xl">Dashboard</h1>
          <p className="mt-3 text-muted-foreground">Gerir presentes e acompanhar reservas.</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="rounded-full border border-border px-5 py-3 text-sm">
            Sair
          </button>
        </form>
      </div>

      <DashboardTable gifts={(data ?? []) as Gift[]} />
    </section>
  )
}
