import { createFileRoute } from '@tanstack/react-router'

import { getSupabaseUserClientFromRequest } from '@/integrations/supabase/client.server'
import { cubeMeta } from '@/lib/cube/schema'

export const Route = createFileRoute('/api/cubejs/v1/meta')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const client = getSupabaseUserClientFromRequest(request)
          const { data, error } = await client.auth.getUser()
          if (error || !data.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
          }
          return Response.json(cubeMeta())
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unauthorized'
          return Response.json({ error: message }, { status: 401 })
        }
      },
    },
  },
})
