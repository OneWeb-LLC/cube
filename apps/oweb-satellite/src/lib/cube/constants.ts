export const CUBE_APP_ID = 'cube' as const
export const CUBE_ACTIVATION_KIND = 'session' as const
export const CUBE_DEFAULT_PUBLIC_URL = 'https://cube.oweb.one'

export function getOwebAppUrl(): string {
  const fromEnv =
    import.meta.env.VITE_OWEB_APP_URL ||
    (typeof process !== 'undefined' ? process.env.VITE_OWEB_APP_URL : undefined)
  return (fromEnv || 'https://oweb.one').replace(/\/$/, '')
}

export function getCubePublicUrl(): string {
  const fromEnv =
    import.meta.env.VITE_CUBE_PUBLIC_URL ||
    (typeof process !== 'undefined' ? process.env.VITE_CUBE_PUBLIC_URL : undefined)
  return (fromEnv || CUBE_DEFAULT_PUBLIC_URL).replace(/\/$/, '')
}

export function owebLoginUrl(options?: { launch?: boolean }): string {
  const url = new URL('/login', getOwebAppUrl())
  if (options?.launch) url.searchParams.set('launch', CUBE_APP_ID)
  return url.toString()
}

export function owebOnboardingUrl(): string {
  const url = new URL('/onboarding', getOwebAppUrl())
  url.searchParams.set('launch', CUBE_APP_ID)
  return url.toString()
}

export function isAuthRequired(): boolean {
  if (import.meta.env.DEV && !import.meta.env.VITE_CUBE_REQUIRE_AUTH) return false
  const flag =
    import.meta.env.VITE_CUBE_REQUIRE_AUTH ||
    (typeof process !== 'undefined' ? process.env.CUBE_REQUIRE_AUTH : undefined)
  return flag === 'true' || flag === '1'
}
