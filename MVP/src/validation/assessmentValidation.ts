import type {
  AssessmentStep,
  FarmAssessmentInput,
} from '@/types/assessment'

export type ValidationErrors = Partial<Record<keyof FarmAssessmentInput, string>>

export interface MissingInformationItem {
  field: keyof FarmAssessmentInput
  step: AssessmentStep
  messageKey: string
  reason: 'missing' | 'unknown'
}

export function validateStep1(input: FarmAssessmentInput): ValidationErrors {
  const errors: ValidationErrors = {}
  if (!input.province) {
    errors.province = 'error_province_required'
  }
  if (!input.district.trim()) {
    errors.district = 'error_district_required'
  }
  if (!input.fieldType) {
    errors.fieldType = 'error_field_type_required'
  } else if (input.fieldType === 'other' && !input.fieldTypeOther?.trim()) {
    errors.fieldTypeOther = 'error_field_type_other_required'
  }
  if (!input.previousCrop) {
    errors.previousCrop = 'error_previous_crop_required'
  } else if (
    input.previousCrop === 'other' &&
    !input.previousCropOther?.trim()
  ) {
    errors.previousCropOther = 'error_previous_crop_other_required'
  }
  return errors
}

export function validateStep2(input: FarmAssessmentInput): ValidationErrors {
  const errors: ValidationErrors = {}
  if (input.plantingMonth === null || input.plantingMonth === undefined) {
    errors.plantingMonth = 'error_planting_month_required'
  } else if (
    !Number.isInteger(input.plantingMonth) ||
    input.plantingMonth < 1 ||
    input.plantingMonth > 12
  ) {
    errors.plantingMonth = 'error_planting_month_invalid'
  }
  if (!input.waterSource) {
    errors.waterSource = 'error_water_source_required'
  }
  if (!input.drainageCondition) {
    errors.drainageCondition = 'error_drainage_required'
  }
  return errors
}

export function validateStep3(input: FarmAssessmentInput): ValidationErrors {
  const errors: ValidationErrors = {}
  if (input.farmAreaRai === null || input.farmAreaRai === undefined) {
    errors.farmAreaRai = 'error_farm_area_required'
  } else if (!Number.isFinite(input.farmAreaRai) || input.farmAreaRai <= 0) {
    errors.farmAreaRai = 'error_farm_area_positive'
  }
  if (!input.soilKnowledge) {
    errors.soilKnowledge = 'error_soil_knowledge_required'
  }
  if (!input.decisionGoal) {
    errors.decisionGoal = 'error_decision_goal_required'
  } else if (
    input.decisionGoal === 'other' &&
    !input.decisionGoalOther?.trim()
  ) {
    errors.decisionGoalOther = 'error_decision_goal_other_required'
  }
  return errors
}

export function validateStep(
  step: AssessmentStep,
  input: FarmAssessmentInput,
): ValidationErrors {
  switch (step) {
    case 'step1':
      return validateStep1(input)
    case 'step2':
      return validateStep2(input)
    case 'step3':
      return {
        ...validateStep1(input),
        ...validateStep2(input),
        ...validateStep3(input),
      }
    default:
      return {}
  }
}

export function isFarmAreaValid(value: number | null | undefined): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

export function detectMissingCriticalInformation(
  input: FarmAssessmentInput,
): MissingInformationItem[] {
  const missing: MissingInformationItem[] = []

  if (!input.province || input.province !== 'roi_et' || !input.district.trim()) {
    missing.push({
      field: !input.province ? 'province' : 'district',
      step: 'step1',
      messageKey: 'missing_location',
      reason: 'missing',
    })
  }

  if (!input.fieldType) {
    missing.push({
      field: 'fieldType',
      step: 'step1',
      messageKey: 'missing_field_type',
      reason: 'missing',
    })
  }

  if (!input.previousCrop) {
    missing.push({
      field: 'previousCrop',
      step: 'step1',
      messageKey: 'missing_previous_crop',
      reason: 'missing',
    })
  }

  if (input.plantingMonth === null || input.plantingMonth === undefined) {
    missing.push({
      field: 'plantingMonth',
      step: 'step2',
      messageKey: 'missing_planting_month',
      reason: 'missing',
    })
  }

  if (!input.waterSource) {
    missing.push({
      field: 'waterSource',
      step: 'step2',
      messageKey: 'missing_water',
      reason: 'missing',
    })
  } else if (input.waterSource === 'unsure') {
    missing.push({
      field: 'waterSource',
      step: 'step2',
      messageKey: 'missing_water',
      reason: 'unknown',
    })
  }

  if (!input.drainageCondition) {
    missing.push({
      field: 'drainageCondition',
      step: 'step2',
      messageKey: 'missing_drainage',
      reason: 'missing',
    })
  } else if (input.drainageCondition === 'unsure') {
    missing.push({
      field: 'drainageCondition',
      step: 'step2',
      messageKey: 'missing_drainage',
      reason: 'unknown',
    })
  }

  if (!isFarmAreaValid(input.farmAreaRai)) {
    missing.push({
      field: 'farmAreaRai',
      step: 'step3',
      messageKey: 'missing_area',
      reason: 'missing',
    })
  }

  return missing
}

export function getFirstIncompleteStep(
  input: FarmAssessmentInput,
): AssessmentStep {
  if (Object.keys(validateStep1(input)).length > 0) {
    return 'step1'
  }
  if (Object.keys(validateStep2(input)).length > 0) {
    return 'step2'
  }
  if (Object.keys(validateStep3(input)).length > 0) {
    return 'step3'
  }
  return 'step3'
}

export function firstErrorField(
  errors: ValidationErrors,
): keyof FarmAssessmentInput | null {
  const order: Array<keyof FarmAssessmentInput> = [
    'province',
    'district',
    'fieldType',
    'fieldTypeOther',
    'previousCrop',
    'previousCropOther',
    'plantingMonth',
    'waterSource',
    'drainageCondition',
    'farmAreaRai',
    'soilKnowledge',
    'soilType',
    'decisionGoal',
    'decisionGoalOther',
  ]
  return order.find((field) => Boolean(errors[field])) ?? null
}
