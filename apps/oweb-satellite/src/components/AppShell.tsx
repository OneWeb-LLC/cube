import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { LayoutDashboard, LogOut, Table2 } from 'lucide-react'

import { useAuth } from '@/lib/auth/auth-context'
import { CUBE_APP_ID, getOwebAppUrl } from '@/lib/cube/constants'

export function AppShell({ children }: { children: ReactNode }) {
  const { user, oneId, signOut } = useAuth()
  const owebUrl = getOwebAppUrl()

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)] text-[var(--sea-ink)]">
      <aside className="flex w-56 flex-col border-r border-[var(--line)] bg-[var(--surface-strong)]">
        <div className="border-b border-[var(--line)] px-4 py-4">
          <p className="island-kicker">OWeb satellite</p>
          <p className="display-title text-lg">Cube</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3 text-sm">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-[var(--surface)] [&.active]:bg-[var(--surface)] [&.active]:text-[var(--lagoon-deep)]"
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
          <Link
            to="/explore"
            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-[var(--surface)] [&.active]:bg-[var(--surface)] [&.active]:text-[var(--lagoon-deep)]"
          >
            <Table2 size={16} />
            Explore
          </Link>
        </nav>
        <div className="border-t border-[var(--line)] p-3 text-xs text-[var(--sea-ink-soft)]">
          <p className="truncate">{oneId ? `@${oneId}` : user?.email}</p>
          <div className="mt-2 flex flex-col gap-1">
            <a href={`${owebUrl}/app-store`} className="hover:text-[var(--sea-ink)]">
              App Store
            </a>
            <a href={`${owebUrl}/apps/${CUBE_APP_ID}`} className="hover:text-[var(--sea-ink)]">
              Cube in OWeb
            </a>
            <button
              type="button"
              onClick={() => void signOut()}
              className="mt-1 inline-flex items-center gap-1 text-left hover:text-[var(--sea-ink)]"
            >
              <LogOut size={12} />
              Sign out
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
