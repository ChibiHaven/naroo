import { describe, expect, it } from 'vitest'
import { t } from '@/i18n/translations'

describe('translations', () => {
  it('covers revised mung-bean scope in English and Thai', () => {
    expect(t('en', 'get_farm_guidance')).toBe('Get Farm Guidance')
    expect(t('th', 'get_farm_guidance')).toBe('รับคำแนะนำสำหรับนา')
    expect(t('en', 'home_subheading').toLowerCase()).toContain('mung bean')
    expect(t('th', 'crop_mung_bean')).toContain('ถั่วเขียว')
    expect(t('en', 'status_borderline')).toBe('Borderline')
    expect(t('en', 'status_escalate')).toBe('Escalate')
    expect(t('en', 'prototype_banner')).toContain('PROTOTYPE GUIDANCE')
  })
})
