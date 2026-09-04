import { describe, expect, it } from 'vitest'
import { t } from '@/i18n/translations'

describe('translations', () => {
  it('covers revised mung-bean scope in English and Thai', () => {
    expect(t('en', 'get_farm_guidance')).toBe('Get Farm Guidance')
    expect(t('th', 'get_farm_guidance')).toBe('รับคำแนะนำสำหรับนา')
    expect(t('en', 'home_subheading').toLowerCase()).toContain('mung bean')
    expect(t('th', 'crop_mung_bean')).toContain('ถั่วเขียว')
    expect(t('en', 'status_borderline')).toBe('Further review recommended')
    expect(t('th', 'status_borderline')).toBe('ควรตรวจสอบเพิ่มเติม')
    expect(t('th', 'field_lowland')).toBe('นาลุ่ม')
    expect(t('en', 'weather_context_live')).toContain('seven-day weather forecast')
    expect(t('th', 'weather_context_live')).toContain('พยากรณ์อากาศ 7 วันปัจจุบัน')
    expect(t('en', 'weather_forecast_timing_note')).toContain(
      'does not affect NaRoo\'s rules-based classification',
    )
    expect(t('th', 'weather_forecast_timing_note')).toContain(
      'ไม่มีผลต่อการจัดประเภทตามกฎของ NaRoo',
    )
    expect(t('en', 'weather_context')).toBe('Weather context')
    expect(t('th', 'weather_context')).toBe('บริบทสภาพอากาศ')
    expect(t('en', 'status_escalate')).toBe('Expert review required')
    expect(t('en', 'prototype_banner')).toContain('PROTOTYPE GUIDANCE')
    expect(t('en', 'analyzing_wait_live')).toMatch(/one minute/i)
    expect(t('th', 'analyzing_wait_live')).toMatch(/นาที/)
    expect(t('en', 'retry_guidance')).toBe('Retry')
    expect(t('th', 'retry_guidance')).toBe('ลองอีกครั้ง')
    expect(t('en', 'edit_answers')).toBe('Edit answers')
    expect(t('th', 'edit_answers')).toBe('แก้ไขคำตอบ')
    expect(t('en', 'confidence_high')).not.toBe('confidence_high')
    expect(t('th', 'confidence_high')).not.toBe('confidence_high')
    expect(t('en', 'assumption_window_detail')).toContain('December and January')
    expect(t('en', 'assumption_window_detail')).toContain('November and February')
    expect(t('en', 'assumption_window_detail')).not.toContain('October')
    expect(t('th', 'assumption_window_detail')).toContain('ธันวาคม')
    expect(t('th', 'assumption_window_detail')).toContain('มกราคม')
    expect(t('th', 'assumption_window_detail')).toContain('พฤศจิกายน')
    expect(t('th', 'assumption_window_detail')).toContain('กุมภาพันธ์')
    expect(t('th', 'assumption_window_detail')).not.toContain('ตุลาคม')
    expect(t('en', 'status_suitable')).toBe('Likely suitable')
    expect(t('th', 'status_suitable')).toBe('น่าจะเหมาะสม')
    expect(t('en', 'status_escalate')).toBe('Expert review required')
    expect(t('th', 'status_escalate')).toBe('ควรปรึกษาผู้เชี่ยวชาญ')
    expect(t('en', 'next_steps')).toBe('Suggested next steps')
    expect(t('th', 'next_steps')).toBe('ขั้นตอนต่อไปที่แนะนำ')
    expect(t('en', 'headline_escalate_planting_month')).toContain(
      'outside the prototype window',
    )
    expect(t('th', 'headline_escalate_planting_month')).toContain(
      'นอกช่วงของกฎต้นแบบ',
    )
    expect(t('en', 'call_office')).toBe('Call office')
    expect(t('th', 'call_office')).toBe('โทรติดต่อ')
    expect(t('en', 'email_office')).toBe('Send email')
    expect(t('th', 'email_office')).toBe('ส่งอีเมล')
    expect(t('en', 'visit_official_website')).toBe('Open official website')
    expect(t('th', 'visit_official_website')).toBe('เปิดเว็บไซต์สำนักงาน')
    expect(t('en', 'contact_verify_notice')).toContain('verify them on the official website')
    expect(t('th', 'contact_verify_notice')).toContain('โปรดตรวจสอบกับเว็บไซต์ทางการ')
  })
})
