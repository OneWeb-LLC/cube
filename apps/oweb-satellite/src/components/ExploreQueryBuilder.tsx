import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { supabase } from '@/integrations/supabase/client'
import { cubeMeta } from '@/lib/cube/schema'

type MetaCube = {
  name: string
  title: string
  measures: Array<{ name: string; title: string }>
  dimensions: Array<{ name: string; title: string }>
}

type MetaResponse = {
  cubes: MetaCube[]
}

type LoadResponse = {
  data: Record<string, unknown>[]
}

async function cubeFetch<T>(path: string, init?: RequestInit, workspaceId?: string): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  const res = await fetch(`/api/cubejs${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(workspaceId ? { 'x-cube-workspace-id': workspaceId } : {}),
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Cube API ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function ExploreQueryBuilder({ workspaceId }: { workspaceId: string }) {
  const metaQuery = useQuery({
    queryKey: ['cube-meta'],
    queryFn: () => cubeFetch<MetaResponse>('/v1/meta', undefined, workspaceId),
  })

  const cubes = metaQuery.data?.cubes ?? cubeMeta().cubes
  const [cubeName, setCubeName] = useState(cubes[0]?.name ?? 'Workspaces')
  const cube = cubes.find((c) => c.name === cubeName) ?? cubes[0]
  const [measures, setMeasures] = useState<string[]>([])
  const [dimensions, setDimensions] = useState<string[]>([])

  const queryPayload = useMemo(() => {
    const filters =
      cubeName === 'Members'
        ? [
            {
              member: 'Members.orgId',
              operator: 'equals',
              values: [workspaceId],
            },
          ]
        : []
    return { query: { measures, dimensions, filters } }
  }, [measures, dimensions, cubeName, workspaceId])

  const loadMutation = useMutation({
    mutationFn: () =>
      cubeFetch<LoadResponse>(
        '/v1/load',
        {
          method: 'POST',
          body: JSON.stringify(queryPayload),
        },
        workspaceId,
      ),
  })

  function toggle(list: string[], value: string, setter: (next: string[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value])
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
        <label className="island-kicker">Cube</label>
        <select
          className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
          value={cubeName}
          onChange={(e) => {
            setCubeName(e.target.value)
            setMeasures([])
            setDimensions([])
          }}
        >
          {cubes.map((item) => (
            <option key={item.name} value={item.name}>
              {item.title}
            </option>
          ))}
        </select>

        <p className="mt-4 island-kicker">Measures</p>
        <ul className="mt-2 space-y-1 text-sm">
          {(cube?.measures ?? []).map((m) => (
            <li key={m.name}>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={measures.includes(m.name)}
                  onChange={() => toggle(measures, m.name, setMeasures)}
                />
                {m.title}
              </label>
            </li>
          ))}
        </ul>

        <p className="mt-4 island-kicker">Dimensions</p>
        <ul className="mt-2 space-y-1 text-sm">
          {(cube?.dimensions ?? []).map((d) => (
            <li key={d.name}>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={dimensions.includes(d.name)}
                  onChange={() => toggle(dimensions, d.name, setDimensions)}
                />
                {d.title}
              </label>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="mt-4 w-full rounded-lg bg-[var(--lagoon)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          disabled={measures.length === 0 && dimensions.length === 0}
          onClick={() => loadMutation.mutate()}
        >
          {loadMutation.isPending ? 'Running…' : 'Run query'}
        </button>
      </aside>

      <section className="overflow-auto rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
        {loadMutation.error && (
          <p className="text-sm text-red-600">{(loadMutation.error as Error).message}</p>
        )}
        {!loadMutation.data && !loadMutation.error && (
          <p className="text-sm text-[var(--sea-ink-soft)]">Pick measures or dimensions, then run.</p>
        )}
        {loadMutation.data && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--sea-ink-soft)]">
                {Object.keys(loadMutation.data.data[0] ?? { result: '' }).map((col) => (
                  <th key={col} className="px-2 py-2 font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadMutation.data.data.map((row, i) => (
                <tr key={i} className="border-b border-[var(--line)]">
                  {Object.values(row).map((value, j) => (
                    <td key={j} className="px-2 py-2">
                      {String(value ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
