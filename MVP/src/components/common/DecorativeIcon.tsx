import type { ReactNode } from 'react'

/** Keeps Lucide/SVG icons visual-only so their tag or title never appears as text. */
export function DecorativeIcon({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`decorative-icon ${className}`.trim()}
      aria-hidden="true"
    >
      {children}
    </span>
  )
}
