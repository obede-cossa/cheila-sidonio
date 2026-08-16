'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { signIn } from '@/app/actions'
import type { ActionResult } from '@/lib/types'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-5 w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60"
    >
      {pending ? 'A entrar...' : 'Entrar'}
    </button>
  )
}

export function LoginForm() {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(signIn, null)

  return (
    <form action={formAction}>
      <input
        required
        name="email"
        type="email"
        autoComplete="email"
        placeholder="Email"
        className="mt-6 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none"
      />
      <input
        required
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Palavra-passe"
        className="mt-3 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none"
      />
      {state && !state.ok && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  )
}
