import type { ReactNode } from 'react'

interface SelectionCardProps {
  selected: boolean
  onSelect: () => void
  label: string
  description?: string
  icon?: ReactNode
  name: string
  value: string
}

export function SelectionCard({
  selected,
  onSelect,
  label,
  description,
  icon,
  name,
  value,
}: SelectionCardProps) {
  return (
    <label
      className={`touch-target flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-center transition ${
        selected
          ? 'border-brand-primary bg-brand-light shadow-sm'
          : 'border-brand-border bg-white hover:border-brand-primary/40'
      }`}
    >
      <input
        type="radio"
        className="sr-only"
        name={name}
        value={value}
        checked={selected}
        onChange={onSelect}
      />
      {icon ? (
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            selected
              ? 'bg-brand-primary text-white'
              : 'bg-brand-light text-brand-primary'
          }`}
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : null}
      <span className="text-sm font-semibold text-brand-text">{label}</span>
      {description ? (
        <span className="text-xs text-brand-muted">{description}</span>
      ) : null}
    </label>
  )
}
