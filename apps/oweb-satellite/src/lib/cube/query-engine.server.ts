import type { SupabaseClient } from '@supabase/supabase-js'

import { CUBE_SCHEMA, type CubeQuery } from '@/lib/cube/schema'

type Row = Record<string, unknown>

function splitMember(member: string): { cube: string; field: string } {
  const [cube, field] = member.split('.')
  if (!cube || !field) throw new Error(`invalid_member:${member}`)
  return { cube, field }
}

function findCube(name: string) {
  const cube = CUBE_SCHEMA.find((c) => c.name === name)
  if (!cube) throw new Error(`unknown_cube:${name}`)
  return cube
}

export async function executeCubeQuery(
  client: SupabaseClient,
  query: CubeQuery,
  workspaceId: string | null,
): Promise<{ data: Row[]; annotation: Record<string, unknown> }> {
  const members = [...(query.measures ?? []), ...(query.dimensions ?? [])]
  if (!members.length) throw new Error('empty_query')

  const cubeName = splitMember(members[0]!).cube
  const cube = findCube(cubeName)
  for (const member of members) {
    if (splitMember(member).cube !== cubeName) {
      throw new Error('multi_cube_queries_not_supported')
    }
  }

  let request = client.from(cube.table).select('*')
  if (cube.orgColumn && workspaceId) {
    request = request.eq(cube.orgColumn, workspaceId)
  }
  for (const filter of query.filters ?? []) {
    const parsed = splitMember(filter.member)
    if (parsed.cube !== cubeName) continue
    const dim = cube.dimensions.find((d) => d.name === parsed.field)
    if (!dim) continue
    if (filter.operator === 'equals' && filter.values?.[0]) {
      request = request.eq(dim.sql, filter.values[0])
    }
  }
  if (typeof query.limit === 'number') {
    request = request.limit(Math.min(query.limit, 5000))
  } else {
    request = request.limit(2000)
  }

  const { data, error } = await request
  if (error) throw new Error(error.message)

  const rows = (data ?? []) as Row[]
  const dimensionFields = (query.dimensions ?? []).map((m) => {
    const field = splitMember(m).field
    const def = cube.dimensions.find((d) => d.name === field)
    if (!def) throw new Error(`unknown_dimension:${m}`)
    return { member: m, def }
  })
  const measureFields = (query.measures ?? []).map((m) => {
    const field = splitMember(m).field
    const def = cube.measures.find((d) => d.name === field)
    if (!def) throw new Error(`unknown_measure:${m}`)
    return { member: m, def }
  })

  const grouped = new Map<string, { dims: Row; count: number }>()
  for (const row of rows) {
    const dims: Row = {}
    for (const dim of dimensionFields) {
      dims[dim.member] = row[dim.def.sql] ?? null
    }
    const key = JSON.stringify(dims)
    const existing = grouped.get(key)
    if (existing) existing.count += 1
    else grouped.set(key, { dims, count: 1 })
  }

  const result: Row[] = []
  for (const { dims, count } of grouped.values()) {
    const out: Row = { ...dims }
    for (const measure of measureFields) {
      out[measure.member] = measure.def.name === 'count' ? count : count
    }
    result.push(out)
  }

  const annotation: Record<string, unknown> = {
    measures: Object.fromEntries(
      measureFields.map((m) => [m.member, { title: m.def.title, shortTitle: m.def.title, type: 'number' }]),
    ),
    dimensions: Object.fromEntries(
      dimensionFields.map((d) => [d.member, { title: d.def.title, shortTitle: d.def.title, type: d.def.type }]),
    ),
    segments: {},
    timeDimensions: {},
  }

  return { data: result, annotation }
}
