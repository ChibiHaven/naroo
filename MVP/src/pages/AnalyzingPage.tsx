import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ClipboardList, Search, Sprout } from 'lucide-react'
import { AppHeader } from '@/components/layout/AppHeader'
import { RequireReadyForAnalysis } from '@/components/common/RouteGuards'
import { useAssessment } from '@/context/AssessmentContext'

function AnalyzingContent() {
  const navigate = useNavigate()
  const { translate, analyze, setCurrentStep } = useAssessment()
  const [activeStep, setActiveStep] = useState(0)
  const startedRef = useRef(false)

  const steps = [
    translate('analyzing_step_1'),
    translate('analyzing_step_2'),
    translate('analyzing_step_3'),
    translate('analyzing_step_4'),
  ]

  useEffect(() => {
    setCurrentStep('analyzing')
    if (startedRef.current) {
      return
    }
    startedRef.current = true
    let cancelled = false

    const timers = [0, 1, 2, 3].map((index) =>
      window.setTimeout(() => {
        if (!cancelled) {
          setActiveStep(index)
        }
      }, index * 350),
    )

    void analyze().then(() => {
      if (cancelled) {
        return
      }
      setCurrentStep('guidance')
      navigate('/guidance', { replace: true })
    })

    return () => {
      cancelled = true
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [analyze, navigate, setCurrentStep])

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader title={translate('analyzing_title')} variant="light" />
      <main className="flex flex-1 flex-col items-center px-6 py-8 text-center">
        <div
          className="mb-3 inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900"
          role="status"
        >
          {translate('demonstration_mode')} · {translate('prototype_analysis')}
        </div>

        <div
          className="relative mb-6 flex h-44 w-44 items-center justify-center rounded-full bg-brand-light"
          aria-hidden="true"
        >
          <ClipboardList className="absolute left-8 top-10 h-10 w-10 text-brand-primary" />
          <Search className="absolute right-8 top-14 h-9 w-9 text-brand-dark" />
          <Sprout className="absolute bottom-10 h-10 w-10 text-brand-success" />
        </div>

        <h1 className="text-2xl font-bold text-brand-text">
          {translate('analyzing_subtitle')}
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-brand-muted">
          {translate('analyzing_intro')}
        </p>

        <ul className="mt-8 w-full max-w-sm space-y-3 text-left" aria-live="polite">
          {steps.map((step, index) => {
            const done = index <= activeStep
            return (
              <li
                key={step}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
                  done
                    ? 'border-brand-primary/30 bg-brand-light text-brand-text'
                    : 'border-brand-border bg-white text-brand-muted'
                }`}
              >
                <CheckCircle2
                  className={`h-5 w-5 ${
                    done ? 'text-brand-success' : 'text-brand-border'
                  }`}
                  aria-hidden="true"
                />
                {step}
              </li>
            )
          })}
        </ul>

        <p className="mt-6 text-sm text-brand-muted">{translate('analyzing_wait')}</p>
      </main>
    </div>
  )
}

export function AnalyzingPage() {
  return (
    <RequireReadyForAnalysis>
      <AnalyzingContent />
    </RequireReadyForAnalysis>
  )
}
