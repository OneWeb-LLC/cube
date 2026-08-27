import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { BarChart3 } from 'lucide-react'

import { ContinueWithOWebButton } from '@/components/continue-with-oweb'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/lib/auth/auth-context'
import { ensureCubeProfile } from '@/lib/cube/ensure-profile'
import { owebOnboardingUrl } from '@/lib/cube/constants'
import { fetchMyWorkspaces } from '@/lib/workspace/workspace-queries'
import { persistWorkspaceId, readStoredWorkspaceId } from '@/lib/workspace/workspace-storage'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const { redirectIfAuthenticated } = await import('@/lib/auth/route-guards')
    await redirectIfAuthenticated('/dashboard')
  },
  component: LoginPage,
})

async function ensureWorkspaceAfterLogin(userId: string): Promise<string | null> {
  const existing = readStoredWorkspaceId()
  if (existing) return existing
  const workspaces = await fetchMyWorkspaces(userId)
  if (workspaces.length > 0) {
    const id = workspaces[0]!.id
    persistWorkspaceId(id)
    return id
  }
  return null
}

function LoginPage() {
  const auth = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.assign('/dashboard')
    })
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (busy) return

    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email address')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setBusy(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmed,
          password,
          options: { emailRedirectTo: window.location.origin },
        })
        if (signUpError) throw signUpError
        if (data.session?.user) {
          await ensureCubeProfile(data.session.user)
          const workspaceId = await ensureWorkspaceAfterLogin(data.session.user.id)
          if (!workspaceId) {
            window.location.assign(owebOnboardingUrl())
            return
          }
          auth.setWorkspaceId(workspaceId)
          window.location.assign('/dashboard')
          return
        }
        setMessage('Check your email to confirm your account.')
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmed,
          password,
        })
        if (signInError) throw signInError
        if (data.session?.user) {
          await ensureCubeProfile(data.session.user)
          const workspaceId = await ensureWorkspaceAfterLogin(data.session.user.id)
          if (!workspaceId) {
            window.location.assign(owebOnboardingUrl())
            return
          }
          auth.setWorkspaceId(workspaceId)
        }
        window.location.assign('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setBusy(false)
    }
  }

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
          Use your OWeb OneID — same email and password as oweb.one — or continue through OWeb SSO.
        </p>

        <ContinueWithOWebButton className="w-full" />

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--line)]" />
          <span className="text-xs text-[var(--sea-ink-soft)]">or</span>
          <div className="h-px flex-1 bg-[var(--line)]" />
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-[var(--sea-ink)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-white/70 px-4 py-2 text-sm text-[var(--sea-ink)] outline-none focus:border-[var(--lagoon)]"
              autoComplete="email"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-[var(--sea-ink)]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-white/70 px-4 py-2 text-sm text-[var(--sea-ink)] outline-none focus:border-[var(--lagoon)]"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-[var(--lagoon-deep)]">{message}</p> : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-[var(--lagoon)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--lagoon-deep)] disabled:opacity-50"
          >
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--sea-ink-soft)]">
          {mode === 'signin' ? (
            <>
              New here?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-medium text-[var(--lagoon-deep)] underline-offset-4 hover:underline"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-medium text-[var(--lagoon-deep)] underline-offset-4 hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
