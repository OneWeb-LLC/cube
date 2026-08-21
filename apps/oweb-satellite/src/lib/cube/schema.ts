export type CubeField = {
  name: string
  title: string
  type: 'number' | 'string' | 'time'
  sql: string
}

export type CubeDefinition = {
  name: string
  title: string
  table: string
  description: string
  orgColumn?: string
  measures: CubeField[]
  dimensions: CubeField[]
}

export const CUBE_SCHEMA: CubeDefinition[] = [
  {
    name: 'Workspaces',
    title: 'Workspaces',
    table: 'ao_orgs',
    description: 'OWeb workspaces (ao_orgs) the signed-in OneID can see.',
    measures: [{ name: 'count', title: 'Workspace count', type: 'number', sql: 'id' }],
    dimensions: [
      { name: 'id', title: 'Workspace ID', type: 'string', sql: 'id' },
      { name: 'name', title: 'Name', type: 'string', sql: 'name' },
      { name: 'slug', title: 'Slug', type: 'string', sql: 'slug' },
      { name: 'createdAt', title: 'Created', type: 'time', sql: 'created_at' },
    ],
  },
  {
    name: 'Members',
    title: 'Workspace members',
    table: 'ao_org_members',
    description: 'Membership rows for the current workspace.',
    orgColumn: 'org_id',
    measures: [{ name: 'count', title: 'Member count', type: 'number', sql: 'user_id' }],
    dimensions: [
      { name: 'orgId', title: 'Workspace ID', type: 'string', sql: 'org_id' },
      { name: 'role', title: 'Role', type: 'string', sql: 'role' },
      { name: 'memberKind', title: 'Member kind', type: 'string', sql: 'member_kind' },
    ],
  },
  {
    name: 'AppActivations',
    title: 'App activations',
    table: 'one_id_app_activations',
    description: 'OneID app activations (Layer 3 recognition).',
    measures: [{ name: 'count', title: 'Activation count', type: 'number', sql: 'user_id' }],
    dimensions: [
      { name: 'appId', title: 'App ID', type: 'string', sql: 'app_id' },
      { name: 'activationKind', title: 'Activation kind', type: 'string', sql: 'activation_kind' },
    ],
  },
]

export function cubeMeta() {
  return {
    cubes: CUBE_SCHEMA.map((cube) => ({
      name: cube.name,
      title: cube.title,
      type: 'cube',
      connectedComponent: 1,
      measures: cube.measures.map((m) => ({
        name: `${cube.name}.${m.name}`,
        title: m.title,
        shortTitle: m.title,
        type: m.type,
        aggType: m.name === 'count' ? 'count' : 'number',
      })),
      dimensions: cube.dimensions.map((d) => ({
        name: `${cube.name}.${d.name}`,
        title: d.title,
        shortTitle: d.title,
        type: d.type,
      })),
      segments: [],
    })),
  }
}

export type CubeQuery = {
  measures?: string[]
  dimensions?: string[]
  filters?: Array<{ member: string; operator: string; values?: string[] }>
  limit?: number
}
