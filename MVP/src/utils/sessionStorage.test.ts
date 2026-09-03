import { beforeEach, describe, expect, it } from 'vitest'
import {
  ASSESSMENT_STORAGE_KEY,
  LEGACY_ASSESSMENT_STORAGE_KEY,
  clearAssessmentSession,
  createFreshSession,
  loadAssessmentSession,
  saveAssessmentSession,
} from '@/utils/sessionStorage'

describe('session storage helpers', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('saves and restores a revised assessment session', () => {
    const session = createFreshSession('en')
    session.input.district = 'selaphum'
    session.input.fieldType = 'lowland_paddy'
    session.input.farmAreaRai = 5
    saveAssessmentSession(session)

    const restored = loadAssessmentSession()
    expect(restored?.input.district).toBe('selaphum')
    expect(restored?.input.fieldType).toBe('lowland_paddy')
    expect(restored?.version).toBe(2)
  })

  it('clears assessment progress', () => {
    const session = createFreshSession('th')
    session.input.district = 'phon_thong'
    saveAssessmentSession(session)
    clearAssessmentSession()
    expect(loadAssessmentSession()).toBeNull()
  })

  it('handles outdated or malformed stored data safely', () => {
    sessionStorage.setItem(
      LEGACY_ASSESSMENT_STORAGE_KEY,
      JSON.stringify({
        input: {
          riceVariety: 'rd15',
          plantingDate: '2024-06-01',
          district: 'selaphum',
          waterSource: 'rainfed',
        },
        resultId: 'suitable',
      }),
    )

    const migrated = loadAssessmentSession()
    expect(migrated).not.toBeNull()
    expect(migrated?.input.district).toBe('selaphum')
    expect(migrated?.input.waterSource).toBe('rainfed')
    expect(sessionStorage.getItem(LEGACY_ASSESSMENT_STORAGE_KEY)).toBeNull()

    sessionStorage.setItem(ASSESSMENT_STORAGE_KEY, '{not-json')
    expect(loadAssessmentSession()).toBeNull()
  })
})
