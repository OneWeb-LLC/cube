import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

import { supabase } from '@/integrations/supabase/client'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  const navigate = useNavigate()

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      void navigate({ to: data.session ? '/dashboard' : '/login' })
    })
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] text-sm text-[var(--sea-ink-soft)]">
      Opening Cube…
    </div>
  )
}
