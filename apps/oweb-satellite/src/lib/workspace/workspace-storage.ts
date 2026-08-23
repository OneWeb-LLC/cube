const WORKSPACE_KEY = 'cube:workspace_id'

export function persistWorkspaceId(orgId: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(WORKSPACE_KEY, orgId)
}

export function readStoredWorkspaceId(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(WORKSPACE_KEY)
}

export function clearStoredWorkspaceId(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(WORKSPACE_KEY)
}
