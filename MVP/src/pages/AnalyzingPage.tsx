import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { AppHeader } from '@/components/layout/AppHeader'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { SecondaryButton } from '@/components/common/SecondaryButton'
import { DecorativeIcon } from '@/components/common/DecorativeIcon'
import { RequireReadyForAnalysis } from '@/components/common/RouteGuards'
import { useAssessment } from '@/context/AssessmentContext'
import {
  isGuidanceRequestError,
  type GuidanceErrorKind,
} from '@/services/n8nErrors'
import type { NarooValidationFieldError } from '@/types/n8nApi'

type AnalysisPhase = 'loading' | 'error'

interface AnalysisErrorState {
  kind: GuidanceErrorKind
  message: string
  fieldErrors: NarooValidationFieldError[]
}

function editAnswersPath(fieldErrors: NarooValidationFieldError[]): string {
  const fields = fieldErrors.map((item) => item.field)
  const step1 = [
    'province',
    'district',
    'fieldType',
    'previousCrop',
    'fieldTypeOther',
    'previousCropOther',
  ]
  const step2 = ['plantingMonth', 'waterSource', 'drainageCondition']
  if (fields.some((field) => step1.includes(field))) {
    return '/assessment/step-1'
  }
  if (fields.some((field) => step2.includes(field))) {
    return '/assessment/step-2'
  }
  return '/assessment/step-3'
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function AnalyzingContent() {
  const navigate = useNavigate()
  const { translate, analyze, setCurrentStep, result, analysisInFlight } =
    useAssessment()
  const [activeStep, setActiveStep] = useState(0)
  const [phase, setPhase] = useState<AnalysisPhase>('loading')
  const [errorState, setErrorState] = useState<AnalysisErrorState | null>(null)
  const [retryNonce, setRetryNonce] = useState(0)
  const runIdRef = useRef(0)

  const steps = [
    translate('analyzing_step_1'),
    translate('analyzing_step_2'),
    translate('analyzing_step_3'),
    translate('analyzing_step_4'),
  ]

  useEffect(() => {
    setCurrentStep('analyzing')

    if (result) {
      setCurrentStep('guidance')
      navigate('/guidance', { replace: true })
      return
    }

    setPhase('loading')
    setErrorState(null)
    setActiveStep(prefersReducedMotion() ? 3 : 0)

    const runId = ++runIdRef.current
    let cancelled = false
    const timers: number[] = []

    if (!prefersReducedMotion()) {
      ;[0, 1, 2, 3].forEach((index) => {
        timers.push(
          window.setTimeout(() => {
            if (!cancelled && runId === runIdRef.current) {
              setActiveStep(index)
            }
          }, index * 350),
        )
      })
    }

    void analyze()
      .then(() => {
        if (cancelled || runId !== runIdRef.current) {
          return
        }
        setCurrentStep('guidance')
        navigate('/guidance', { replace: true })
      })
      .catch((error: unknown) => {
        if (cancelled || runId !== runIdRef.current) {
          return
        }
        if (isGuidanceRequestError(error)) {
          setErrorState({
            kind: error.kind,
            message: error.message,
            fieldErrors: error.validation?.errors ?? [],
          })
        } else {
          setErrorState({
            kind: 'network',
            message: 'Guidance request could not be completed',
            fieldErrors: [],
          })
        }
        setPhase('error')
      })

    return () => {
      cancelled = true
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [analyze, navigate, result, retryNonce, setCurrentStep])

  const errorCopyKey = (kind: GuidanceErrorKind): string => {
    switch (kind) {
      case 'configuration':
        return 'error_guidance_configuration'
      case 'validation':
        return 'error_guidance_validation'
      case 'timeout':
        return 'error_guidance_timeout'
      case 'server':
        return 'error_guidance_server'
      case 'invalid_response':
        return 'error_guidance_invalid_response'
      default:
        return 'error_guidance_network'
    }
  }

  if (phase === 'error' && errorState) {
    return (
      <div className="flex min-h-full flex-col">
        <AppHeader title={translate('analyzing_title')} variant="light" />
        <main className="flex flex-1 flex-col px-5 py-8">
          <h1 className="text-2xl font-bold text-brand-text">
            {translate('error_guidance_title')}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-brand-muted">
            {translate(errorCopyKey(errorState.kind))}
          </p>
          {errorState.fieldErrors.length > 0 ? (
            <ul className="mt-5 space-y-2 rounded-[var(--radius-card)] border border-status-escalate-border bg-status-escalate-bg p-4">
              {errorState.fieldErrors.map((item) => (
                <li
                  key={`${item.field}-${item.message}`}
                  className="text-sm text-status-escalate-text"
                >
                  <span className="font-semibold">{item.field}</span>: {item.message}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-8 flex flex-col gap-3">
            <PrimaryButton
              disabled={analysisInFlight}
              onClick={() => {
                setRetryNonce((value) => value + 1)
              }}
            >
              {translate('retry_guidance')}
            </PrimaryButton>
            <SecondaryButton
              onClick={() => {
                const path = editAnswersPath(errorState.fieldErrors)
                setCurrentStep(
                  path.endsWith('step-1')
                    ? 'step1'
                    : path.endsWith('step-2')
                      ? 'step2'
                      : 'step3',
                )
                navigate(path)
              }}
            >
              {translate('edit_answers')}
            </SecondaryButton>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader title={translate('analyzing_title')} variant="light" />
      <main className="flex flex-1 flex-col items-center px-5 py-8 text-center">
        <div
          className="mb-4 inline-flex items-center rounded-full bg-status-borderline-bg px-4 py-1.5 text-xs font-bold text-status-borderline-text"
          role="status"
        >
          {translate('live_analysis_badge')}
        </div>

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
          {translate('analyzing_intro_live')}
        </p>

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
                <DecorativeIcon>
                  <CheckCircle2
                    className={`h-5 w-5 ${
                      done ? 'text-brand-success' : 'text-brand-border'
                    }`}
                  />
                </DecorativeIcon>
                {step}
              </li>
            )
          })}
        </ul>

        <p className="mt-6 text-sm text-brand-muted">
          {translate('analyzing_wait_live')}
        </p>
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
