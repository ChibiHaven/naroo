import { beforeEach, describe, expect, it, vi } from 'vitest'
import { adaptNarooResponse } from '@/types/liveGuidance'
import {
  LIVE_GUIDANCE_STORAGE_KEY,
  LEGACY_LIVE_GUIDANCE_STORAGE_KEY,
  assessmentFingerprint,
  clearLiveGuidanceResult,
  loadLiveGuidanceResult,
  peekStoredResponse,
  saveLiveGuidanceResult,
} from '@/utils/liveResultStorage'
import { clearAssessmentSession } from '@/utils/sessionStorage'
import * as rulesEngine from '@/services/rulesEngine'
import {
  completeAssessmentInput,
  narooGuidanceResponse,
} from '@/test/narooFixtures'

describe('live guidance session storage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('restores a saved n8n result without replaying local rules', () => {
    const classifySpy = vi.spyOn(rulesEngine, 'classifyFarmAssessment')
    const input = completeAssessmentInput('en')
    const result = adaptNarooResponse(narooGuidanceResponse())
    saveLiveGuidanceResult(result, assessmentFingerprint(input), 'en')

    const restored = loadLiveGuidanceResult(assessmentFingerprint(input), 'en')
    expect(restored?.transport).toBe('n8n')
    expect(restored?.response.meta.requestId).toBe('req-test-001')
    expect(restored?.response.aiExplanation.headline).toContain('Mung bean')
    expect(restored?.response.weather.source).toBe('Open-Meteo')
    expect(classifySpy).not.toHaveBeenCalled()
  })

  it('stores English and Thai results separately for the same answers', () => {
    const input = completeAssessmentInput('en')
    const fingerprint = assessmentFingerprint(input)
    saveLiveGuidanceResult(
      adaptNarooResponse(narooGuidanceResponse({ language: 'en' })),
      fingerprint,
      'en',
    )
    saveLiveGuidanceResult(
      adaptNarooResponse(narooGuidanceResponse({ language: 'th' })),
      fingerprint,
      'th',
    )

    expect(
      loadLiveGuidanceResult(fingerprint, 'en')?.response.aiExplanation.headline,
    ).toContain('Mung bean')
    expect(
      loadLiveGuidanceResult(fingerprint, 'th')?.response.aiExplanation.headline,
    ).toContain('ถั่วเขียว')
  })

  it('ignores language when fingerprinting answers', () => {
    expect(
      assessmentFingerprint(completeAssessmentInput('en')),
    ).toBe(assessmentFingerprint(completeAssessmentInput('th')))
  })

  it('does not let a later save for one language overwrite the other', () => {
    const input = completeAssessmentInput('en')
    const fingerprint = assessmentFingerprint(input)
    saveLiveGuidanceResult(
      adaptNarooResponse(narooGuidanceResponse({ language: 'en' })),
      fingerprint,
      'en',
    )
    const englishHeadline =
      peekStoredResponse(fingerprint, 'en')?.aiExplanation.headline
    saveLiveGuidanceResult(
      adaptNarooResponse(narooGuidanceResponse({ language: 'th' })),
      fingerprint,
      'th',
    )
    expect(peekStoredResponse(fingerprint, 'en')?.aiExplanation.headline).toBe(
      englishHeadline,
    )
  })

  it('discards the legacy single-result cache', () => {
    const input = completeAssessmentInput('en')
    sessionStorage.setItem(
      LEGACY_LIVE_GUIDANCE_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        response: narooGuidanceResponse(),
      }),
    )
    expect(
      loadLiveGuidanceResult(assessmentFingerprint(input), 'en'),
    ).toBeNull()
    expect(sessionStorage.getItem(LEGACY_LIVE_GUIDANCE_STORAGE_KEY)).toBeNull()
  })

  it('clears the saved result with the assessment session', () => {
    const input = completeAssessmentInput('en')
    saveLiveGuidanceResult(
      adaptNarooResponse(narooGuidanceResponse()),
      assessmentFingerprint(input),
      'en',
    )
    expect(sessionStorage.getItem(LIVE_GUIDANCE_STORAGE_KEY)).toBeTruthy()
    clearAssessmentSession()
    expect(loadLiveGuidanceResult(assessmentFingerprint(input), 'en')).toBeNull()
    expect(sessionStorage.getItem(LIVE_GUIDANCE_STORAGE_KEY)).toBeNull()
  })

  it('discards an invalid stored payload instead of inventing a result', () => {
    const input = completeAssessmentInput('en')
    sessionStorage.setItem(
      LIVE_GUIDANCE_STORAGE_KEY,
      JSON.stringify({ version: 2, fingerprint: 'x', byLanguage: { en: { classification: 'suitable' } } }),
    )
    expect(
      loadLiveGuidanceResult(assessmentFingerprint(input), 'en'),
    ).toBeNull()
  })

  it('clearLiveGuidanceResult removes the bilingual cache', () => {
    const input = completeAssessmentInput('en')
    saveLiveGuidanceResult(
      adaptNarooResponse(narooGuidanceResponse()),
      assessmentFingerprint(input),
      'en',
    )
    clearLiveGuidanceResult()
    expect(sessionStorage.getItem(LIVE_GUIDANCE_STORAGE_KEY)).toBeNull()
  })
})
