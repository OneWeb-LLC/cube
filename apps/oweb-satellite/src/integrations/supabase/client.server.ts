import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function getServerConfig() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for server client')
  }
  return { url, serviceKey }
}

let _admin: SupabaseClient | undefined

export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    const { url, serviceKey } = getServerConfig()
    _admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return _admin
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop, receiver) {
    return Reflect.get(getSupabaseAdmin(), prop, receiver)
  },
})

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get('Authorization') ?? ''
  const match = /^Bearer\s+(.+)$/i.exec(header)
  return match?.[1] ?? null
}

export function getSupabaseUserClient(accessToken: string): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const anon =
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!url || !anon) throw new Error('Missing Supabase URL or publishable key')
  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function getSupabaseUserClientFromRequest(request: Request): SupabaseClient {
  const token = getBearerToken(request)
  if (!token) throw new Error('missing_access_token')
  return getSupabaseUserClient(token)
}
