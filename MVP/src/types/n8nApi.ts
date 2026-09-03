import type { LanguageCode } from '@/types/assessment'

export type NarooClassification = 'suitable' | 'borderline' | 'escalate'
export type NarooConfidence = 'low' | 'medium' | 'high'

export interface NarooGuidanceRequest {
  province: 'roi_et'
  fieldType: string
  waterSource: string
  drainageCondition: string
  plantingMonth: number
  language?: LanguageCode
  district?: string
  previousCrop?: string
  farmAreaRai?: number
  soilKnowledge?: string
  soilType?: string
  decisionGoal?: string
  fieldTypeOther?: string
  previousCropOther?: string
  decisionGoalOther?: string
}

export interface NarooAiExplanation {
  generated: boolean
  language: LanguageCode
  headline: string
  summary: string
  nextSteps: string[]
}

export interface NarooWeatherDay {
  date: string
  weatherCode: number | null
  tempMax: number | null
  tempMin: number | null
  precipitationSum: number | null
  precipitationProbabilityMax: number | null
}

export interface NarooWeather {
  mode: 'available' | 'unavailable'
  source: string
  retrievedAt: string
  latitude: number
  longitude: number
  timezone: string
  forecastDays: number
  days: NarooWeatherDay[]
}

export interface NarooRuleEvaluation {
  id: string
  description: string
  result: 'pass' | 'borderline' | 'escalate' | 'suitable'
}

export interface NarooDecisionTrace {
  classification: NarooClassification
  confidence: NarooConfidence
  hardEscalate: boolean
  requiresExpertSupport: boolean
  matchedRuleId: string | null
  matchedRuleDescription: string | null
  ruleIds: string[]
  borderlineReasons: string[]
  rules: NarooRuleEvaluation[]
}

export interface NarooGuidanceResponse {
  classification: NarooClassification
  confidence: NarooConfidence
  requiresExpertSupport: boolean
  crop: 'mung_bean'
  ruleIds: string[]
  decisionTrace: NarooDecisionTrace
  borderlineReasons: string[]
  input: Record<string, unknown>
  language: LanguageCode
  dataMode: 'prototype'
  aiExplanation: NarooAiExplanation
  weather: NarooWeather
  meta: {
    requestId: string
    processedAt: string
  }
}

export interface NarooValidationFieldError {
  field: string
  message: string
}

export interface NarooValidationError {
  code: 'VALIDATION_ERROR'
  message: string
  dataMode: 'prototype'
  errors: NarooValidationFieldError[]
  meta: {
    requestId: string
    processedAt: string
  }
}

const CLASSIFICATIONS: NarooClassification[] = [
  'suitable',
  'borderline',
  'escalate',
]
const CONFIDENCES: NarooConfidence[] = ['low', 'medium', 'high']
const LANGUAGES: LanguageCode[] = ['en', 'th']

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

export function isNarooValidationError(
  value: unknown,
): value is NarooValidationError {
  if (!isObject(value)) {
    return false
  }
  return (
    value.code === 'VALIDATION_ERROR' &&
    typeof value.message === 'string' &&
    Array.isArray(value.errors)
  )
}

export function parseNarooGuidanceResponse(
  value: unknown,
): NarooGuidanceResponse | null {
  if (!isObject(value)) {
    return null
  }

  if (
    !CLASSIFICATIONS.includes(value.classification as NarooClassification) ||
    !CONFIDENCES.includes(value.confidence as NarooConfidence) ||
    typeof value.requiresExpertSupport !== 'boolean' ||
    value.crop !== 'mung_bean' ||
    !isStringArray(value.ruleIds) ||
    !isObject(value.decisionTrace) ||
    !isObject(value.aiExplanation) ||
    !isObject(value.weather) ||
    !isObject(value.meta)
  ) {
    return null
  }

  const ai = value.aiExplanation
  if (
    typeof ai.generated !== 'boolean' ||
    !LANGUAGES.includes(ai.language as LanguageCode) ||
    typeof ai.headline !== 'string' ||
    typeof ai.summary !== 'string' ||
    !isStringArray(ai.nextSteps)
  ) {
    return null
  }

  const weather = value.weather
  if (
    (weather.mode !== 'available' && weather.mode !== 'unavailable') ||
    typeof weather.source !== 'string' ||
    typeof weather.retrievedAt !== 'string' ||
    typeof weather.latitude !== 'number' ||
    typeof weather.longitude !== 'number' ||
    typeof weather.timezone !== 'string' ||
    typeof weather.forecastDays !== 'number' ||
    !Array.isArray(weather.days)
  ) {
    return null
  }

  const meta = value.meta
  if (
    typeof meta.requestId !== 'string' ||
    typeof meta.processedAt !== 'string'
  ) {
    return null
  }

  const trace = value.decisionTrace
  if (
    !CLASSIFICATIONS.includes(trace.classification as NarooClassification) ||
    !CONFIDENCES.includes(trace.confidence as NarooConfidence) ||
    typeof trace.hardEscalate !== 'boolean' ||
    typeof trace.requiresExpertSupport !== 'boolean' ||
    !isStringArray(trace.ruleIds) ||
    !isStringArray(trace.borderlineReasons) ||
    !Array.isArray(trace.rules)
  ) {
    return null
  }

  if (!isStringArray(value.borderlineReasons)) {
    return null
  }

  if (
    !LANGUAGES.includes(value.language as LanguageCode) ||
    value.dataMode !== 'prototype' ||
    !isObject(value.input)
  ) {
    return null
  }

  return value as unknown as NarooGuidanceResponse
}
