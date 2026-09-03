import type { ReactNode } from 'react'

interface BottomActionsProps {
  children: ReactNode
}

export function BottomActions({ children }: BottomActionsProps) {
  return (
    <div className="sticky bottom-0 mt-auto border-t border-brand-border bg-brand-surface/95 px-4 py-4 backdrop-blur">
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}
