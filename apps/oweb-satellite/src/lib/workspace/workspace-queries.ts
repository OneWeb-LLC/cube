import { supabase } from '@/integrations/supabase/client'

export type WorkspaceSummary = {
  id: string
  name: string
  slug: string
  role: string
}

export async function fetchMyWorkspaces(userId: string): Promise<WorkspaceSummary[]> {
  const { data: memberships, error: memberErr } = await supabase
    .from('ao_org_members')
    .select('org_id, role')
    .eq('user_id', userId)
    .is('left_at', null)

  if (memberErr) {
    console.warn('[cube] workspace memberships failed', memberErr.message)
    return []
  }

  const membershipRows = (memberships ?? []) as Array<{ org_id: string | null; role: string | null }>
  const orgIds = membershipRows
    .map((m) => m.org_id)
    .filter((id): id is string => Boolean(id))

  if (!orgIds.length) return []

  const { data: orgs, error: orgErr } = await supabase
    .from('ao_orgs')
    .select('id, name, slug')
    .in('id', orgIds)
    .order('name')

  if (orgErr) {
    console.warn('[cube] workspace orgs failed', orgErr.message)
    return []
  }

  const roleByOrg = new Map(
    membershipRows
      .filter((m): m is { org_id: string; role: string | null } => Boolean(m.org_id))
      .map((m) => [m.org_id, m.role ?? 'member']),
  )

  return (orgs ?? []).map((o: { id: string; name: string; slug: string }) => ({
    id: o.id,
    name: o.name,
    slug: o.slug,
    role: roleByOrg.get(o.id) ?? 'member',
  }))
}
