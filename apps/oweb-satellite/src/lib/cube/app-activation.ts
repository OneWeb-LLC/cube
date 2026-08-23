import { supabase } from '@/integrations/supabase/client'
import { CUBE_ACTIVATION_KIND, CUBE_APP_ID } from '@/lib/cube/constants'

export async function activateCubeApp(userId: string): Promise<void> {
  const { error } = await supabase.rpc('ao_upsert_app_activation', {
    p_app_id: CUBE_APP_ID,
    p_user_id: userId,
    p_activation_kind: CUBE_ACTIVATION_KIND,
  })
  if (error) console.warn('[cube] app activation failed', error.message)
}
