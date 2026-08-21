/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  readonly VITE_OWEB_APP_URL?: string
  readonly VITE_OWEB_PLATFORM_API_URL?: string
  readonly VITE_CUBE_PUBLIC_URL?: string
  readonly VITE_CUBE_REQUIRE_AUTH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
