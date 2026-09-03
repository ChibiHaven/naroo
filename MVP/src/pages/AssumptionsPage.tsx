import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '@/components/layout/AppHeader'
import { SecondaryButton } from '@/components/common/SecondaryButton'
import { useAssessment } from '@/context/AssessmentContext'
import { PROTOTYPE_ASSUMPTIONS } from '@/config/prototypeAssumptions'
import { summarizeAssessment } from '@/utils/labels'

export function AssumptionsPage() {
  const navigate = useNavigate()
  const { translate, language, input, setCurrentStep } = useAssessment()
  const summary = summarizeAssessment(input, language)

  useEffect(() => {
    setCurrentStep('assumptions')
  }, [setCurrentStep])

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader title={translate('assumptions_title')} showBack variant="green" />
      <main className="flex flex-1 flex-col gap-4 px-5 py-5">
        <p className="text-sm leading-6 text-brand-muted">
          {translate('assumptions_intro')}
        </p>

        <section className="rounded-2xl border border-brand-border bg-white p-4">
          <h2 className="mb-3 text-base font-semibold">
            {translate('farm_summary')}
          </h2>
          <p className="mb-2 text-xs text-brand-muted">
            {translate('farm_summary')}
          </p>
          <ul className="space-y-2 text-sm text-brand-text">
            <li>
              {translate('summary_field_type')}: {summary.fieldType}
            </li>
            <li>
              {translate('summary_previous')}: {summary.previousCrop}
            </li>
            <li>
              {translate('summary_month')}: {summary.plantingMonth}
            </li>
            <li>
              {translate('summary_water')}: {summary.waterSource}
            </li>
            <li>
              {translate('summary_drainage')}: {summary.drainageCondition}
            </li>
            <li>
              {translate('summary_soil')}: {summary.soil}
            </li>
          </ul>
          <SecondaryButton
            className="mt-4"
            onClick={() => navigate('/assessment/step-1')}
          >
            {translate('edit_farm_information')}
          </SecondaryButton>
        </section>

        <ul className="space-y-3">
          {PROTOTYPE_ASSUMPTIONS.map((assumption) => (
            <li
              key={assumption.id}
              className="rounded-2xl border border-amber-200 bg-amber-50 p-4"
            >
              <p className="text-sm font-semibold text-amber-950">
                {translate(assumption.labelKey)}
                {assumption.provisional ? ' (provisional)' : ''}
              </p>
              <p className="mt-2 text-sm leading-6 text-amber-950/90">
                {translate(assumption.detailKey)}
              </p>
            </li>
          ))}
        </ul>

        <SecondaryButton onClick={() => navigate(-1)}>
          {translate('back')}
        </SecondaryButton>
      </main>
    </div>
  )
}
