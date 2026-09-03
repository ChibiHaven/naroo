import type { ReactNode } from 'react'

interface ChoiceOption {
  value: string
  label: string
  icon?: ReactNode
}

interface ChoiceListProps {
  name: string
  options: ChoiceOption[]
  value: string
  onChange: (value: string) => void
}

export function ChoiceList({ name, options, value, onChange }: ChoiceListProps) {
  return (
    <div className="space-y-3" role="radiogroup">
      {options.map((option) => {
        const selected = value === option.value
        return (
          <label
            key={option.value}
            className={`touch-target flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
              selected
                ? 'border-brand-primary bg-brand-light'
                : 'border-brand-border bg-white hover:border-brand-primary/40'
            }`}
          >
            <input
              type="radio"
              className="sr-only"
              name={name}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
            />
            {option.icon ? (
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  selected
                    ? 'bg-brand-primary text-white'
                    : 'bg-brand-light text-brand-primary'
                }`}
                aria-hidden="true"
              >
                {option.icon}
              </span>
            ) : null}
            <span className="text-sm font-semibold text-brand-text">
              {option.label}
            </span>
          </label>
        )
      })}
    </div>
  )
}
