import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { AppShell } from '@/components/AppShell'
import { useAuth } from '@/lib/auth/auth-context'
import { requireAuthSession } from '@/lib/auth/route-guards'
import { CUBE_APP_ID, getOwebAppUrl, owebLoginUrl } from '@/lib/cube/constants'
import { fetchMyWorkspaces } from '@/lib/workspace/workspace-queries'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => requireAuthSession(),
  component: DashboardPage,
})

function DashboardPage() {
  const { user, oneId, loading, workspaceId, setWorkspaceId } = useAuth()
  const owebUrl = getOwebAppUrl()

  const workspacesQuery = useQuery({
    queryKey: ['cube-workspaces', user?.id],
    queryFn: () => fetchMyWorkspaces(user!.id),
    enabled: Boolean(user?.id),
  })

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] text-sm text-[var(--sea-ink-soft)]">
        Loading session…
      </div>
    )
  }

  return (
    <AppShell>
      <h1 className="display-title text-2xl">Dashboard</h1>
      <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
        Signed in as {user?.email}
        {oneId ? ` · @${oneId}` : ''}
      </p>

      <section className="mt-8">
        <h2 className="island-kicker">Workspaces</h2>
        {workspacesQuery.isLoading && (
          <p className="mt-3 text-sm text-[var(--sea-ink-soft)]">Loading workspaces…</p>
        )}
        {workspacesQuery.error && (
          <p className="mt-3 text-sm text-red-600">{(workspacesQuery.error as Error).message}</p>
        )}
        <ul className="mt-3 space-y-2">
          {(workspacesQuery.data ?? []).map((ws) => (
            <li key={ws.id}>
              <button
                type="button"
                className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-left hover:border-[var(--lagoon)]"
                onClick={() => {
                  setWorkspaceId(ws.id)
                  window.location.assign('/explore')
                }}
              >
                <p className="font-medium">{ws.name}</p>
                <p className="text-xs text-[var(--sea-ink-soft)]">
                  Role {ws.role} · {ws.id === workspaceId ? 'active' : 'select'}
                </p>
              </button>
            </li>
          ))}
        </ul>
        {(workspacesQuery.data ?? []).length === 0 && !workspacesQuery.isLoading && (
          <p className="mt-3 text-sm text-[var(--sea-ink-soft)]">
            No OWeb workspaces found for this account.{' '}
            <a className="text-[var(--lagoon-deep)]" href={`${owebUrl}/orgs`}>
              Open OWeb
            </a>
          </p>
        )}
      </section>

      <p className="mt-8 text-xs text-[var(--sea-ink-soft)]">
        App id <code>{CUBE_APP_ID}</code>. Continue with OWeb lives at{' '}
        <code>{owebLoginUrl({ launch: true })}</code>.
      </p>
    </AppShell>
  )
}
