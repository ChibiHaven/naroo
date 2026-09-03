import { Check } from 'lucide-react'

interface StepProgressProps {
  current: number
  total?: number
  label: string
}

export function StepProgress({ current, total = 3, label }: StepProgressProps) {
  return (
    <div className="bg-brand-primary px-6 pb-5 pt-2">
      <p className="mb-3 text-center text-sm font-medium text-white/90">{label}</p>
      <ol className="flex items-center justify-center gap-0" aria-label={label}>
        {Array.from({ length: total }, (_, index) => {
          const step = index + 1
          const completed = step < current
          const active = step === current
          return (
            <li key={step} className="flex items-center last:flex-none">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  completed
                    ? 'bg-white text-brand-primary'
                    : active
                      ? 'bg-white text-brand-primary shadow-md'
                      : 'bg-white/20 text-white/70'
                }`}
                aria-current={active ? 'step' : undefined}
              >
                {completed ? <Check className="h-4 w-4" /> : step}
              </span>
              {step < total ? (
                <span
                  className={`mx-1 h-[3px] w-10 rounded-full transition-colors ${
                    completed ? 'bg-white' : 'bg-white/25'
                  }`}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
