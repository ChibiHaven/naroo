import { SUPPORTED_PROVINCES, getDistrict, getProvince } from '@/config/locations'
import type { LanguageCode } from '@/types/assessment'
import type { NarooRuleEvaluation } from '@/types/n8nApi'
import { t } from '@/i18n/translations'

const FIELD_TYPE_KEYS: Record<string, string> = {
  lowland_paddy: 'field_lowland',
  upland: 'field_upland',
  other: 'field_other',
  unsure: 'field_unsure',
}

const PREVIOUS_CROP_KEYS: Record<string, string> = {
  rice: 'previous_rice',
  mung_bean: 'previous_mung_bean',
  another_legume: 'previous_another_legume',
  other: 'previous_other',
  none: 'previous_none',
  unsure: 'previous_unsure',
}

const WATER_KEYS: Record<string, string> = {
  irrigated: 'water_irrigated',
  residual_moisture: 'water_residual',
  rainfed: 'water_rainfed',
  limited: 'water_limited',
  unsure: 'water_unsure',
}

const DRAINAGE_DISPLAY_KEYS: Record<string, string> = {
  good: 'display_drainage_good',
  moderate: 'display_drainage_moderate',
  poor: 'display_drainage_poor',
  unsure: 'display_drainage_unsure',
}

const SOIL_DISPLAY_KEYS: Record<string, string> = {
  yes: 'display_soil_yes',
  no: 'display_soil_no',
  unsure: 'soil_unsure',
}

const GOAL_KEYS: Record<string, string> = {
  improve_soil: 'goal_improve_soil',
  use_productively: 'goal_use_productively',
  add_crop: 'goal_add_crop',
  learn_mung_bean: 'goal_learn_mung_bean',
  other: 'goal_other',
  unsure: 'goal_unsure',
}

const CLASSIFICATION_KEYS: Record<string, string> = {
  suitable: 'status_suitable',
  borderline: 'status_borderline',
  escalate: 'status_escalate',
}

const CONCERN_KEYS: Record<string, string> = {
  field_type: 'concern_field_type',
  previous_crop: 'concern_previous_crop',
  previous_mung_bean: 'concern_previous_mung_bean',
  planting_month_edge: 'concern_planting_month_edge',
  water_source_limited: 'concern_water_source_limited',
  drainage_moderate: 'concern_drainage_moderate',
  soil_knowledge: 'concern_soil_knowledge',
  risk_waterlogging: 'risk_waterlogging',
  risk_limited_water: 'risk_limited_water',
  risk_moderate_drainage: 'risk_moderate_drainage',
  risk_field_type: 'risk_field_type',
  risk_previous_legume: 'risk_previous_legume',
  risk_edge_timing: 'risk_edge_timing',
  risk_outside_window: 'risk_outside_window',
  uncertain_soil: 'uncertain_soil',
  uncertain_field_type: 'uncertain_field_type',
  uncertain_previous_crop: 'uncertain_previous_crop',
}

const RULE_CODE_KEYS: Record<string, string> = {
  ...CONCERN_KEYS,
  R5_PLANTING_MONTH: 'rule_planting_month_outside',
  R5_PLANTING_MONTH_OUTSIDE: 'rule_planting_month_outside',
  R3_DRAINAGE_POOR: 'rule_drainage_poor',
  R2_CRITICAL_INFO: 'missing_uncertain',
  R1_FIELD_TYPE: 'concern_field_type',
  R2_PREVIOUS_CROP: 'concern_previous_crop',
  R4_PLANTING_MONTH_EDGE: 'concern_planting_month_edge',
  R5_WATER_LIMITED: 'concern_water_source_limited',
  R6_DRAINAGE_MODERATE: 'concern_drainage_moderate',
  R7_SOIL_KNOWLEDGE: 'concern_soil_knowledge',
  support_field_type: 'support_lowland_paddy',
  support_previous_crop: 'support_previous_rice',
  support_timing: 'support_timing_window',
  support_water: 'support_water',
  support_drainage: 'support_drainage',
  escalate_outside_scope: 'risk_outside_scope',
  escalate_waterlogging: 'rule_drainage_poor',
  escalate_combined_water_risk: 'risk_limited_water',
  escalate_outside_window: 'rule_planting_month_outside',
  escalate_missing_critical: 'missing_uncertain',
  borderline_field_type: 'concern_field_type',
  borderline_field_type_unsure: 'uncertain_field_type',
  borderline_previous_legume: 'concern_previous_mung_bean',
  borderline_previous_crop: 'concern_previous_crop',
  previous_mung_bean: 'concern_previous_mung_bean',
  previous_crop: 'concern_previous_crop',
  borderline_timing: 'concern_planting_month_edge',
  borderline_limited_water: 'concern_water_source_limited',
  borderline_drainage: 'concern_drainage_moderate',
  drainage_moderate: 'concern_drainage_moderate',
  planting_month_edge: 'concern_planting_month_edge',
  borderline_soil: 'concern_soil_knowledge',
}

function translatedOrNull(language: LanguageCode, key: string): string | null {
  const label = t(language, key)
  return label === key ? null : label
}

export function displayProvinceName(
  provinceId: string,
  language: LanguageCode,
): string {
  const province = getProvince(provinceId)
  if (!province) {
    return provinceId ? omitUnsafeTokens(provinceId) : t(language, 'not_selected')
  }
  if (language === 'th') {
    return province.nameTh.replace(/^จังหวัด\s*/, '')
  }
  return province.nameEn.replace(/\s+Province$/i, '')
}

export function displayDistrictName(
  districtId: string,
  language: LanguageCode,
  provinceId = 'roi_et',
): string {
  const district = getDistrict(provinceId, districtId)
  if (district) {
    return language === 'th' ? district.nameTh : district.nameEn
  }
  return districtId ? omitUnsafeTokens(districtId) : t(language, 'not_selected')
}

export function displayMonthName(
  month: number,
  language: LanguageCode,
): string {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return String(month)
  }
  return t(language, `month_${month}`)
}

export function displayOptionLabel(
  code: string,
  language: LanguageCode,
): string | null {
  const key =
    FIELD_TYPE_KEYS[code] ??
    PREVIOUS_CROP_KEYS[code] ??
    WATER_KEYS[code] ??
    DRAINAGE_DISPLAY_KEYS[code] ??
    SOIL_DISPLAY_KEYS[code] ??
    GOAL_KEYS[code] ??
    CLASSIFICATION_KEYS[code] ??
    CONCERN_KEYS[code] ??
    RULE_CODE_KEYS[code]
  if (!key) {
    return null
  }
  return translatedOrNull(language, key)
}

export function displayConcernLabel(
  reason: string,
  language: LanguageCode,
): string {
  const mapped = CONCERN_KEYS[reason] ?? RULE_CODE_KEYS[reason]
  if (mapped) {
    const label = translatedOrNull(language, mapped)
    if (label) {
      return label
    }
  }
  const option = displayOptionLabel(reason, language)
  if (option) {
    return option
  }
  const cleaned = cleanDisplayedText(reason, language)
  return cleaned || t(language, 'missing_uncertain')
}

export function displayRuleLabel(
  id: string,
  language: LanguageCode,
  description = '',
): string {
  const mapped = RULE_CODE_KEYS[id]
  if (mapped) {
    const label = translatedOrNull(language, mapped)
    if (label) {
      return label
    }
  }
  const option = displayOptionLabel(id, language)
  if (option) {
    return option
  }
  const cleaned = cleanDisplayedText(description, language)
  if (cleaned) {
    return cleaned
  }
  return t(language, 'missing_uncertain')
}

export function formatLocalizedDate(
  isoDate: string,
  language: LanguageCode,
): string {
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    const asFull = new Date(isoDate)
    if (Number.isNaN(asFull.getTime())) {
      return isoDate
    }
    return new Intl.DateTimeFormat(language === 'th' ? 'th-TH' : 'en-GB', {
      dateStyle: 'medium',
    }).format(asFull)
  }
  return new Intl.DateTimeFormat(language === 'th' ? 'th-TH' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatLocalizedDateTime(
  iso: string,
  language: LanguageCode,
): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return iso
  }
  return new Intl.DateTimeFormat(language === 'th' ? 'th-TH' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function allKnownCodes(): Array<{ code: string; label: (language: LanguageCode) => string }> {
  const items: Array<{ code: string; label: (language: LanguageCode) => string }> = []

  for (const province of SUPPORTED_PROVINCES) {
    items.push({
      code: province.id,
      label: (language) => displayProvinceName(province.id, language),
    })
    for (const district of province.districts) {
      items.push({
        code: district.id,
        label: (language) => displayDistrictName(district.id, language, province.id),
      })
    }
  }

  const optionMaps = [
    FIELD_TYPE_KEYS,
    PREVIOUS_CROP_KEYS,
    WATER_KEYS,
    DRAINAGE_DISPLAY_KEYS,
    SOIL_DISPLAY_KEYS,
    GOAL_KEYS,
    CONCERN_KEYS,
    RULE_CODE_KEYS,
  ]
  for (const map of optionMaps) {
    for (const code of Object.keys(map)) {
      if (!code.includes('_') && !/^R\d+_/.test(code)) {
        continue
      }
      items.push({
        code,
        label: (language) => displayOptionLabel(code, language) ?? code,
      })
    }
  }

  items.push({
    code: 'mung_bean',
    label: (language) => t(language, 'crop_mung_bean'),
  })

  return items
}

function phraseReplacements(language: LanguageCode): Array<[string, string]> {
  const pairs: Array<[string, string]> = []
  const codes = allKnownCodes()

  const prefixed = (prefixList: string[], code: string, value: string) => {
    for (const prefix of prefixList) {
      pairs.push([`${prefix} ${code}`, `${prefix} ${value}`])
      pairs.push([`${prefix}: ${code}`, `${prefix} ${value}`])
      pairs.push([`${prefix}:${code}`, `${prefix} ${value}`])
    }
  }

  for (const province of SUPPORTED_PROVINCES) {
    const label = displayProvinceName(province.id, language)
    prefixed(['จังหวัด', 'province', 'Province'], province.id, label)
  }

  for (const province of SUPPORTED_PROVINCES) {
    for (const district of province.districts) {
      const label = displayDistrictName(district.id, language, province.id)
      prefixed(['อำเภอ', 'district', 'District'], district.id, label)
    }
  }

  for (const [code, key] of Object.entries(FIELD_TYPE_KEYS)) {
    const label = t(language, key)
    prefixed(['ประเภทแปลง', 'field type', 'Field type'], code, label)
    pairs.push([`fieldType: ${code}`, label])
    pairs.push([`fieldType:${code}`, label])
  }

  for (const [code, key] of Object.entries(PREVIOUS_CROP_KEYS)) {
    const label = t(language, key)
    prefixed(['พืชก่อนหน้า', 'previous crop', 'Previous crop'], code, label)
    pairs.push([`previousCrop: ${code}`, label])
    pairs.push([`previousCrop:${code}`, label])
  }

  for (const [code, key] of Object.entries(WATER_KEYS)) {
    const label = t(language, key)
    prefixed(['แหล่งน้ำ', 'water source', 'Water source'], code, label)
    pairs.push([`waterSource: ${code}`, label])
    pairs.push([`waterSource:${code}`, label])
  }

  for (const [code, key] of Object.entries(DRAINAGE_DISPLAY_KEYS)) {
    const label = t(language, key)
    prefixed(
      ['การระบายน้ำ', 'drainage', 'Drainage'],
      code,
      label,
    )
    pairs.push([`drainageCondition: ${code}`, label])
    pairs.push([`drainageCondition:${code}`, label])
  }

  for (const [code, key] of Object.entries(SOIL_DISPLAY_KEYS)) {
    const label = t(language, key)
    pairs.push([`soilKnowledge: ${code}`, label])
    pairs.push([`soilKnowledge:${code}`, label])
    pairs.push([`soil knowledge: ${code}`, label])
    pairs.push([`Soil knowledge: ${code}`, label])
  }

  for (const [code, key] of Object.entries(GOAL_KEYS)) {
    const label = t(language, key)
    pairs.push([`decisionGoal: ${code}`, label])
    pairs.push([`decisionGoal:${code}`, label])
    prefixed(['เป้าหมาย', 'decision goal'], code, label)
  }

  for (let month = 1; month <= 12; month += 1) {
    const label = displayMonthName(month, language)
    prefixed(
      ['plantingMonth', 'planting month', 'Planting month', 'เดือน', 'เดือนที่ปลูก'],
      String(month),
      label,
    )
  }

  for (const [code, key] of Object.entries(CLASSIFICATION_KEYS)) {
    const label = t(language, key)
    pairs.push([`"${code}"`, label])
    pairs.push([`'${code}'`, label])
  }

  if (language === 'th') {
    for (const province of SUPPORTED_PROVINCES) {
      const thai = displayProvinceName(province.id, 'th')
      pairs.push([province.nameEn, thai])
      pairs.push([province.nameEn.replace(/\s+Province$/i, ''), thai])
      for (const district of province.districts) {
        pairs.push([district.nameEn, district.nameTh])
      }
    }
    pairs.push(['Upland field', t('th', 'field_upland')])
    pairs.push(['Upland', t('th', 'field_upland')])
    pairs.push(['Lowland paddy', t('th', 'field_lowland')])
    pairs.push(['Rainfed', t('th', 'water_rainfed')])
    pairs.push(['Irrigated', t('th', 'water_irrigated')])
    pairs.push(['Moderate drainage', t('th', 'display_drainage_moderate')])
    pairs.push(['Good drainage', t('th', 'display_drainage_good')])
    pairs.push(['Poor drainage', t('th', 'display_drainage_poor')])
  }

  for (const item of codes) {
    pairs.push([item.code, item.label(language)])
  }

  const unique = new Map<string, string>()
  for (const [from, to] of pairs) {
    if (from && to && from !== to && !unique.has(from)) {
      unique.set(from, to)
    }
  }

  return [...unique.entries()].sort((a, b) => b[0].length - a[0].length)
}

const UNSAFE_TOKEN = /\b(?:R\d+_[A-Z0-9_]+|[a-z]+(?:_[a-z0-9]+)+|[A-Z][A-Z0-9]+(?:_[A-Z0-9]+)+)\b/g

export function omitUnsafeTokens(text: string): string {
  return text
    .replace(UNSAFE_TOKEN, ' ')
    .replace(/[“”"'`]+/g, '')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function applyThaiProseCleanup(text: string): string {
  const pairs: Array<[string, string]> = [
    [
      'ไม่มีข้อมูลความรู้เกี่ยวกับคุณสมบัติของดิน (ไม่มีข้อมูลดิน)',
      'ยังไม่มีข้อมูลดิน',
    ],
    [
      'ไม่มีข้อมูลความรู้เกี่ยวกับคุณสมบัติของดิน (ยังไม่มีข้อมูลดิน)',
      'ยังไม่มีข้อมูลดิน',
    ],
    ['ไม่มีข้อมูลความรู้เกี่ยวกับคุณสมบัติของดิน', 'ยังไม่มีข้อมูลดิน'],
    ['Lowland Paddy', 'นาลุ่ม'],
    ['Lowland paddy', 'นาลุ่ม'],
    ['lowland paddy', 'นาลุ่ม'],
    ['Upland field', 'ที่ดอน'],
    ['Upland', 'ที่ดอน'],
    ['Rainfed', 'อาศัยน้ำฝน'],
    ['Irrigated', 'มีระบบชลประทาน'],
    ['borderline case', 'กรณีที่ควรตรวจสอบเพิ่มเติม'],
    ['Borderline case', 'กรณีที่ควรตรวจสอบเพิ่มเติม'],
    ['a borderline', 'กรณีที่ควรตรวจสอบเพิ่มเติม'],
    ['the borderline', 'กรณีที่ควรตรวจสอบเพิ่มเติม'],
    ['A borderline', 'กรณีที่ควรตรวจสอบเพิ่มเติม'],
    ['The borderline', 'กรณีที่ควรตรวจสอบเพิ่มเติม'],
  ]

  let next = text
  for (const [from, to] of pairs) {
    if (next.includes(from)) {
      next = next.split(from).join(to)
    }
  }

  next = next.replace(/\bborderline\b/gi, 'ควรตรวจสอบเพิ่มเติม')
  next = next.replace(/\bsuitable\b/gi, 'น่าจะเหมาะสม')
  next = next.replace(/\bescalate\b/gi, 'ควรปรึกษาผู้เชี่ยวชาญ')
  next = next.replace(/\bclassification\b/gi, 'ผลสถานะ')
  next = next.replace(/\bedge\b/gi, 'ช่วงก้ำกึ่ง')
  next = next.replace(/\bmoderate\b/gi, 'ปานกลาง')
  return next
}

export function cleanDisplayedText(
  text: string,
  language: LanguageCode,
): string {
  if (!text.trim()) {
    return ''
  }

  let next = text
  for (const [from, to] of phraseReplacements(language)) {
    if (next.includes(from)) {
      next = next.split(from).join(to)
    }
  }
  if (language === 'th') {
    next = applyThaiProseCleanup(next)
  }
  return omitUnsafeTokens(next)
}

export function sentenceForActiveCondition(
  id: string,
  language: LanguageCode,
  previousCrop = '',
): string | null {
  if (id === 'R2_CRITICAL_INFO') {
    return t(language, 'missing_uncertain')
  }

  if (
    id === 'previous_crop' ||
    id === 'borderline_previous_crop' ||
    id === 'R2_PREVIOUS_CROP' ||
    id === 'borderline_previous_legume' ||
    id === 'previous_mung_bean'
  ) {
    if (previousCrop === 'mung_bean' || id === 'previous_mung_bean' || id === 'borderline_previous_legume') {
      return t(language, 'concern_previous_mung_bean')
    }
    return t(language, 'concern_previous_crop')
  }

  const key = RULE_CODE_KEYS[id] ?? CONCERN_KEYS[id]
  if (!key || key === 'missing_uncertain') {
    return null
  }
  return translatedOrNull(language, key)
}

export function fallbackHeadline(
  language: LanguageCode,
  classification: 'suitable' | 'borderline' | 'escalate',
  districtId: string,
  provinceId: string,
): string {
  const key =
    classification === 'suitable'
      ? 'fallback_headline_suitable'
      : classification === 'borderline'
        ? 'fallback_headline_borderline'
        : 'fallback_headline_escalate'
  return t(language, key, {
    district: displayDistrictName(districtId, language, provinceId),
    province: displayProvinceName(provinceId, language),
  })
}

export function structuredHeadline(
  language: LanguageCode,
  classification: 'suitable' | 'borderline' | 'escalate',
  matchedRuleId: string | null,
  districtId: string,
  provinceId: string,
): string {
  if (classification === 'suitable') {
    return fallbackHeadline(language, 'suitable', districtId, provinceId)
  }
  if (classification === 'borderline') {
    return t(language, 'fallback_headline_borderline')
  }

  const matched = matchedRuleId ?? ''
  if (
    matched === 'R5_PLANTING_MONTH' ||
    matched === 'R5_PLANTING_MONTH_OUTSIDE' ||
    matched === 'escalate_outside_window'
  ) {
    return t(language, 'headline_escalate_planting_month')
  }
  if (matched === 'R3_DRAINAGE_POOR' || matched === 'escalate_waterlogging') {
    return t(language, 'headline_escalate_drainage')
  }
  return fallbackHeadline(language, 'escalate', districtId, provinceId)
}

export function headlineForDisplay(
  _rawHeadline: string,
  language: LanguageCode,
  classification: 'suitable' | 'borderline' | 'escalate',
  districtId: string,
  provinceId: string,
  matchedRuleId: string | null = null,
): string {
  return structuredHeadline(
    language,
    classification,
    matchedRuleId,
    districtId,
    provinceId,
  )
}

function isActiveRuleResult(
  result: NarooRuleEvaluation['result'],
): boolean {
  return result === 'escalate' || result === 'borderline' || result === 'suitable'
}

export function whyStatusItems(
  language: LanguageCode,
  classification: 'suitable' | 'borderline' | 'escalate',
  rules: NarooRuleEvaluation[],
  borderlineReasons: string[],
  matchedRuleId: string | null,
  previousCrop = '',
): string[] {
  if (classification === 'suitable') {
    return [t(language, 'why_suitable')]
  }

  const items: string[] = []
  const seen = new Set<string>()
  const push = (value: string | null) => {
    if (!value || seen.has(value)) {
      return
    }
    seen.add(value)
    items.push(value)
  }

  const activeRules = rules.filter((rule) => isActiveRuleResult(rule.result))
  for (const rule of activeRules) {
    if (rule.id === 'R2_CRITICAL_INFO' && rule.result !== 'escalate') {
      continue
    }
    push(sentenceForActiveCondition(rule.id, language, previousCrop))
  }

  if (
    matchedRuleId &&
    !activeRules.some((rule) => rule.id === matchedRuleId)
  ) {
    if (matchedRuleId !== 'R2_CRITICAL_INFO') {
      push(sentenceForActiveCondition(matchedRuleId, language, previousCrop))
    }
  }

  for (const reason of borderlineReasons) {
    push(sentenceForActiveCondition(reason, language, previousCrop))
  }

  if (items.length > 0) {
    return items
  }
  return [
    classification === 'borderline'
      ? t(language, 'why_borderline_fallback')
      : t(language, 'why_escalate_fallback'),
  ]
}

export const OPEN_METEO_PAGE_URL = 'https://open-meteo.com/'

export function openMeteoHref(source: string): string {
  const trimmed = source.trim()
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  return OPEN_METEO_PAGE_URL
}
