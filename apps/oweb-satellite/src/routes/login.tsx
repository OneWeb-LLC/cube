import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { BarChart3 } from 'lucide-react'

import { ContinueWithOWebButton } from '@/components/continue-with-oweb'
import { supabase } from '@/integrations/supabase/client'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.assign('/dashboard')
    })
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--lagoon)] text-white">
            <BarChart3 size={22} />
          </div>
          <div>
            <h1 className="display-title text-xl text-[var(--sea-ink)]">Cube</h1>
            <p className="text-sm text-[var(--sea-ink-soft)]">Semantic analytics for OWeb</p>
          </div>
        </div>
        <p className="mb-6 text-sm leading-6 text-[var(--sea-ink-soft)]">
          Cube is an OWeb satellite. Sign in with your OWeb identity. Entitlements and workspace
          membership come from OWeb — Cube never bills separately.
        </p>
        <ContinueWithOWebButton className="w-full" />
        <p className="mt-4 text-center text-xs text-[var(--sea-ink-soft)]">
          After you sign in on oweb.one you will be returned here via SSO.
        </p>
      </div>
    </div>
  )
}
