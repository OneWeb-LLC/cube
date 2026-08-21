import type { ReactNode } from 'react'
import { owebLoginUrl } from '@/lib/cube/constants'

export function ContinueWithOWebButton({
  className = '',
  children = 'Continue with OWeb',
}: {
  className?: string
  children?: ReactNode
}) {
  return (
    <a
      href={owebLoginUrl({ launch: true })}
      className={`inline-flex items-center justify-center rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)] ${className}`}
    >
      {children}
    </a>
  )
}
