import type { User } from '@supabase/supabase-js'

import { supabase } from '@/integrations/supabase/client'
import { fetchOneIdHandle, oneIdFromUserMetadata } from '@/lib/oneid'

export async function ensureCubeProfile(user: User): Promise<void> {
  const oneId = oneIdFromUserMetadata(user) ?? (await fetchOneIdHandle(user.id))
  const displayName =
    (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === 'string' && user.user_metadata.name) ||
    user.email?.split('@')[0] ||
    'Analyst'

  const { error } = await supabase.from('cube_profiles').upsert(
    {
      id: user.id,
      one_id: oneId,
      display_name: displayName,
      email: user.email ?? null,
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )

  if (error) {
    console.warn('[cube] profile projection skipped', error.message)
  }
}
