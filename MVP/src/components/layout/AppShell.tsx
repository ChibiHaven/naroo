import type { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-page sm:px-4 sm:py-6">
      <div className="mx-auto min-h-screen w-full max-w-[480px] overflow-hidden bg-brand-surface sm:min-h-[calc(100vh-3rem)] sm:rounded-3xl sm:border sm:border-brand-border sm:shadow-lg">
        {children}
      </div>
    </div>
  )
}
