import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  Droplets,
  HelpCircle,
  LandPlot,
  Leaf,
  MapPin,
  Sprout,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/AppHeader'
import { StepProgress } from '@/components/forms/StepProgress'
import { BottomActions } from '@/components/forms/BottomActions'
import { ChoiceList } from '@/components/forms/ChoiceList'
import { FieldError } from '@/components/forms/FieldError'
import { SelectionCard } from '@/components/forms/SelectionCard'
import { FarmAreaStepper } from '@/components/forms/FarmAreaStepper'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { SecondaryButton } from '@/components/common/SecondaryButton'
import { RequireStep2 } from '@/components/common/RouteGuards'
import { useAssessment } from '@/context/AssessmentContext'
import type { DecisionGoal, SoilKnowledge } from '@/types/assessment'
import { summarizeAssessment } from '@/utils/labels'
import {
  firstErrorField,
  validateStep3,
  type ValidationErrors,
} from '@/validation/assessmentValidation'

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <li className="flex items-start gap-3 py-1">
      <span className="mt-0.5 text-brand-primary" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-brand-muted">{label}</p>
        <p className="text-sm font-semibold text-brand-text">{value}</p>
      </div>
    </li>
  )
}

function FarmStep3Form() {
  const navigate = useNavigate()
  const { input, updateInput, translate, language, setCurrentStep, hasProgress, clearAll } =
    useAssessment()
  const [errors, setErrors] = useState<ValidationErrors>({})
  const summary = summarizeAssessment(input, language)

  useEffect(() => {
    setCurrentStep('step3')
  }, [setCurrentStep])

  const handleSubmit = () => {
    const nextErrors = validateStep3(input)
    setErrors(nextErrors)
    const first = firstErrorField(nextErrors)
    if (first) {
      const target =
        first === 'farmAreaRai'
          ? document.getElementById('farm-area')
          : document.getElementById(first)
      target?.focus()
      return
    }
    setCurrentStep('analyzing')
    navigate('/analyzing')
  }

  const handleClear = () => {
    if (!hasProgress) {
      return
    }
    if (window.confirm(translate('clear_confirm'))) {
      clearAll()
      navigate('/')
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        title={translate('farm_information')}
        showBack
        backTo="/assessment/step-2"
        variant="green"
      />
      <StepProgress
        current={3}
        total={3}
        label={translate('step_of', { current: 3, total: 3 })}
      />
      <main className="flex flex-1 flex-col px-5 py-5">
        <h2 className="text-xl font-bold text-brand-text">
          {translate('step3_heading')}
        </h2>

        <div className="mt-6 space-y-6">
          {/* Farm area */}
          <div>
            <label htmlFor="farm-area" className="mb-2 block text-sm font-bold text-brand-text">
              {translate('farm_area_question')}
            </label>
            <FarmAreaStepper
              value={input.farmAreaRai}
              onChange={(farmAreaRai) => updateInput({ farmAreaRai })}
              describedBy={errors.farmAreaRai ? 'farmAreaRai-error' : undefined}
            />
            <FieldError
              id="farmAreaRai-error"
              message={
                errors.farmAreaRai ? translate(errors.farmAreaRai) : undefined
              }
            />
          </div>

          {/* Soil knowledge */}
          <fieldset>
            <legend className="mb-3 text-sm font-bold text-brand-text">
              {translate('soil_question')}
            </legend>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  ['yes', 'soil_yes'],
                  ['no', 'soil_no'],
                  ['unsure', 'soil_unsure'],
                ] as Array<[SoilKnowledge, string]>
              ).map(([value, key]) => (
                <SelectionCard
                  key={value}
                  name="soilKnowledge"
                  value={value}
                  label={translate(key)}
                  selected={input.soilKnowledge === value}
                  onSelect={() =>
                    updateInput({
                      soilKnowledge: value,
                      soilType: value === 'yes' ? input.soilType : '',
                    })
                  }
                />
              ))}
            </div>
            <FieldError
              id="soilKnowledge-error"
              message={
                errors.soilKnowledge ? translate(errors.soilKnowledge) : undefined
              }
            />
          </fieldset>

          {input.soilKnowledge === 'yes' ? (
            <div>
              <label htmlFor="soilType" className="mb-2 block text-sm font-bold text-brand-text">
                {translate('soil_type_optional')}
              </label>
              <input
                id="soilType"
                type="text"
                className="touch-target w-full rounded-[var(--radius-button)] border-2 border-brand-border px-4 py-3 text-sm transition focus:border-brand-primary"
                placeholder={translate('soil_type_placeholder')}
                value={input.soilType ?? ''}
                onChange={(event) => updateInput({ soilType: event.target.value })}
              />
            </div>
          ) : null}

          {/* Decision goal */}
          <div id="decisionGoal">
            <p className="mb-3 text-sm font-bold text-brand-text">{translate('goal_question')}</p>
            <ChoiceList
              name="decisionGoal"
              value={input.decisionGoal}
              onChange={(value) =>
                updateInput({ decisionGoal: value as DecisionGoal })
              }
              options={[
                { value: 'improve_soil', label: translate('goal_improve_soil'), icon: <Leaf className="h-5 w-5" /> },
                { value: 'use_productively', label: translate('goal_use_productively'), icon: <Sprout className="h-5 w-5" /> },
                { value: 'add_crop', label: translate('goal_add_crop'), icon: <CalendarDays className="h-5 w-5" /> },
                { value: 'learn_mung_bean', label: translate('goal_learn_mung_bean'), icon: <Sprout className="h-5 w-5" /> },
                { value: 'other', label: translate('goal_other'), icon: <HelpCircle className="h-5 w-5" /> },
                { value: 'unsure', label: translate('goal_unsure'), icon: <HelpCircle className="h-5 w-5" /> },
              ]}
            />
            <FieldError
              id="decisionGoal-error"
              message={
                errors.decisionGoal ? translate(errors.decisionGoal) : undefined
              }
            />
          </div>

          {input.decisionGoal === 'other' ? (
            <div>
              <label
                htmlFor="decisionGoalOther"
                className="mb-2 block text-sm font-bold text-brand-text"
              >
                {translate('please_specify')}
              </label>
              <input
                id="decisionGoalOther"
                type="text"
                className="touch-target w-full rounded-[var(--radius-button)] border-2 border-brand-border px-4 py-3 text-sm transition focus:border-brand-primary"
                value={input.decisionGoalOther ?? ''}
                onChange={(event) =>
                  updateInput({ decisionGoalOther: event.target.value })
                }
              />
              <FieldError
                id="decisionGoalOther-error"
                message={
                  errors.decisionGoalOther
                    ? translate(errors.decisionGoalOther)
                    : undefined
                }
              />
            </div>
          ) : null}

          {/* Summary card */}
          <section className="rounded-[var(--radius-card)] border border-brand-border bg-brand-light p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-brand-text">{translate('farm_summary')}</h3>
              <Link
                to="/assessment/step-1"
                className="text-sm font-semibold text-brand-primary"
              >
                {translate('edit')}
              </Link>
            </div>
            <ul className="space-y-2 text-sm">
              <SummaryRow icon={<MapPin className="h-4 w-4" />} label={translate('summary_province')} value={summary.province} />
              <SummaryRow icon={<MapPin className="h-4 w-4" />} label={translate('summary_district')} value={summary.district} />
              <SummaryRow icon={<LandPlot className="h-4 w-4" />} label={translate('summary_field_type')} value={summary.fieldType} />
              <SummaryRow icon={<Leaf className="h-4 w-4" />} label={translate('summary_previous')} value={summary.previousCrop} />
              <SummaryRow icon={<CalendarDays className="h-4 w-4" />} label={translate('summary_month')} value={summary.plantingMonth} />
              <SummaryRow icon={<Droplets className="h-4 w-4" />} label={translate('summary_water')} value={summary.waterSource} />
              <SummaryRow icon={<Droplets className="h-4 w-4" />} label={translate('summary_drainage')} value={summary.drainageCondition} />
              <SummaryRow icon={<LandPlot className="h-4 w-4" />} label={translate('summary_area')} value={summary.farmArea} />
              <SummaryRow icon={<LandPlot className="h-4 w-4" />} label={translate('summary_soil')} value={summary.soil} />
              <SummaryRow icon={<Sprout className="h-4 w-4" />} label={translate('summary_goal')} value={summary.decisionGoal} />
            </ul>
          </section>
        </div>
      </main>

      <BottomActions>
        <PrimaryButton onClick={handleSubmit}>
          {translate('get_my_guidance')}
          <ArrowRight className="h-4 w-4" />
        </PrimaryButton>
        <SecondaryButton onClick={() => navigate('/assessment/step-2')}>
          {translate('back')}
        </SecondaryButton>
        <SecondaryButton onClick={handleClear}>
          {translate('clear_my_information')}
        </SecondaryButton>
      </BottomActions>
    </div>
  )
}

export function FarmStep3Page() {
  return (
    <RequireStep2>
      <FarmStep3Form />
    </RequireStep2>
  )
}
