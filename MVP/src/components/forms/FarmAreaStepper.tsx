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
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="touch-target inline-flex items-center justify-center rounded-2xl border border-brand-border bg-white text-brand-primary"
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
          className="w-full rounded-2xl border border-brand-border px-4 py-3 text-center text-lg font-semibold text-brand-text"
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
        className="touch-target inline-flex items-center justify-center rounded-2xl border border-brand-border bg-white text-brand-primary"
        aria-label={translate('increase_area')}
        onClick={() => onChange(Number((current + 0.5).toFixed(1)) || 0.5)}
      >
        <Plus className="h-5 w-5" />
      </button>
      <span className="min-w-10 text-sm font-medium text-brand-muted">
        {translate('rai')}
      </span>
    </div>
  )
}
