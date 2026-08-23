import { createFileRoute } from '@tanstack/react-router'

import { AppShell } from '@/components/AppShell'
import { ExploreQueryBuilder } from '@/components/ExploreQueryBuilder'
import { useAuth } from '@/lib/auth/auth-context'
import { requireAuthSession } from '@/lib/auth/route-guards'

export const Route = createFileRoute('/explore')({
  beforeLoad: () => requireAuthSession(),
  component: ExplorePage,
})

function ExplorePage() {
  const { workspaceId, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] text-sm text-[var(--sea-ink-soft)]">
        Loading session…
      </div>
    )
  }

  return (
    <AppShell>
      <h1 className="display-title text-2xl">Explore</h1>
      <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
        Query OWeb workspace facts through Cube cubes. This satellite does not run CubeStore; it
        compiles Cube queries against the shared One OS database.
      </p>
      {!workspaceId && (
        <p className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm">
          Select a workspace on the dashboard first.
        </p>
      )}
      {workspaceId && <ExploreQueryBuilder workspaceId={workspaceId} />}
    </AppShell>
  )
}
