import Link from 'next/link'
import { redirect } from 'next/navigation'

import { LoginForm } from '@/app/login/login-form'
import { createServerSupabase } from '@/lib/supabase/server'

export const metadata = { title: 'Área dos noivos' }

export default async function LoginPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <main className="grid min-h-screen place-items-center bg-secondary/30 p-5">
      <div className="w-full max-w-md rounded-3xl bg-card p-7 shadow-xl">
        <p className="text-sm text-primary">Espaço privado</p>
        <h1 className="mt-2 font-serif text-3xl">Área dos noivos</h1>
        <p className="mt-2 text-sm text-muted-foreground">Entrem para gerir a vossa lista.</p>
        <LoginForm />
        <Link
          href="/"
          className="mt-5 block text-center text-sm text-muted-foreground hover:text-primary"
        >
          Voltar à lista
        </Link>
      </div>
    </main>
  )
}
