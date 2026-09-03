interface StepProgressProps {
  current: number
  total?: number
  label: string
}

export function StepProgress({ current, total = 3, label }: StepProgressProps) {
  return (
    <div className="bg-brand-primary px-4 pb-5 text-white">
      <p className="mb-3 text-sm text-white/85">{label}</p>
      <ol className="flex items-center justify-between" aria-label={label}>
        {Array.from({ length: total }, (_, index) => {
          const step = index + 1
          const completed = step < current
          const active = step === current
          return (
            <li key={step} className="flex flex-1 items-center last:flex-none">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  completed || active
                    ? 'bg-white text-brand-primary'
                    : 'bg-white/20 text-white'
                }`}
                aria-current={active ? 'step' : undefined}
              >
                {step}
              </span>
              {step < total ? (
                <span
                  className={`mx-2 h-0.5 flex-1 ${
                    completed ? 'bg-white' : 'bg-white/30'
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
