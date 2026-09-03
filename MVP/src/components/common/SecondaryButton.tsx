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
      className={`touch-target inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-border bg-white px-5 py-3 text-base font-semibold text-brand-primary shadow-sm transition hover:bg-brand-light disabled:cursor-not-allowed disabled:text-brand-muted ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
