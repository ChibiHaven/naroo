import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, HelpCircle, Leaf, Sprout, Wheat } from 'lucide-react'
import { AppHeader } from '@/components/layout/AppHeader'
import { StepProgress } from '@/components/forms/StepProgress'
import { BottomActions } from '@/components/forms/BottomActions'
import { FieldError } from '@/components/forms/FieldError'
import { SelectionCard } from '@/components/forms/SelectionCard'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { SecondaryButton } from '@/components/common/SecondaryButton'
import { useAssessment } from '@/context/AssessmentContext'
import { DEFAULT_PROVINCE_ID, SUPPORTED_PROVINCES } from '@/config/locations'
import type { FieldType, PreviousCrop } from '@/types/assessment'
import {
  firstErrorField,
  validateStep1,
  type ValidationErrors,
} from '@/validation/assessmentValidation'

export function FarmStep1Page() {
  const navigate = useNavigate()
  const { input, updateInput, translate, language, setCurrentStep } =
    useAssessment()
  const [errors, setErrors] = useState<ValidationErrors>({})

  useEffect(() => {
    setCurrentStep('step1')
    if (input.province !== DEFAULT_PROVINCE_ID) {
      updateInput({ province: DEFAULT_PROVINCE_ID })
    }
  }, [input.province, setCurrentStep, updateInput])

  const province = SUPPORTED_PROVINCES[0]
  const districts = province?.districts ?? []

  const handleContinue = () => {
    const nextErrors = validateStep1(input)
    setErrors(nextErrors)
    const first = firstErrorField(nextErrors)
    if (first) {
      document.getElementById(first)?.focus()
      return
    }
    setCurrentStep('step2')
    navigate('/assessment/step-2')
  }

  const fieldOptions: Array<{ value: FieldType; label: string; icon: ReactNode }> = [
    { value: 'lowland_paddy', label: translate('field_lowland'), icon: <Wheat className="h-4 w-4" /> },
    { value: 'upland', label: translate('field_upland'), icon: <Sprout className="h-4 w-4" /> },
    { value: 'other', label: translate('field_other'), icon: <Leaf className="h-4 w-4" /> },
    { value: 'unsure', label: translate('field_unsure'), icon: <HelpCircle className="h-4 w-4" /> },
  ]

  const previousOptions: Array<{ value: PreviousCrop; label: string; icon: ReactNode }> = [
    { value: 'rice', label: translate('previous_rice'), icon: <Wheat className="h-4 w-4" /> },
    { value: 'mung_bean', label: translate('previous_mung_bean'), icon: <Sprout className="h-4 w-4" /> },
    { value: 'another_legume', label: translate('previous_another_legume'), icon: <Leaf className="h-4 w-4" /> },
    { value: 'other', label: translate('previous_other'), icon: <Leaf className="h-4 w-4" /> },
    { value: 'none', label: translate('previous_none'), icon: <HelpCircle className="h-4 w-4" /> },
    { value: 'unsure', label: translate('previous_unsure'), icon: <HelpCircle className="h-4 w-4" /> },
  ]

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader title={translate('farm_information')} showBack backTo="/" variant="green" />
      <StepProgress current={1} total={3} label={translate('step_of', { current: 1, total: 3 })} />
      <main className="flex flex-1 flex-col px-5 py-5">
        <h2 className="text-2xl font-bold text-brand-text">{translate('step1_heading')}</h2>
        <p className="mt-2 text-sm text-brand-muted">{translate('step1_subheading')}</p>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="province" className="mb-2 block text-sm font-semibold">
              {translate('province')}
            </label>
            <select
              id="province"
              className="touch-target w-full rounded-2xl border border-brand-border bg-brand-light px-4 py-3"
              value={input.province}
              disabled
            >
              <option value={province?.id}>
                {language === 'th' ? province?.nameTh : province?.nameEn}
              </option>
            </select>
          </div>

          <div>
            <label htmlFor="district" className="mb-2 block text-sm font-semibold">
              {translate('district')}
            </label>
            <select
              id="district"
              className="touch-target w-full rounded-2xl border border-brand-border bg-white px-4 py-3"
              value={input.district}
              aria-invalid={Boolean(errors.district)}
              aria-describedby={errors.district ? 'district-error' : 'district-note'}
              onChange={(event) => updateInput({ district: event.target.value })}
            >
              <option value="">{translate('district_placeholder')}</option>
              {districts.map((item) => (
                <option key={item.id} value={item.id}>
                  {language === 'th' ? item.nameTh : item.nameEn}
                </option>
              ))}
            </select>
            <p id="district-note" className="mt-2 text-xs text-brand-muted">
              {translate('district_prototype_note')}
            </p>
            <FieldError id="district-error" message={errors.district ? translate(errors.district) : undefined} />
          </div>

          <aside className="rounded-2xl border border-brand-border bg-brand-light px-4 py-3 text-sm leading-6 text-brand-muted">
            {translate('coverage_note')}
          </aside>

          <fieldset>
            <legend className="mb-3 text-sm font-semibold">{translate('field_type_question')}</legend>
            <div className="grid grid-cols-2 gap-3">
              {fieldOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  name="fieldType"
                  value={option.value}
                  label={option.label}
                  icon={option.icon}
                  selected={input.fieldType === option.value}
                  onSelect={() => updateInput({ fieldType: option.value })}
                />
              ))}
            </div>
            <FieldError id="fieldType-error" message={errors.fieldType ? translate(errors.fieldType) : undefined} />
          </fieldset>

          {input.fieldType === 'other' ? (
            <div>
              <label htmlFor="fieldTypeOther" className="mb-2 block text-sm font-semibold">
                {translate('please_specify')}
              </label>
              <input
                id="fieldTypeOther"
                type="text"
                className="touch-target w-full rounded-2xl border border-brand-border px-4 py-3"
                value={input.fieldTypeOther ?? ''}
                onChange={(event) => updateInput({ fieldTypeOther: event.target.value })}
              />
              <FieldError
                id="fieldTypeOther-error"
                message={errors.fieldTypeOther ? translate(errors.fieldTypeOther) : undefined}
              />
            </div>
          ) : null}

          <fieldset>
            <legend className="mb-3 text-sm font-semibold">{translate('previous_crop_question')}</legend>
            <div className="grid grid-cols-2 gap-3">
              {previousOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  name="previousCrop"
                  value={option.value}
                  label={option.label}
                  icon={option.icon}
                  selected={input.previousCrop === option.value}
                  onSelect={() => updateInput({ previousCrop: option.value })}
                />
              ))}
            </div>
            <FieldError
              id="previousCrop-error"
              message={errors.previousCrop ? translate(errors.previousCrop) : undefined}
            />
          </fieldset>

          {input.previousCrop === 'other' ? (
            <div>
              <label htmlFor="previousCropOther" className="mb-2 block text-sm font-semibold">
                {translate('please_specify')}
              </label>
              <input
                id="previousCropOther"
                type="text"
                className="touch-target w-full rounded-2xl border border-brand-border px-4 py-3"
                value={input.previousCropOther ?? ''}
                onChange={(event) => updateInput({ previousCropOther: event.target.value })}
              />
              <FieldError
                id="previousCropOther-error"
                message={
                  errors.previousCropOther ? translate(errors.previousCropOther) : undefined
                }
              />
            </div>
          ) : null}
        </div>
      </main>
      <BottomActions>
        <PrimaryButton onClick={handleContinue}>
          {translate('continue')}
          <ArrowRight className="h-4 w-4" />
        </PrimaryButton>
        <SecondaryButton onClick={() => navigate('/')}>{translate('back')}</SecondaryButton>
      </BottomActions>
    </div>
  )
}
