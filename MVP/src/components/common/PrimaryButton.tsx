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
      className={`touch-target inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] bg-brand-primary px-6 py-3.5 text-base font-bold text-white shadow-sm transition-colors hover:bg-brand-dark active:bg-brand-darker disabled:cursor-not-allowed disabled:opacity-50 ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
