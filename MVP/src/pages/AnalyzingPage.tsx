import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
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
      <main className="flex flex-1 flex-col items-center px-5 py-8 text-center">
        {/* Demonstration badge */}
        <div
          className="mb-4 inline-flex items-center rounded-full bg-status-borderline-bg px-4 py-1.5 text-xs font-bold text-status-borderline-text"
          role="status"
        >
          {translate('demonstration_mode')} · {translate('prototype_analysis')}
        </div>

        {/* Illustration */}
        <div className="mb-6 w-56">
          <img
            src={`${import.meta.env.BASE_URL}analyzing-farm.png`}
            alt=""
            className="h-auto w-full object-contain"
          />
        </div>

        <h1 className="text-2xl font-bold text-brand-text">
          {translate('analyzing_subtitle')}
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-brand-muted">
          {translate('analyzing_intro')}
        </p>

        {/* Step checklist */}
        <ul className="mt-8 w-full max-w-sm space-y-2.5 text-left" aria-live="polite">
          {steps.map((step, index) => {
            const done = index <= activeStep
            return (
              <li
                key={step}
                className={`flex items-center gap-3 rounded-[var(--radius-card)] border px-4 py-3 text-sm transition-all ${
                  done
                    ? 'border-brand-success/30 bg-brand-light text-brand-text'
                    : 'border-brand-border bg-white text-brand-muted'
                }`}
              >
                <CheckCircle2
                  className={`h-5 w-5 shrink-0 ${
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
