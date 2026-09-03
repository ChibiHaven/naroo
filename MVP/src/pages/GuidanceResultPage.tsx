import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  CircleHelp,
  Leaf,
  ShieldAlert,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/AppHeader'
import { BottomActions } from '@/components/forms/BottomActions'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { SecondaryButton } from '@/components/common/SecondaryButton'
import { RequireResult } from '@/components/common/RouteGuards'
import { PrototypeBanner } from '@/components/guidance/PrototypeBanner'
import { SourcePanel } from '@/components/guidance/SourcePanel'
import { useAssessment } from '@/context/AssessmentContext'
import { getAssumptionById } from '@/config/prototypeAssumptions'
import type { GuidanceClassification } from '@/types/assessment'

function statusStyles(status: GuidanceClassification): string {
  switch (status) {
    case 'suitable':
      return 'border-brand-success/30 bg-emerald-50 text-brand-success'
    case 'borderline':
      return 'border-amber-300 bg-amber-50 text-amber-900'
    case 'escalate':
      return 'border-brand-error/30 bg-red-50 text-brand-error'
  }
}

function StatusIcon({ status }: { status: GuidanceClassification }) {
  if (status === 'suitable') {
    return <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
  }
  if (status === 'borderline') {
    return <AlertTriangle className="h-8 w-8" aria-hidden="true" />
  }
  return <CircleAlert className="h-8 w-8" aria-hidden="true" />
}

function GuidanceResultContent() {
  const navigate = useNavigate()
  const { result, translate, setCurrentStep, clearAll } = useAssessment()

  useEffect(() => {
    setCurrentStep('guidance')
  }, [setCurrentStep])

  if (!result) {
    return null
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        title={translate('your_farm_guidance')}
        showBack
        backTo="/assessment/step-3"
        variant="green"
      />
      <main className="flex flex-1 flex-col gap-4 px-5 py-5">
        <PrototypeBanner />

        <section
          className={`rounded-3xl border px-5 py-5 ${statusStyles(result.classification)}`}
          aria-label={translate(result.headlineKey)}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide">
                {translate(result.headlineKey)}
              </p>
              <p className="mt-2 text-xs font-medium opacity-80">
                {translate('crop_mung_bean')}
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-wide">
                {translate('crop_mung_bean')}
              </h1>
            </div>
            <StatusIcon status={result.classification} />
          </div>
          <p className="mt-4 text-sm leading-6">{translate(result.summaryKey)}</p>
        </section>

        <section className="rounded-2xl border border-brand-border bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <CheckCircle2 className="h-5 w-5 text-brand-success" />
            {translate('why_status')}
          </h2>
          <ul className="space-y-2">
            {result.supportingConditions.length > 0 ? (
              result.supportingConditions.map((key) => (
                <li key={key} className="flex gap-2 text-sm leading-6">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-success" />
                  <span>{translate(key)}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-brand-muted">
                {translate('result_summary_escalate')}
              </li>
            )}
          </ul>
        </section>

        {result.risks.length > 0 ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-amber-950">
              <AlertTriangle className="h-5 w-5" />
              {translate('risks_concerns')}
            </h2>
            <ul className="space-y-2">
              {result.risks.map((key) => (
                <li key={key} className="text-sm leading-6 text-amber-950">
                  • {translate(key)}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {result.missingOrUncertain.length > 0 ? (
          <section className="rounded-2xl border border-brand-border bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
              <CircleHelp className="h-5 w-5 text-brand-primary" />
              {translate('missing_uncertain')}
            </h2>
            <ul className="space-y-2">
              {result.missingOrUncertain.map((key) => (
                <li key={key} className="text-sm leading-6 text-brand-muted">
                  • {translate(key)}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="rounded-2xl border border-brand-border bg-brand-light/50 p-4">
          <h2 className="mb-3 text-base font-semibold">
            {translate('assumptions_used')}
          </h2>
          <ul className="space-y-2 text-sm text-brand-muted">
            {result.assumptionIds.map((id) => {
              const assumption = getAssumptionById(id)
              return (
                <li key={id}>
                  •{' '}
                  {assumption
                    ? translate(assumption.labelKey)
                    : id}
                </li>
              )
            })}
          </ul>
          <SecondaryButton
            className="mt-4"
            onClick={() => navigate('/assumptions')}
          >
            {translate('view_assumptions')}
          </SecondaryButton>
        </section>

        <section className="rounded-2xl border border-brand-border bg-white p-4">
          <h2 className="mb-2 flex items-center gap-2 text-base font-semibold">
            <CircleHelp className="h-5 w-5 text-brand-primary" />
            {translate('confidence_level')}
          </h2>
          <p className="text-sm leading-6 text-brand-muted">
            {translate(result.confidenceLabelKey)}
          </p>
        </section>

        <section className="rounded-2xl border border-brand-border bg-white p-4">
          <h2 className="mb-2 text-base font-semibold">
            {translate('weather_context')}
          </h2>
          <p className="text-sm leading-6 text-brand-muted">
            {translate(result.weatherContextKey)}
          </p>
          <SecondaryButton className="mt-4" onClick={() => navigate('/weather')}>
            {translate('view_weather')}
          </SecondaryButton>
        </section>

        <section className="rounded-2xl border border-brand-border bg-white p-4">
          <h2 className="mb-2 flex items-center gap-2 text-base font-semibold">
            <ShieldAlert className="h-5 w-5 text-brand-primary" />
            {translate('information_limitations')}
          </h2>
          <ul className="space-y-2">
            {result.limitations.map((key) => (
              <li key={key} className="text-sm leading-6 text-brand-muted">
                • {translate(key)}
              </li>
            ))}
          </ul>
        </section>

        <SourcePanel sources={result.sources} />
        <SecondaryButton onClick={() => navigate('/sources')}>
          {translate('view_sources')}
        </SecondaryButton>

        {(result.requiresExpertSupport ||
          result.classification === 'escalate') && (
          <section className="rounded-2xl border border-brand-border bg-brand-light/50 p-4">
            <h2 className="text-base font-semibold">{translate('need_more_help')}</h2>
            <p className="mt-2 text-sm leading-6 text-brand-muted">
              {translate('expert_cta')}
            </p>
            <div className="mt-4">
              <SecondaryButton onClick={() => navigate('/expert-support')}>
                {translate('find_local_support')}
              </SecondaryButton>
            </div>
          </section>
        )}

        <p className="text-sm leading-6 text-brand-muted">
          {translate('safety_disclaimer')}
        </p>
        <Leaf className="mx-auto h-6 w-6 text-brand-primary" aria-hidden="true" />
      </main>

      <BottomActions>
        <PrimaryButton
          onClick={() => {
            clearAll()
            navigate('/', { replace: true })
          }}
        >
          {translate('start_new_assessment')}
        </PrimaryButton>
        <SecondaryButton
          onClick={() => {
            setCurrentStep('step1')
            navigate('/assessment/step-1')
          }}
        >
          {translate('edit_farm_information')}
        </SecondaryButton>
      </BottomActions>
    </div>
  )
}

export function GuidanceResultPage() {
  return (
    <RequireResult>
      <GuidanceResultContent />
    </RequireResult>
  )
}
