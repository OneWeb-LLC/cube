import { supabase } from '@/integrations/supabase/client'

export async function fetchOneIdHandle(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('one_id_profiles')
    .select('one_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.warn('[cube] one_id lookup failed', error.message)
    return null
  }
  return (data as { one_id?: string } | null)?.one_id ?? null
}

export function oneIdFromUserMetadata(user: { user_metadata?: Record<string, unknown> }): string | null {
  const raw = user.user_metadata?.one_id
  return typeof raw === 'string' && raw.length > 0 ? raw : null
}
