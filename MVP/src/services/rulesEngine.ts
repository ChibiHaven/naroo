import {
  PROTOTYPE_EDGE_MONTHS,
  PROTOTYPE_SUITABLE_MONTHS,
} from '@/config/prototypeAssumptions'
import type { FarmAssessmentInput, GuidanceClassification } from '@/types/assessment'
import type { DecisionTrace } from '@/types/guidance'
import { detectMissingCriticalInformation } from '@/validation/assessmentValidation'

/**
 * Deterministic rules-first classifier.
 * Classification is fixed here and must not be altered by explanation text.
 */
export function classifyFarmAssessment(
  input: FarmAssessmentInput,
): DecisionTrace {
  const missing = detectMissingCriticalInformation(input)
  const missingOrUncertainKeys = missing.map((item) => item.messageKey)
  const supportingConditionKeys: string[] = []
  const riskKeys: string[] = []
  const matchedRuleIds: string[] = []
  const assumptionIds = [
    'scope_roi_et',
    'crop_mung_bean',
    'planting_window',
    'water_drainage',
    'weather_demo',
  ]

  if (input.province !== 'roi_et') {
    matchedRuleIds.push('escalate_outside_scope')
    return buildTrace('escalate', matchedRuleIds, supportingConditionKeys, [
      ...riskKeys,
      'risk_outside_scope',
    ], ['missing_location', ...missingOrUncertainKeys], assumptionIds, true)
  }

  if (missing.length > 0) {
    matchedRuleIds.push('escalate_missing_critical')
    return buildTrace(
      'escalate',
      matchedRuleIds,
      supportingConditionKeys,
      riskKeys,
      missingOrUncertainKeys,
      assumptionIds,
      true,
    )
  }

  if (input.drainageCondition === 'poor') {
    matchedRuleIds.push('escalate_waterlogging')
    riskKeys.push('risk_waterlogging')
    return buildTrace(
      'escalate',
      matchedRuleIds,
      supportingConditionKeys,
      riskKeys,
      missingOrUncertainKeys,
      assumptionIds,
      true,
    )
  }

  if (input.waterSource === 'limited' && input.drainageCondition === 'moderate') {
    matchedRuleIds.push('escalate_combined_water_risk')
    riskKeys.push('risk_limited_water', 'risk_moderate_drainage')
    return buildTrace(
      'escalate',
      matchedRuleIds,
      supportingConditionKeys,
      riskKeys,
      missingOrUncertainKeys,
      assumptionIds,
      true,
    )
  }

  const month = input.plantingMonth
  const suitableMonth =
    month !== null &&
    (PROTOTYPE_SUITABLE_MONTHS as readonly number[]).includes(month)
  const edgeMonth =
    month !== null &&
    (PROTOTYPE_EDGE_MONTHS as readonly number[]).includes(month)
  const outsideWindow = month !== null && !suitableMonth && !edgeMonth

  if (outsideWindow) {
    matchedRuleIds.push('escalate_outside_window')
    riskKeys.push('risk_outside_window')
    return buildTrace(
      'escalate',
      matchedRuleIds,
      supportingConditionKeys,
      riskKeys,
      missingOrUncertainKeys,
      assumptionIds,
      true,
    )
  }

  let classification: GuidanceClassification = 'suitable'

  if (input.fieldType === 'lowland_paddy') {
    supportingConditionKeys.push('support_lowland_paddy')
    matchedRuleIds.push('support_field_type')
  } else if (input.fieldType === 'upland' || input.fieldType === 'other') {
    classification = 'borderline'
    riskKeys.push('risk_field_type')
    matchedRuleIds.push('borderline_field_type')
  } else if (input.fieldType === 'unsure') {
    classification = 'borderline'
    missingOrUncertainKeys.push('uncertain_field_type')
    matchedRuleIds.push('borderline_field_type_unsure')
  }

  if (input.previousCrop === 'rice') {
    supportingConditionKeys.push('support_previous_rice')
    matchedRuleIds.push('support_previous_crop')
  } else if (
    input.previousCrop === 'mung_bean' ||
    input.previousCrop === 'another_legume'
  ) {
    classification = 'borderline'
    riskKeys.push('risk_previous_legume')
    matchedRuleIds.push('borderline_previous_legume')
  } else if (input.previousCrop === 'unsure' || input.previousCrop === 'other') {
    classification = 'borderline'
    missingOrUncertainKeys.push('uncertain_previous_crop')
    matchedRuleIds.push('borderline_previous_crop')
  } else if (input.previousCrop === 'none') {
    supportingConditionKeys.push('support_no_previous_conflict')
  }

  if (suitableMonth) {
    supportingConditionKeys.push('support_timing_window')
    matchedRuleIds.push('support_timing')
  } else if (edgeMonth) {
    classification = 'borderline'
    riskKeys.push('risk_edge_timing')
    matchedRuleIds.push('borderline_timing')
  }

  if (
    input.waterSource === 'irrigated' ||
    input.waterSource === 'residual_moisture' ||
    input.waterSource === 'rainfed'
  ) {
    supportingConditionKeys.push('support_water')
    matchedRuleIds.push('support_water')
  } else if (input.waterSource === 'limited') {
    classification = 'borderline'
    riskKeys.push('risk_limited_water')
    matchedRuleIds.push('borderline_limited_water')
  }

  if (input.drainageCondition === 'good') {
    supportingConditionKeys.push('support_drainage')
    matchedRuleIds.push('support_drainage')
  } else if (input.drainageCondition === 'moderate') {
    classification = 'borderline'
    riskKeys.push('risk_moderate_drainage')
    matchedRuleIds.push('borderline_drainage')
  }

  if (input.soilKnowledge === 'yes') {
    supportingConditionKeys.push('support_soil_known')
  } else {
    classification = 'borderline'
    missingOrUncertainKeys.push('uncertain_soil')
    matchedRuleIds.push('borderline_soil')
  }

  if (classification === 'suitable') {
    matchedRuleIds.push('suitable_base')
  }

  return buildTrace(
    classification,
    matchedRuleIds,
    supportingConditionKeys,
    riskKeys,
    [...new Set(missingOrUncertainKeys)],
    assumptionIds,
    false,
  )
}

function buildTrace(
  classification: GuidanceClassification,
  matchedRuleIds: string[],
  supportingConditionKeys: string[],
  riskKeys: string[],
  missingOrUncertainKeys: string[],
  assumptionIds: string[],
  hardEscalate: boolean,
): DecisionTrace {
  return {
    classification,
    matchedRuleIds: [...new Set(matchedRuleIds)],
    supportingConditionKeys: [...new Set(supportingConditionKeys)],
    riskKeys: [...new Set(riskKeys)],
    missingOrUncertainKeys: [...new Set(missingOrUncertainKeys)],
    assumptionIds,
    hardEscalate,
  }
}
