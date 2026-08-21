import type { Session, User } from '@supabase/supabase-js'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { supabase } from '@/integrations/supabase/client'
import { activateCubeApp } from '@/lib/cube/app-activation'
import { ensureCubeProfile } from '@/lib/cube/ensure-profile'
import { oneIdFromUserMetadata } from '@/lib/oneid'
import { persistWorkspaceId, readStoredWorkspaceId } from '@/lib/workspace/workspace-storage'

type AuthState = {
  user: User | null
  session: Session | null
  workspaceId: string | null
  oneId: string | null
  loading: boolean
  signOut: () => Promise<void>
  setWorkspaceId: (id: string) => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [workspaceId, setWorkspaceIdState] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setWorkspaceIdState(readStoredWorkspaceId())
      if (data.session?.user) {
        void activateCubeApp(data.session.user.id)
        void ensureCubeProfile(data.session.user)
      }
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setWorkspaceIdState(readStoredWorkspaceId())
      if (next?.user) {
        void activateCubeApp(next.user.id)
        void ensureCubeProfile(next.user)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setSession(null)
    if (typeof window !== 'undefined') window.location.assign('/login')
  }, [])

  const setWorkspaceId = useCallback((id: string) => {
    persistWorkspaceId(id)
    setWorkspaceIdState(id)
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      user: session?.user ?? null,
      session,
      workspaceId,
      oneId: session?.user ? oneIdFromUserMetadata(session.user) : null,
      loading,
      signOut,
      setWorkspaceId,
    }),
    [session, workspaceId, loading, signOut, setWorkspaceId],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
