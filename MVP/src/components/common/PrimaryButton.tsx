import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  fullWidth?: boolean
}

export function PrimaryButton({
  children,
  fullWidth = true,
  className = '',
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type="button"
      className={`touch-target inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-brand-muted ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
