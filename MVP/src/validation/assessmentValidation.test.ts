import { describe, expect, it } from 'vitest'
import { emptyAssessmentInput } from '@/types/assessment'
import {
  detectMissingCriticalInformation,
  isFarmAreaValid,
  validateStep1,
  validateStep2,
  validateStep3,
} from '@/validation/assessmentValidation'

describe('revised three-step validation', () => {
  it('requires step 1 fields and other descriptions', () => {
    const input = emptyAssessmentInput()
    expect(validateStep1(input).district).toBe('error_district_required')
    input.district = 'selaphum'
    input.fieldType = 'other'
    input.fieldTypeOther = ''
    input.previousCrop = 'other'
    input.previousCropOther = ''
    const errors = validateStep1(input)
    expect(errors.fieldTypeOther).toBe('error_field_type_other_required')
    expect(errors.previousCropOther).toBe('error_previous_crop_other_required')
  })

  it('requires planting month, water, and drainage on step 2', () => {
    const input = emptyAssessmentInput()
    const errors = validateStep2(input)
    expect(errors.plantingMonth).toBe('error_planting_month_required')
    expect(errors.waterSource).toBe('error_water_source_required')
    expect(errors.drainageCondition).toBe('error_drainage_required')
  })

  it('requires positive farm area and goal details on step 3', () => {
    expect(isFarmAreaValid(0)).toBe(false)
    expect(isFarmAreaValid(2)).toBe(true)
    const input = emptyAssessmentInput()
    input.farmAreaRai = -1
    input.soilKnowledge = ''
    input.decisionGoal = 'other'
    input.decisionGoalOther = ''
    const errors = validateStep3(input)
    expect(errors.farmAreaRai).toBe('error_farm_area_positive')
    expect(errors.soilKnowledge).toBe('error_soil_knowledge_required')
    expect(errors.decisionGoalOther).toBe('error_decision_goal_other_required')
  })

  it('detects unknown water and drainage as critical gaps', () => {
    const input = emptyAssessmentInput()
    input.province = 'roi_et'
    input.district = 'selaphum'
    input.fieldType = 'lowland_paddy'
    input.previousCrop = 'rice'
    input.plantingMonth = 11
    input.waterSource = 'unsure'
    input.drainageCondition = 'unsure'
    input.farmAreaRai = 5
    const missing = detectMissingCriticalInformation(input)
    expect(missing.some((item) => item.field === 'waterSource')).toBe(true)
    expect(missing.some((item) => item.field === 'drainageCondition')).toBe(true)
  })
})
