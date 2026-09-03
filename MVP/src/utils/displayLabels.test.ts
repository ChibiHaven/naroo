import { describe, expect, it } from 'vitest'
import {
  cleanDisplayedText,
  displayConcernLabel,
  displayDistrictName,
  displayMonthName,
  displayProvinceName,
  whyStatusItems,
} from '@/utils/displayLabels'
import { t } from '@/i18n/translations'

describe('display labels', () => {
  it('uses existing district and province names', () => {
    expect(displayProvinceName('roi_et', 'th')).toBe('ร้อยเอ็ด')
    expect(displayProvinceName('roi_et', 'en')).toBe('Roi Et')
    expect(displayDistrictName('phon_thong', 'th')).toBe('โพนทอง')
    expect(displayDistrictName('phon_thong', 'en')).toBe('Phon Thong')
    expect(displayDistrictName('selaphum', 'en')).toBe('Selaphum')
  })

  it('localizes planting months by name', () => {
    expect(displayMonthName(1, 'en')).toBe('January')
    expect(displayMonthName(1, 'th')).toBe('มกราคม')
    expect(displayMonthName(12, 'en')).toBe('December')
  })

  it('localizes borderline reason codes', () => {
    expect(displayConcernLabel('field_type', 'en')).toMatch(/field/i)
    expect(displayConcernLabel('planting_month_edge', 'en')).toMatch(/edge/i)
    expect(displayConcernLabel('drainage_moderate', 'en')).toMatch(/moderate/i)
    expect(displayConcernLabel('soil_knowledge', 'th')).toContain('ดิน')
    expect(displayConcernLabel('field_type', 'en')).not.toContain('field_type')
  })

  it('cleans known machine tokens from AI text without guessing', () => {
    const raw =
      'จังหวัด roi_et อำเภอ phon_thong ประเภทแปลง lowland_paddy พืชก่อนหน้า rice แหล่งน้ำ irrigated การระบายน้ำ good soilKnowledge: yes learn_mung_bean "suitable" R3_DRAINAGE_POOR'
    const th = cleanDisplayedText(raw, 'th')
    const en = cleanDisplayedText(raw, 'en')
    for (const text of [th, en]) {
      expect(text).not.toMatch(/roi_et/)
      expect(text).not.toMatch(/phon_thong/)
      expect(text).not.toMatch(/lowland_paddy/)
      expect(text).not.toMatch(/learn_mung_bean/)
      expect(text).not.toMatch(/R3_DRAINAGE_POOR/)
      expect(text).not.toMatch(/soilKnowledge/)
    }
    expect(th).toContain('ร้อยเอ็ด')
    expect(th).toContain('โพนทอง')
    expect(th).not.toMatch(/borderline/i)
    expect(th).not.toMatch(/lowland paddy/i)
    expect(en).toContain('Roi Et')
    expect(en).toContain('Phon Thong')
    expect(en).toContain('Irrigated')
  })

  it('keeps the suitable why-status copy and escalate drainage reason', () => {
    expect(whyStatusItems('en', 'suitable', [], [], null)).toEqual([
      t('en', 'why_suitable'),
    ])
    expect(whyStatusItems('th', 'suitable', [], [], null)[0]).toContain(
      'ไม่พบเงื่อนไขที่ต้องระวัง',
    )
    const escalate = whyStatusItems(
      'en',
      'escalate',
      [
        {
          id: 'R3_DRAINAGE_POOR',
          description: 'Poor drainage',
          result: 'escalate',
        },
      ],
      [],
      'R3_DRAINAGE_POOR',
    )
    expect(escalate.some((item) => /drainage|waterlog/i.test(item))).toBe(true)
    expect(escalate.join(' ')).not.toContain('R3_DRAINAGE_POOR')
  })

  it('rewrites remaining Thai machine prose without changing English Borderline', () => {
    const raw =
      'This borderline lowland paddy field has ไม่มีข้อมูลความรู้เกี่ยวกับคุณสมบัติของดิน (ไม่มีข้อมูลดิน)'
    const th = cleanDisplayedText(raw, 'th')
    expect(th).toContain('ควรตรวจสอบเพิ่มเติม')
    expect(th).toContain('นาลุ่ม')
    expect(th).toContain('ยังไม่มีข้อมูลดิน')
    expect(th).not.toMatch(/borderline/i)
    expect(th).not.toMatch(/lowland paddy/i)
    expect(th).not.toContain('ไม่มีข้อมูลความรู้เกี่ยวกับคุณสมบัติของดิน')
    expect(cleanDisplayedText('Borderline field', 'en')).toContain('Borderline')
  })
})
