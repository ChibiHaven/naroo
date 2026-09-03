import type { FarmAssessmentInput, LanguageCode } from '@/types/assessment'
import {
  parseNarooGuidanceResponse,
  type NarooGuidanceResponse,
} from '@/types/n8nApi'
import { adaptNarooResponse, type LiveGuidanceResult } from '@/types/liveGuidance'
import { readJson, removeKey, writeJson } from '@/utils/sessionStorage'

export const LIVE_GUIDANCE_STORAGE_KEY = 'naroo.guidance.live.v2'
export const LEGACY_LIVE_GUIDANCE_STORAGE_KEY = 'naroo.guidance.live.v1'

interface StoredBilingualGuidance {
  version: 2
  fingerprint: string
  byLanguage: Partial<Record<LanguageCode, NarooGuidanceResponse>>
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Fingerprint of assessment answers, excluding UI language. */
export function assessmentFingerprint(input: FarmAssessmentInput): string {
  const { language: _language, ...answers } = input
  return JSON.stringify(answers)
}

function discardLegacyCache(): void {
  removeKey(LEGACY_LIVE_GUIDANCE_STORAGE_KEY)
}

function readCache(): StoredBilingualGuidance | null {
  discardLegacyCache()
  const raw = readJson<unknown>(LIVE_GUIDANCE_STORAGE_KEY)
  if (!isObject(raw) || raw.version !== 2 || typeof raw.fingerprint !== 'string') {
    return null
  }
  if (!isObject(raw.byLanguage)) {
    return null
  }
  const byLanguage: StoredBilingualGuidance['byLanguage'] = {}
  for (const language of ['en', 'th'] as const) {
    const parsed = parseNarooGuidanceResponse(raw.byLanguage[language])
    if (parsed) {
      byLanguage[language] = parsed
    }
  }
  return {
    version: 2,
    fingerprint: raw.fingerprint,
    byLanguage,
  }
}

export function saveLiveGuidanceResult(
  result: LiveGuidanceResult,
  fingerprint: string,
  language: LanguageCode,
): void {
  const existing = readCache()
  const byLanguage =
    existing && existing.fingerprint === fingerprint
      ? { ...existing.byLanguage }
      : {}
  byLanguage[language] = result.response
  const payload: StoredBilingualGuidance = {
    version: 2,
    fingerprint,
    byLanguage,
  }
  writeJson(LIVE_GUIDANCE_STORAGE_KEY, payload)
}

export function loadLiveGuidanceResult(
  fingerprint: string,
  language: LanguageCode,
): LiveGuidanceResult | null {
  const cache = readCache()
  if (!cache || cache.fingerprint !== fingerprint) {
    return null
  }
  const parsed = cache.byLanguage[language]
  if (!parsed) {
    return null
  }
  return adaptNarooResponse(parsed)
}

export function hasCachedLanguage(
  fingerprint: string,
  language: LanguageCode,
): boolean {
  return loadLiveGuidanceResult(fingerprint, language) !== null
}

export function hasAnyCachedResult(fingerprint: string): boolean {
  return hasCachedLanguage(fingerprint, 'en') || hasCachedLanguage(fingerprint, 'th')
}

export function peekStoredResponse(
  fingerprint: string,
  language: LanguageCode,
): NarooGuidanceResponse | null {
  const cache = readCache()
  if (!cache || cache.fingerprint !== fingerprint) {
    return null
  }
  return cache.byLanguage[language] ?? null
}

export function clearLiveGuidanceResult(): void {
  discardLegacyCache()
  removeKey(LIVE_GUIDANCE_STORAGE_KEY)
}
