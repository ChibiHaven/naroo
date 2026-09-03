import type { GuidanceClassification } from '@/types/assessment'

export type GuidanceDataMode = 'prototype' | 'live'

export type ConfidenceLevel = 'low' | 'medium' | 'high'

export interface GuidanceSource {
  kind?: 'prototype_rules' | 'open_meteo'
  title: string
  organization?: string
  geographicScope?: string
  referencePeriod?: string
  retrievedAt?: string
  url?: string
  limitation?: string
  timezone?: string
  connected: boolean
}

export interface GuidanceAssumption {
  id: string
  labelKey: string
  detailKey: string
  provisional: boolean
}

export interface DecisionTrace {
  classification: GuidanceClassification
  matchedRuleIds: string[]
  supportingConditionKeys: string[]
  riskKeys: string[]
  missingOrUncertainKeys: string[]
  assumptionIds: string[]
  hardEscalate: boolean
}

export interface FarmGuidanceResult {
  classification: GuidanceClassification
  headlineKey: string
  summaryKey: string
  crop: 'mung_bean'
  supportingConditions: string[]
  risks: string[]
  missingOrUncertain: string[]
  assumptionIds: string[]
  limitations: string[]
  confidence: ConfidenceLevel
  confidenceLabelKey: string
  sources: GuidanceSource[]
  requiresExpertSupport: boolean
  dataMode: GuidanceDataMode
  prototypeBanner: string
  decisionTrace: DecisionTrace
  weatherContextKey: string
}

export type WeatherDataMode = 'demonstration' | 'unavailable' | 'live'

export interface WeatherDay {
  labelKey: string
  summaryKey: string
}

export interface WeatherSnapshot {
  mode: WeatherDataMode
  locationLabelKey: string
  periodLabelKey: string
  days: WeatherDay[]
  interpretationKey: string
  limitationKey: string
  sourceNoteKey: string
}
