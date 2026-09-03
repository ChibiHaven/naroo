import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  CircleHelp,
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

function statusBg(status: GuidanceClassification) {
  switch (status) {
    case 'suitable':
      return 'border-status-suitable-border bg-status-suitable-bg'
    case 'borderline':
      return 'border-status-borderline-border bg-status-borderline-bg'
    case 'escalate':
      return 'border-status-escalate-border bg-status-escalate-bg'
  }
}

function statusTextColor(status: GuidanceClassification) {
  switch (status) {
    case 'suitable':
      return 'text-status-suitable-text'
    case 'borderline':
      return 'text-status-borderline-text'
    case 'escalate':
      return 'text-status-escalate-text'
  }
}

function StatusIcon({ status }: { status: GuidanceClassification }) {
  const cls = `h-10 w-10 ${statusTextColor(status)}`
  if (status === 'suitable') {
    return <CheckCircle2 className={cls} aria-hidden="true" />
  }
  if (status === 'borderline') {
    return <AlertTriangle className={cls} aria-hidden="true" />
  }
  return <CircleAlert className={cls} aria-hidden="true" />
}

function statusImage(status: GuidanceClassification): string {
  if (status === 'escalate') {
    return `${import.meta.env.BASE_URL}farmer-needs-information.png`
  }
  return `${import.meta.env.BASE_URL}mung-bean.png`
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

        {/* Main status card */}
        <section
          className={`overflow-hidden rounded-[var(--radius-card)] border-2 ${statusBg(result.classification)}`}
          aria-label={translate(result.headlineKey)}
        >
          <div className="flex items-start gap-4 px-5 pt-5">
            <StatusIcon status={result.classification} />
            <div className="flex-1">
              <p className={`text-2xl font-bold ${statusTextColor(result.classification)}`}>
                {translate(result.headlineKey)}
              </p>
              <p className="mt-1 text-sm font-medium text-brand-muted">
                {translate('crop_mung_bean')}
              </p>
            </div>
          </div>

          {/* Crop illustration */}
          <div className="flex justify-center py-3">
            <img
              src={statusImage(result.classification)}
              alt=""
              className="h-28 w-auto object-contain"
            />
          </div>

          <p className="px-5 pb-5 text-sm leading-relaxed text-brand-text">
            {translate(result.summaryKey)}
          </p>
        </section>

        {/* Supporting conditions */}
        <section className="rounded-[var(--radius-card)] border border-brand-border bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
            <CheckCircle2 className="h-5 w-5 text-brand-success" />
            {translate('why_status')}
          </h2>
          <ul className="space-y-2">
            {result.supportingConditions.length > 0 ? (
              result.supportingConditions.map((key) => (
                <li key={key} className="flex gap-2 text-sm leading-relaxed">
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

        {/* Risks */}
        {result.risks.length > 0 ? (
          <section className="rounded-[var(--radius-card)] border border-status-borderline-border bg-status-borderline-bg p-4">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-status-borderline-text">
              <AlertTriangle className="h-5 w-5" />
              {translate('risks_concerns')}
            </h2>
            <ul className="space-y-2">
              {result.risks.map((key) => (
                <li key={key} className="text-sm leading-relaxed text-status-borderline-text">
                  • {translate(key)}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Missing or uncertain */}
        {result.missingOrUncertain.length > 0 ? (
          <section className="rounded-[var(--radius-card)] border border-brand-border bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
              <CircleHelp className="h-5 w-5 text-brand-primary" />
              {translate('missing_uncertain')}
            </h2>
            <ul className="space-y-2">
              {result.missingOrUncertain.map((key) => (
                <li key={key} className="text-sm leading-relaxed text-brand-muted">
                  • {translate(key)}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Assumptions */}
        <section className="rounded-[var(--radius-card)] border border-brand-border bg-brand-light p-4">
          <h2 className="mb-3 text-base font-bold">
            {translate('assumptions_used')}
          </h2>
          <ul className="space-y-1.5 text-sm text-brand-muted">
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

        {/* Confidence */}
        <section className="rounded-[var(--radius-card)] border border-brand-border bg-white p-4">
          <h2 className="mb-2 flex items-center gap-2 text-base font-bold">
            <CircleHelp className="h-5 w-5 text-brand-primary" />
            {translate('confidence_level')}
          </h2>
          <p className="text-sm leading-relaxed text-brand-muted">
            {translate(result.confidenceLabelKey)}
          </p>
        </section>

        {/* Weather context */}
        <section className="rounded-[var(--radius-card)] border border-brand-border bg-white p-4">
          <h2 className="mb-2 text-base font-bold">
            {translate('weather_context')}
          </h2>
          <p className="text-sm leading-relaxed text-brand-muted">
            {translate(result.weatherContextKey)}
          </p>
          <SecondaryButton className="mt-4" onClick={() => navigate('/weather')}>
            {translate('view_weather')}
          </SecondaryButton>
        </section>

        {/* Limitations */}
        <section className="rounded-[var(--radius-card)] border border-brand-border bg-white p-4">
          <h2 className="mb-2 flex items-center gap-2 text-base font-bold">
            <ShieldAlert className="h-5 w-5 text-brand-primary" />
            {translate('information_limitations')}
          </h2>
          <ul className="space-y-1.5">
            {result.limitations.map((key) => (
              <li key={key} className="text-sm leading-relaxed text-brand-muted">
                • {translate(key)}
              </li>
            ))}
          </ul>
        </section>

        {/* Sources */}
        <SourcePanel sources={result.sources} />
        <SecondaryButton onClick={() => navigate('/sources')}>
          {translate('view_sources')}
        </SecondaryButton>

        {/* Expert support */}
        {(result.requiresExpertSupport ||
          result.classification === 'escalate') && (
          <section className="rounded-[var(--radius-card)] border border-brand-border bg-brand-light p-4">
            <h2 className="text-base font-bold">{translate('need_more_help')}</h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">
              {translate('expert_cta')}
            </p>
            <div className="mt-4">
              <PrimaryButton onClick={() => navigate('/expert-support')}>
                {translate('find_local_support')}
                <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
            </div>
          </section>
        )}

        {/* Disclaimer */}
        <p className="text-xs leading-relaxed text-brand-muted">
          {translate('safety_disclaimer')}
        </p>
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
