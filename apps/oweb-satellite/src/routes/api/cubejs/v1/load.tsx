import { createFileRoute } from '@tanstack/react-router'

import { getSupabaseUserClientFromRequest } from '@/integrations/supabase/client.server'
import { executeCubeQuery } from '@/lib/cube/query-engine.server'
import type { CubeQuery } from '@/lib/cube/schema'

export const Route = createFileRoute('/api/cubejs/v1/load')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const client = getSupabaseUserClientFromRequest(request)
          const { data, error } = await client.auth.getUser()
          if (error || !data.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
          }

          const body = (await request.json()) as { query?: CubeQuery }
          if (!body.query) {
            return Response.json({ error: 'query required' }, { status: 400 })
          }

          const workspaceId = request.headers.get('x-cube-workspace-id')
          const result = await executeCubeQuery(client, body.query, workspaceId)
          return Response.json(result)
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Query failed'
          const status = message === 'missing_access_token' || message === 'Unauthorized' ? 401 : 400
          return Response.json({ error: message }, { status })
        }
      },
    },
  },
})
