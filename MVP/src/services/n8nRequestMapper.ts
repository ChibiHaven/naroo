import type { FarmAssessmentInput } from '@/types/assessment'
import type { NarooGuidanceRequest } from '@/types/n8nApi'

/**
 * Build the n8n webhook body from form state.
 * Values are preserved exactly — no enum remapping.
 */
export function buildNarooGuidanceRequest(
  input: FarmAssessmentInput,
): NarooGuidanceRequest {
  if (
    !input.fieldType ||
    !input.waterSource ||
    !input.drainageCondition ||
    input.plantingMonth === null
  ) {
    throw new Error('Incomplete assessment input for n8n request')
  }

  const body: NarooGuidanceRequest = {
    province: 'roi_et',
    fieldType: input.fieldType,
    waterSource: input.waterSource,
    drainageCondition: input.drainageCondition,
    plantingMonth: input.plantingMonth,
    language: input.language,
  }

  if (input.district.trim()) {
    body.district = input.district.trim()
  }
  if (input.previousCrop) {
    body.previousCrop = input.previousCrop
  }
  if (
    typeof input.farmAreaRai === 'number' &&
    Number.isFinite(input.farmAreaRai) &&
    input.farmAreaRai > 0
  ) {
    body.farmAreaRai = input.farmAreaRai
  }
  if (input.soilKnowledge) {
    body.soilKnowledge = input.soilKnowledge
  }
  if (input.soilType?.trim()) {
    body.soilType = input.soilType.trim()
  }
  if (input.decisionGoal) {
    body.decisionGoal = input.decisionGoal
  }
  if (input.fieldTypeOther?.trim()) {
    body.fieldTypeOther = input.fieldTypeOther.trim()
  }
  if (input.previousCropOther?.trim()) {
    body.previousCropOther = input.previousCropOther.trim()
  }
  if (input.decisionGoalOther?.trim()) {
    body.decisionGoalOther = input.decisionGoalOther.trim()
  }

  return body
}
