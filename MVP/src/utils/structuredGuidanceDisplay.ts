import type { FarmAssessmentInput, LanguageCode } from '@/types/assessment'
import type { NarooGuidanceResponse, NarooWeather } from '@/types/n8nApi'
import { t } from '@/i18n/translations'
import {
  cleanDisplayedText,
  displayDistrictName,
  displayMonthName,
  displayOptionLabel,
  displayProvinceName,
  sentenceForActiveCondition,
  structuredHeadline,
} from '@/utils/displayLabels'

const INTERNAL_FIELD_NAMES =
  /\b(province|district|fieldType|previousCrop|plantingMonth|waterSource|drainageCondition|soilKnowledge|soilType|decisionGoal|matchedRuleId|borderlineReasons|classification|ruleIds|hardEscalate|requiresExpertSupport)\b/

const KEY_VALUE_DUMP = /[A-Za-z][A-Za-z0-9_]*\s*=\s*\S/
const RULE_ID = /\bR\d+_[A-Z0-9_]+\b/
const SNAKE_CASE = /\b[a-z]+(?:_[a-z0-9]+)+\b/
const WEATHER_CLAIM =
  /weather|forecast|rainfall|precipitation|พยากรณ์|อากาศ|ฝน/i

function isBlankDisplay(text: string): boolean {
  const trimmed = text.trim()
  return !trimmed || /^[-*•·.—–]+$/.test(trimmed)
}

function readRaw(record: Record<string, unknown>, key: string): unknown {
  return record[key]
}

function readString(
  record: Record<string, unknown>,
  key: string,
  fallback = '',
): string {
  const value = readRaw(record, key)
  return typeof value === 'string' ? value : fallback
}

export function plantingMonthValue(
  record: Record<string, unknown>,
  fallback: number | null,
): number | null {
  const value = readRaw(record, 'plantingMonth')
  if (typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 12) {
    return value
  }
  if (typeof value === 'string' && /^(1[0-2]|[1-9])$/.test(value.trim())) {
    return Number(value.trim())
  }
  return fallback
}

export function forecastCoversPlantingMonth(
  weather: NarooWeather,
  plantingMonth: number | null,
): boolean {
  if (!plantingMonth || weather.mode !== 'available' || weather.days.length === 0) {
    return false
  }
  return weather.days.some((day) => {
    const date = new Date(`${day.date}T00:00:00Z`)
    if (Number.isNaN(date.getTime())) {
      return false
    }
    return date.getUTCMonth() + 1 === plantingMonth
  })
}

function contradictsClassification(
  text: string,
  classification: NarooGuidanceResponse['classification'],
): boolean {
  const lower = text.toLowerCase()
  if (classification === 'escalate') {
    return (
      /\bborderline\b/.test(lower) ||
      /\bsuitable\b/.test(lower) ||
      text.includes('ควรตรวจสอบเพิ่มเติม') ||
      text.includes('น่าจะเหมาะสม') ||
      text.includes('ก้ำกึ่ง')
    )
  }
  if (classification === 'borderline') {
    return (
      (/\bsuitable\b/.test(lower) && !/not suitable/.test(lower)) ||
      text.includes('น่าจะเหมาะสม')
    )
  }
  if (classification === 'suitable') {
    return /\bescalate\b/.test(lower)
  }
  return false
}

const MONTH_NAME_TO_NUMBER: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
  มกราคม: 1,
  กุมภาพันธ์: 2,
  มีนาคม: 3,
  เมษายน: 4,
  พฤษภาคม: 5,
  มิถุนายน: 6,
  กรกฎาคม: 7,
  สิงหาคม: 8,
  กันยายน: 9,
  ตุลาคม: 10,
  พฤศจิกายน: 11,
  ธันวาคม: 12,
}

function forecastMonths(weather: NarooWeather): Set<number> {
  const months = new Set<number>()
  for (const day of weather.days) {
    const date = new Date(`${day.date}T00:00:00Z`)
    if (!Number.isNaN(date.getTime())) {
      months.add(date.getUTCMonth() + 1)
    }
  }
  return months
}

function mentionsMonthOutsideForecast(text: string, weather: NarooWeather): boolean {
  const covered = forecastMonths(weather)
  if (covered.size === 0) {
    return WEATHER_CLAIM.test(text)
  }
  const lower = text.toLowerCase()
  for (const [name, month] of Object.entries(MONTH_NAME_TO_NUMBER)) {
    if (lower.includes(name) && !covered.has(month)) {
      return true
    }
  }
  return false
}

export function shouldRejectAiNextStep(
  raw: string,
  classification: NarooGuidanceResponse['classification'],
  weather: NarooWeather,
  plantingMonth: number | null,
): boolean {
  const text = raw.trim()
  if (isBlankDisplay(text)) {
    return true
  }
  if (KEY_VALUE_DUMP.test(text) || RULE_ID.test(text) || SNAKE_CASE.test(text)) {
    return true
  }
  if (INTERNAL_FIELD_NAMES.test(text)) {
    return true
  }
  if (contradictsClassification(text, classification)) {
    return true
  }
  const weatherCovered = forecastCoversPlantingMonth(weather, plantingMonth)
  if (WEATHER_CLAIM.test(text) && !weatherCovered) {
    return true
  }
  if (WEATHER_CLAIM.test(text) && mentionsMonthOutsideForecast(text, weather)) {
    return true
  }
  if (WEATHER_CLAIM.test(text) && /plant|planting|ปลูก/i.test(text) && !weatherCovered) {
    return true
  }
  return false
}

export function suggestedNextSteps(
  language: LanguageCode,
  response: NarooGuidanceResponse,
  plantingMonth: number | null,
): { steps: string[]; usedAi: boolean } {
  const accepted: string[] = []
  for (const raw of response.aiExplanation.nextSteps) {
    if (
      shouldRejectAiNextStep(
        raw,
        response.classification,
        response.weather,
        plantingMonth,
      )
    ) {
      continue
    }
    const cleaned = cleanDisplayedText(raw, language)
    if (
      isBlankDisplay(cleaned) ||
      SNAKE_CASE.test(cleaned) ||
      RULE_ID.test(cleaned) ||
      KEY_VALUE_DUMP.test(cleaned) ||
      INTERNAL_FIELD_NAMES.test(cleaned)
    ) {
      continue
    }
    if (contradictsClassification(cleaned, response.classification)) {
      continue
    }
    accepted.push(cleaned)
  }

  if (accepted.length > 0) {
    return { steps: accepted, usedAi: true }
  }

  const fallback = [t(language, 'fallback_step_review_answers')]
  const missingCritical = response.decisionTrace.rules.some(
    (rule) => rule.id === 'R2_CRITICAL_INFO' && rule.result === 'escalate',
  )
  if (missingCritical) {
    fallback.push(t(language, 'fallback_step_collect_missing'))
  }
  if (response.requiresExpertSupport || response.classification === 'escalate') {
    fallback.push(t(language, 'fallback_step_consult_office'))
  }
  fallback.push(t(language, 'fallback_step_weather_context_only'))
  return { steps: fallback, usedAi: false }
}

export function structuredSummaryLines(
  language: LanguageCode,
  response: NarooGuidanceResponse,
  formInput: FarmAssessmentInput,
): Array<{ label: string; value: string }> {
  const echoed = response.input
  const districtId =
    readString(echoed, 'district', formInput.district) || formInput.district
  const provinceId =
    readString(echoed, 'province', formInput.province) || formInput.province
  const fieldType =
    readString(echoed, 'fieldType', formInput.fieldType) || formInput.fieldType
  const previousCrop =
    readString(echoed, 'previousCrop', formInput.previousCrop) ||
    formInput.previousCrop
  const waterSource =
    readString(echoed, 'waterSource', formInput.waterSource) ||
    formInput.waterSource
  const drainage =
    readString(echoed, 'drainageCondition', formInput.drainageCondition) ||
    formInput.drainageCondition
  const soilKnowledge =
    readString(echoed, 'soilKnowledge', formInput.soilKnowledge) ||
    formInput.soilKnowledge
  const month = plantingMonthValue(echoed, formInput.plantingMonth)
  const soilText = formInput.soilType?.trim() ?? ''

  const option = (code: string) => displayOptionLabel(code, language) ?? code

  const soilValue =
    soilKnowledge === 'yes' && soilText
      ? soilText
      : soilKnowledge === 'no'
        ? t(language, 'display_soil_no')
        : soilKnowledge === 'unsure'
          ? t(language, 'soil_unsure')
          : soilText || t(language, 'display_soil_yes')

  const confidenceKey =
    response.confidence === 'high'
      ? 'summary_confidence_high'
      : response.confidence === 'medium'
        ? 'summary_confidence_medium'
        : 'summary_confidence_low'

  const matched = sentenceForActiveCondition(
    response.decisionTrace.matchedRuleId ?? '',
    language,
    previousCrop,
  )

  const lines: Array<{ label: string; value: string }> = [
    {
      label: t(language, 'summary_district'),
      value: `${displayDistrictName(districtId, language, provinceId)}, ${displayProvinceName(provinceId, language)}`,
    },
    {
      label: t(language, 'summary_field_type'),
      value: option(fieldType),
    },
    {
      label: t(language, 'summary_previous'),
      value: option(previousCrop),
    },
    {
      label: t(language, 'summary_month'),
      value: month ? displayMonthName(month, language) : t(language, 'not_selected'),
    },
    {
      label: t(language, 'summary_water'),
      value: option(waterSource),
    },
    {
      label: t(language, 'summary_drainage'),
      value: option(drainage),
    },
    {
      label: t(language, 'summary_soil'),
      value: soilValue,
    },
    {
      label: t(language, 'your_farm_guidance'),
      value: t(
        language,
        response.classification === 'suitable'
          ? 'status_suitable'
          : response.classification === 'borderline'
            ? 'status_borderline'
            : 'status_escalate',
      ),
    },
    {
      label: t(language, 'confidence_level'),
      value: t(language, confidenceKey),
    },
  ]

  if (matched) {
    lines.push({
      label: t(language, 'summary_matched_condition'),
      value: matched,
    })
  }

  lines.push({
    label: t(language, 'expert_support'),
    value:
      response.requiresExpertSupport || response.classification === 'escalate'
        ? t(language, 'summary_expert_required')
        : t(language, 'summary_expert_not_required'),
  })

  if (response.weather.mode === 'available' && response.weather.days.length > 0) {
    lines.push({
      label: t(language, 'weather_context'),
      value: t(language, 'weather_context_live'),
    })
  }

  return lines.filter((line) => line.label.trim() && line.value.trim())
}

export function resultHeadline(
  language: LanguageCode,
  response: NarooGuidanceResponse,
  formInput: FarmAssessmentInput,
): string {
  const echoed = response.input
  const districtId =
    readString(echoed, 'district', formInput.district) || formInput.district
  const provinceId =
    readString(echoed, 'province', formInput.province) || formInput.province
  return structuredHeadline(
    language,
    response.classification,
    response.decisionTrace.matchedRuleId,
    districtId,
    provinceId,
  )
}
