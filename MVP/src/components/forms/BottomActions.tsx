import type { ReactNode } from 'react'

interface BottomActionsProps {
  children: ReactNode
}

export function BottomActions({ children }: BottomActionsProps) {
  return (
    <div className="sticky bottom-0 mt-auto border-t border-brand-border bg-white/95 px-5 py-4 backdrop-blur-sm">
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  )
}
