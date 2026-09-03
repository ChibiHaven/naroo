import type { GuidanceClassification } from '@/types/assessment'
import type {
  NarooConfidence,
  NarooGuidanceResponse,
  NarooWeather,
} from '@/types/n8nApi'
import type { GuidanceSource } from '@/types/guidance'
import { PROTOTYPE_ASSUMPTIONS } from '@/config/prototypeAssumptions'

/** Production/live assessment result backed by an n8n response. */
export interface LiveGuidanceResult {
  transport: 'n8n'
  response: NarooGuidanceResponse
  /** Display-only rule descriptions that passed / supported the outcome. */
  supportingRuleDescriptions: string[]
  /** Display-only borderline reasons from the API (plain text). */
  borderlineReasons: string[]
  /** Static prototype assumption ids kept as local reference content. */
  staticAssumptionIds: string[]
  /** Static limitation translation keys. */
  staticLimitationKeys: string[]
  /** Combined sources: static placeholder + dynamic Open-Meteo when present. */
  sources: GuidanceSource[]
}

export function statusLabelKey(
  classification: GuidanceClassification,
): 'status_suitable' | 'status_borderline' | 'status_escalate' {
  if (classification === 'suitable') {
    return 'status_suitable'
  }
  if (classification === 'borderline') {
    return 'status_borderline'
  }
  return 'status_escalate'
}

export function confidenceLabelKey(
  confidence: NarooConfidence,
): 'confidence_low' | 'confidence_medium' | 'confidence_high' {
  if (confidence === 'high') {
    return 'confidence_high'
  }
  if (confidence === 'medium') {
    return 'confidence_medium'
  }
  return 'confidence_low'
}

export function buildSourcesFromWeather(
  weather: NarooWeather,
): GuidanceSource[] {
  const staticSource: GuidanceSource = {
    kind: 'prototype_rules',
    title: 'Prototype rule basis',
    connected: false,
  }

  if (!weather.source) {
    return [staticSource]
  }

  return [
    staticSource,
    {
      kind: 'open_meteo',
      title: 'Open-Meteo',
      retrievedAt: weather.retrievedAt,
      connected: weather.mode === 'available',
      url: weather.source,
      geographicScope: `${weather.latitude}, ${weather.longitude}`,
      referencePeriod: `${weather.forecastDays}`,
      timezone: weather.timezone,
      limitation:
        weather.mode === 'unavailable'
          ? 'Weather data was unavailable for this request.'
          : undefined,
    },
  ]
}

export function adaptNarooResponse(
  response: NarooGuidanceResponse,
): LiveGuidanceResult {
  const supportingRuleDescriptions = response.decisionTrace.rules
    .filter(
      (rule) => rule.result === 'pass' || rule.result === 'suitable',
    )
    .map((rule) => rule.description)
    .filter((text) => text.trim().length > 0)

  return {
    transport: 'n8n',
    response,
    supportingRuleDescriptions,
    borderlineReasons: [...response.borderlineReasons],
    staticAssumptionIds: PROTOTYPE_ASSUMPTIONS.map((item) => item.id),
    staticLimitationKeys: [
      'limitation_prototype_only',
      'limitation_no_live_sources',
      'limitation_not_guarantee',
    ],
    sources: buildSourcesFromWeather(response.weather),
  }
}
