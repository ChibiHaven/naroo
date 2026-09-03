import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  fullWidth?: boolean
}

export function SecondaryButton({
  children,
  fullWidth = true,
  className = '',
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      type="button"
      className={`touch-target inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] border border-brand-border bg-white px-6 py-3 text-base font-semibold text-brand-primary transition-colors hover:bg-brand-light active:bg-brand-border-light disabled:cursor-not-allowed disabled:text-brand-muted disabled:opacity-60 ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
