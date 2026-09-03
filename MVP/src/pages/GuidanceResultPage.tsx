import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  ListChecks,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/AppHeader'
import { BottomActions } from '@/components/forms/BottomActions'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { SecondaryButton } from '@/components/common/SecondaryButton'
import { RequireResult } from '@/components/common/RouteGuards'
import { PrototypeBanner } from '@/components/guidance/PrototypeBanner'
import { useAssessment } from '@/context/AssessmentContext'
import { statusLabelKey } from '@/types/liveGuidance'
import type { GuidanceClassification } from '@/types/assessment'
import {
  cleanDisplayedText,
  displayRuleLabel,
  fallbackHeadline,
  formatLocalizedDateTime,
  headlineForDisplay,
  whyStatusItems,
} from '@/utils/displayLabels'

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
  const { result, translate, language, input, setCurrentStep, clearAll } =
    useAssessment()

  useEffect(() => {
    setCurrentStep('guidance')
  }, [setCurrentStep])

  if (!result) {
    return null
  }

  const { response } = result
  const classification = response.classification
  const statusKey = statusLabelKey(classification)
  const cleanedHeadline = headlineForDisplay(
    response.aiExplanation.headline,
    language,
    classification,
    input.district,
    input.province,
  )
  const cleanedSummary = cleanDisplayedText(
    response.aiExplanation.summary,
    language,
  )
  const cleanedNextSteps = response.aiExplanation.nextSteps
    .map((step) => cleanDisplayedText(step, language))
    .filter((step) => step.length > 0)
  const whyItems = whyStatusItems(
    language,
    classification,
    response.decisionTrace.rules,
    result.borderlineReasons,
    response.decisionTrace.matchedRuleId,
  )
  const weatherAvailable =
    response.weather.mode === 'available' && response.weather.days.length > 0
  const notableRules = response.decisionTrace.rules.filter(
    (rule) => rule.result !== 'pass',
  )

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
          className={`overflow-hidden rounded-[var(--radius-card)] border-2 ${statusBg(classification)}`}
          aria-label={translate(statusKey)}
        >
          <div className="flex items-start gap-4 px-5 pt-5">
            <StatusIcon status={classification} />
            <div className="flex-1">
              <p className={`text-2xl font-bold ${statusTextColor(classification)}`}>
                {translate(statusKey)}
              </p>
              <p className="mt-1 text-sm font-medium text-brand-muted">
                {translate('crop_mung_bean')}
              </p>
              <h2 className="mt-3 text-lg font-bold text-brand-text">
                {cleanedHeadline ||
                  fallbackHeadline(
                    language,
                    classification,
                    input.district,
                    input.province,
                  )}
              </h2>
            </div>
          </div>

          <div className="flex justify-center py-3">
            <img
              src={statusImage(classification)}
              alt=""
              className="h-28 w-auto object-contain"
            />
          </div>

          <p className="px-5 pb-5 text-sm leading-relaxed text-brand-text">
            {cleanedSummary}
          </p>
        </section>

        {cleanedNextSteps.length > 0 ? (
          <section className="rounded-[var(--radius-card)] border border-brand-border bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
              <ListChecks className="h-5 w-5 text-brand-primary" aria-hidden="true" />
              {translate('next_steps')}
            </h2>
            <ul className="space-y-2">
              {cleanedNextSteps.map((step, index) => (
                <li
                  key={`${index}-${step}`}
                  className="text-sm leading-relaxed text-brand-text"
                >
                  • {step}
                </li>
              ))}
            </ul>
            {response.aiExplanation.generated ? (
              <p className="mt-3 text-xs text-brand-muted">
                {translate('ai_explanation_note')}
              </p>
            ) : null}
          </section>
        ) : null}

        <section className="rounded-[var(--radius-card)] border border-brand-border bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
            {classification === 'suitable' ? (
              <CheckCircle2 className="h-5 w-5 text-brand-success" aria-hidden="true" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-brand-warning" aria-hidden="true" />
            )}
            {classification === 'borderline'
              ? translate('risks_concerns')
              : translate('why_status')}
          </h2>
          <ul className="space-y-2">
            {whyItems.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-brand-success"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[var(--radius-card)] border border-brand-border bg-white p-4">
          <h2 className="mb-2 text-base font-bold">
            {translate('weather_context')}
          </h2>
          <p className="text-sm leading-relaxed text-brand-muted">
            {weatherAvailable
              ? translate('weather_context_live')
              : translate('weather_context_unavailable')}
          </p>
          {weatherAvailable ? (
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">
              {translate('weather_forecast_timing_note')}
            </p>
          ) : null}
          <SecondaryButton className="mt-4" onClick={() => navigate('/weather')}>
            {translate('view_weather')}
          </SecondaryButton>
        </section>

        {(response.requiresExpertSupport || classification === 'escalate') && (
          <section className="rounded-[var(--radius-card)] border border-brand-border bg-brand-light p-4">
            <h2 className="text-base font-bold">{translate('need_more_help')}</h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">
              {translate('expert_cta')}
            </p>
            <div className="mt-4">
              <PrimaryButton onClick={() => navigate('/expert-support')}>
                {translate('find_local_support')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </PrimaryButton>
            </div>
          </section>
        )}

        <details className="rounded-[var(--radius-card)] border border-brand-border bg-white p-4">
          <summary className="cursor-pointer text-sm font-bold text-brand-text">
            {translate('more_details')}
          </summary>
          <div className="mt-3 space-y-3 text-sm text-brand-muted">
            <p>
              {translate('confidence_level')}:{' '}
              {translate(
                response.confidence === 'high'
                  ? 'confidence_high'
                  : response.confidence === 'medium'
                    ? 'confidence_medium'
                    : 'confidence_low',
              )}
            </p>
            <SecondaryButton onClick={() => navigate('/assumptions')}>
              {translate('view_assumptions')}
            </SecondaryButton>
            <SecondaryButton onClick={() => navigate('/sources')}>
              {translate('view_sources')}
            </SecondaryButton>
            <p>
              {translate('request_id_label')}: {response.meta.requestId}
            </p>
            <p>
              {translate('processed_at_label')}:{' '}
              {formatLocalizedDateTime(response.meta.processedAt, language)}
            </p>
            {notableRules.length > 0 ? (
              <div>
                <p className="font-semibold text-brand-text">
                  {translate('technical_details')}
                </p>
                <ul className="mt-1 space-y-1">
                  {notableRules.map((rule) => (
                    <li key={rule.id}>
                      {displayRuleLabel(rule.id, language, rule.description)}
                      {rule.id ? ` (${rule.id})` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p>{translate('static_reference_note')}</p>
            <ul className="space-y-1">
              {result.staticLimitationKeys.map((key) => (
                <li key={key}>• {translate(key)}</li>
              ))}
            </ul>
          </div>
        </details>

        <p className="text-xs leading-relaxed text-brand-muted">
          {translate('safety_disclaimer')}
        </p>
      </main>

      <BottomActions>
        <PrimaryButton
          onClick={() => {
            navigate('/', { replace: true })
            clearAll()
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
