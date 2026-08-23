import { redirect } from '@tanstack/react-router'

import { supabase } from '@/integrations/supabase/client'
import { isAuthRequired } from '@/lib/cube/constants'

export async function requireAuthSession(): Promise<void> {
  if (!isAuthRequired()) return
  if (typeof window === 'undefined') return
  const { data } = await supabase.auth.getSession()
  if (!data.session) throw redirect({ to: '/login' })
}

export async function redirectIfAuthenticated(to = '/dashboard'): Promise<void> {
  if (typeof window === 'undefined') return
  const { data } = await supabase.auth.getSession()
  if (data.session) throw redirect({ to })
}
