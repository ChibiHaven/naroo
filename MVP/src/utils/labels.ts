import { getDistrict, getProvince } from '@/config/locations'
import type { FarmAssessmentInput, LanguageCode } from '@/types/assessment'
import { t } from '@/i18n/translations'

export function labelProvince(
  provinceId: string,
  language: LanguageCode,
): string {
  const province = getProvince(provinceId)
  if (!province) {
    return provinceId || t(language, 'not_selected')
  }
  return language === 'th' ? province.nameTh : province.nameEn
}

export function labelDistrict(
  provinceId: string,
  districtId: string,
  language: LanguageCode,
): string {
  const district = getDistrict(provinceId, districtId)
  if (district) {
    return language === 'th' ? district.nameTh : district.nameEn
  }
  return districtId || t(language, 'not_selected')
}

export function summarizeAssessment(
  input: FarmAssessmentInput,
  language: LanguageCode,
) {
  const fieldTypeKey =
    input.fieldType === 'lowland_paddy'
      ? 'field_lowland'
      : input.fieldType === 'upland'
        ? 'field_upland'
        : input.fieldType === 'other'
          ? 'field_other'
          : input.fieldType === 'unsure'
            ? 'field_unsure'
            : 'not_selected'

  const previousKey =
    input.previousCrop === 'rice'
      ? 'previous_rice'
      : input.previousCrop === 'mung_bean'
        ? 'previous_mung_bean'
        : input.previousCrop === 'another_legume'
          ? 'previous_another_legume'
          : input.previousCrop === 'other'
            ? 'previous_other'
            : input.previousCrop === 'none'
              ? 'previous_none'
              : input.previousCrop === 'unsure'
                ? 'previous_unsure'
                : 'not_selected'

  const waterKey =
    input.waterSource === 'irrigated'
      ? 'water_irrigated'
      : input.waterSource === 'residual_moisture'
        ? 'water_residual'
        : input.waterSource === 'rainfed'
          ? 'water_rainfed'
          : input.waterSource === 'limited'
            ? 'water_limited'
            : input.waterSource === 'unsure'
              ? 'water_unsure'
              : 'not_selected'

  const drainageKey =
    input.drainageCondition === 'good'
      ? 'drainage_good'
      : input.drainageCondition === 'moderate'
        ? 'drainage_moderate'
        : input.drainageCondition === 'poor'
          ? 'drainage_poor'
          : input.drainageCondition === 'unsure'
            ? 'drainage_unsure'
            : 'not_selected'

  const goalKey =
    input.decisionGoal === 'improve_soil'
      ? 'goal_improve_soil'
      : input.decisionGoal === 'use_productively'
        ? 'goal_use_productively'
        : input.decisionGoal === 'add_crop'
          ? 'goal_add_crop'
          : input.decisionGoal === 'learn_mung_bean'
            ? 'goal_learn_mung_bean'
            : input.decisionGoal === 'other'
              ? 'goal_other'
              : input.decisionGoal === 'unsure'
                ? 'goal_unsure'
                : 'not_selected'

  const soil =
    input.soilKnowledge === 'yes'
      ? input.soilType?.trim()
        ? `${t(language, 'soil_known_prefix')}: ${input.soilType}`
        : t(language, 'soil_yes')
      : input.soilKnowledge === 'no'
        ? t(language, 'soil_no')
        : input.soilKnowledge === 'unsure'
          ? t(language, 'soil_unsure')
          : t(language, 'soil_unknown')

  return {
    province: labelProvince(input.province, language),
    district: labelDistrict(input.province, input.district, language),
    fieldType:
      input.fieldType === 'other' && input.fieldTypeOther
        ? input.fieldTypeOther
        : t(language, fieldTypeKey),
    previousCrop:
      input.previousCrop === 'other' && input.previousCropOther
        ? input.previousCropOther
        : t(language, previousKey),
    plantingMonth:
      input.plantingMonth !== null
        ? t(language, `month_${input.plantingMonth}`)
        : t(language, 'not_selected'),
    waterSource: t(language, waterKey),
    drainageCondition: t(language, drainageKey),
    farmArea:
      input.farmAreaRai !== null && input.farmAreaRai !== undefined
        ? `${input.farmAreaRai} ${t(language, 'rai')}`
        : t(language, 'not_selected'),
    soil,
    decisionGoal:
      input.decisionGoal === 'other' && input.decisionGoalOther
        ? input.decisionGoalOther
        : t(language, goalKey),
  }
}
