import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/lib/auth/auth-context'
import { activateCubeApp } from '@/lib/cube/app-activation'
import { ensureCubeProfile } from '@/lib/cube/ensure-profile'
import { redeemSsoLaunchToken } from '@/lib/sso/sso.functions'
import { persistWorkspaceId } from '@/lib/workspace/workspace-storage'

export const Route = createFileRoute('/sso')({
  validateSearch: (search: Record<string, unknown>) => ({
    launch_token: typeof search.launch_token === 'string' ? search.launch_token : '',
  }),
  component: SsoPage,
})

function SsoPage() {
  const { launch_token } = Route.useSearch()
  const auth = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!launch_token) {
      setError('Missing launch token. Open Cube from the OWeb App Store or sign in again.')
      return
    }

    let cancelled = false

    void (async () => {
      try {
        const result = await redeemSsoLaunchToken({ data: { launchToken: launch_token } })
        if (cancelled) return

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: result.accessToken,
          refresh_token: result.refreshToken ?? '',
        })
        if (sessionError) throw sessionError

        persistWorkspaceId(result.orgId)
        auth.setWorkspaceId(result.orgId)

        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          await activateCubeApp(userData.user.id)
          await ensureCubeProfile(userData.user)
        }

        window.location.assign('/dashboard')
      } catch (e) {
        if (cancelled) return
        const message = e instanceof Error ? e.message : 'SSO failed'
        setError(message)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [launch_token, auth])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] px-4">
      <div className="max-w-md text-center">
        {error ? (
          <>
            <h1 className="text-lg font-semibold text-[var(--sea-ink)]">Could not sign you in</h1>
            <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">{error}</p>
            <a
              href="/login"
              className="mt-4 inline-block text-sm text-[var(--lagoon-deep)] underline-offset-4 hover:underline"
            >
              Back to sign in
            </a>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-[var(--sea-ink)]">Signing you in…</h1>
            <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
              Completing secure handoff from OWeb.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
