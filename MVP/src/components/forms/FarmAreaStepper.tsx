import { Minus, Plus } from 'lucide-react'
import { useAssessment } from '@/context/AssessmentContext'

interface FarmAreaStepperProps {
  value: number | null
  onChange: (value: number | null) => void
  errorId?: string
  describedBy?: string
}

export function FarmAreaStepper({
  value,
  onChange,
  errorId,
  describedBy,
}: FarmAreaStepperProps) {
  const { translate } = useAssessment()
  const current = value ?? 0

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        className="touch-target inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-button)] border-2 border-brand-border bg-white text-brand-primary transition hover:border-brand-primary hover:bg-brand-light"
        aria-label={translate('decrease_area')}
        onClick={() => onChange(Math.max(0, Number((current - 0.5).toFixed(1))) || null)}
      >
        <Minus className="h-5 w-5" />
      </button>
      <div className="relative flex-1">
        <input
          id="farm-area"
          type="number"
          inputMode="decimal"
          min={0.1}
          step={0.5}
          value={value ?? ''}
          aria-invalid={Boolean(errorId)}
          aria-describedby={describedBy}
          className="w-full rounded-[var(--radius-button)] border-2 border-brand-border px-4 py-3 text-center text-xl font-bold text-brand-text transition focus:border-brand-primary"
          onChange={(event) => {
            const next = event.target.value
            if (next === '') {
              onChange(null)
              return
            }
            const parsed = Number(next)
            onChange(Number.isFinite(parsed) ? parsed : null)
          }}
        />
      </div>
      <button
        type="button"
        className="touch-target inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-button)] border-2 border-brand-border bg-white text-brand-primary transition hover:border-brand-primary hover:bg-brand-light"
        aria-label={translate('increase_area')}
        onClick={() => onChange(Number((current + 0.5).toFixed(1)) || 0.5)}
      >
        <Plus className="h-5 w-5" />
      </button>
      <span className="min-w-10 text-base font-semibold text-brand-muted">
        {translate('rai')}
      </span>
    </div>
  )
}
