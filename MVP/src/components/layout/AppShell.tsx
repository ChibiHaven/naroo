import type { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-page px-0 py-0 sm:px-4 sm:py-6">
      <div className="mx-auto min-h-screen w-full max-w-[460px] overflow-hidden bg-brand-surface shadow-sm sm:min-h-[calc(100vh-3rem)] sm:rounded-[28px] sm:border sm:border-brand-border">
        {children}
      </div>
    </div>
  )
}
