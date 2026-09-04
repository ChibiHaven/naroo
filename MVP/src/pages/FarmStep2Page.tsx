import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CloudRain,
  Droplets,
  HelpCircle,
  Waves,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/AppHeader'
import { StepProgress } from '@/components/forms/StepProgress'
import { BottomActions } from '@/components/forms/BottomActions'
import { FieldError } from '@/components/forms/FieldError'
import { SelectionCard } from '@/components/forms/SelectionCard'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { DecorativeIcon } from '@/components/common/DecorativeIcon'
import { SecondaryButton } from '@/components/common/SecondaryButton'
import { RequireStep1 } from '@/components/common/RouteGuards'
import { useAssessment } from '@/context/AssessmentContext'
import type { DrainageCondition, WaterSource } from '@/types/assessment'
import {
  firstErrorField,
  validateStep2,
  type ValidationErrors,
} from '@/validation/assessmentValidation'

function FarmStep2Form() {
  const navigate = useNavigate()
  const { input, updateInput, translate, setCurrentStep } = useAssessment()
  const [errors, setErrors] = useState<ValidationErrors>({})

  useEffect(() => {
    setCurrentStep('step2')
  }, [setCurrentStep])

  const handleContinue = () => {
    const nextErrors = validateStep2(input)
    setErrors(nextErrors)
    const first = firstErrorField(nextErrors)
    if (first) {
      document.getElementById(first)?.focus()
      return
    }
    setCurrentStep('step3')
    navigate('/assessment/step-3')
  }

  const waterOptions: Array<{
    value: WaterSource
    label: string
    icon: ReactNode
  }> = [
    { value: 'irrigated', label: translate('water_irrigated'), icon: <Droplets className="h-5 w-5" aria-hidden="true" /> },
    { value: 'residual_moisture', label: translate('water_residual'), icon: <Waves className="h-5 w-5" aria-hidden="true" /> },
    { value: 'rainfed', label: translate('water_rainfed'), icon: <CloudRain className="h-5 w-5" aria-hidden="true" /> },
    { value: 'limited', label: translate('water_limited'), icon: <Waves className="h-5 w-5" aria-hidden="true" /> },
    { value: 'unsure', label: translate('water_unsure'), icon: <HelpCircle className="h-5 w-5" aria-hidden="true" /> },
  ]

  const drainageOptions: Array<{
    value: DrainageCondition
    label: string
    icon: ReactNode
  }> = [
    { value: 'good', label: translate('drainage_good'), icon: <Droplets className="h-5 w-5" aria-hidden="true" /> },
    { value: 'moderate', label: translate('drainage_moderate'), icon: <Waves className="h-5 w-5" aria-hidden="true" /> },
    { value: 'poor', label: translate('drainage_poor'), icon: <CloudRain className="h-5 w-5" aria-hidden="true" /> },
    { value: 'unsure', label: translate('drainage_unsure'), icon: <HelpCircle className="h-5 w-5" aria-hidden="true" /> },
  ]

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        title={translate('farm_information')}
        showBack
        backTo="/assessment/step-1"
        variant="green"
      />
      <StepProgress
        current={2}
        total={3}
        label={translate('step_of', { current: 2, total: 3 })}
      />
      <main className="flex flex-1 flex-col px-5 py-5">
        <h2 className="text-xl font-bold text-brand-text">
          {translate('step2_heading')}
        </h2>

        <div className="mt-6 space-y-6">
          {/* Planting month */}
          <div>
            <label
              htmlFor="plantingMonth"
              className="mb-2 block text-sm font-bold text-brand-text"
            >
              {translate('planting_month_question')}
            </label>
            <select
              id="plantingMonth"
              className="touch-target w-full rounded-[var(--radius-button)] border-2 border-brand-border bg-white px-4 py-3 text-sm transition focus:border-brand-primary"
              value={input.plantingMonth ?? ''}
              aria-invalid={Boolean(errors.plantingMonth)}
              onChange={(event) =>
                updateInput({
                  plantingMonth: event.target.value
                    ? Number(event.target.value)
                    : null,
                })
              }
            >
              <option value="">{translate('select_month')}</option>
              {Array.from({ length: 12 }, (_, index) => index + 1).map(
                (month) => (
                  <option key={month} value={month}>
                    {translate(`month_${month}`)}
                  </option>
                ),
              )}
            </select>
            <FieldError
              id="plantingMonth-error"
              message={
                errors.plantingMonth ? translate(errors.plantingMonth) : undefined
              }
            />
          </div>

          {/* Water source */}
          <fieldset>
            <legend className="mb-3 text-sm font-bold text-brand-text">
              {translate('water_question')}
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {waterOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  name="waterSource"
                  value={option.value}
                  label={option.label}
                  icon={option.icon}
                  selected={input.waterSource === option.value}
                  onSelect={() => updateInput({ waterSource: option.value })}
                />
              ))}
            </div>
            <FieldError
              id="waterSource-error"
              message={
                errors.waterSource ? translate(errors.waterSource) : undefined
              }
            />
          </fieldset>

          {/* Drainage */}
          <fieldset>
            <legend className="mb-3 text-sm font-bold text-brand-text">
              {translate('drainage_question')}
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {drainageOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  name="drainageCondition"
                  value={option.value}
                  label={option.label}
                  icon={option.icon}
                  selected={input.drainageCondition === option.value}
                  onSelect={() =>
                    updateInput({ drainageCondition: option.value })
                  }
                />
              ))}
            </div>
            <FieldError
              id="drainageCondition-error"
              message={
                errors.drainageCondition
                  ? translate(errors.drainageCondition)
                  : undefined
              }
            />
          </fieldset>
        </div>
      </main>

      <BottomActions>
        <PrimaryButton onClick={handleContinue}>
          {translate('continue')}
          <DecorativeIcon>
            <ArrowRight className="h-4 w-4" />
          </DecorativeIcon>
        </PrimaryButton>
        <SecondaryButton onClick={() => navigate('/assessment/step-1')}>
          {translate('back')}
        </SecondaryButton>
      </BottomActions>
    </div>
  )
}

export function FarmStep2Page() {
  return (
    <RequireStep1>
      <FarmStep2Form />
    </RequireStep1>
  )
}
